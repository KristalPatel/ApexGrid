import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import 'dotenv/config'
import pool from './db.js'
import { TABLES, AGGREGATES, OPERATORS, JOIN_TYPES, okTable, okColumn, okIn } from './allowed.js'

const app = express()
app.use(cors())
app.use(express.json())

// Small wrapper so every route returns a clean error instead of crashing.
const route = (fn) => async (req, res) => {
  try {
    res.json(await fn(req, res))
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

// ---------- Login (uses user_login table) ----------
// TODO: change column names to match your user_login table.
app.post('/api/login', route(async (req) => {
  const { username, password } = req.body
  const [rows] = await pool.query(
    'SELECT username, password_hash, role_name FROM user_login WHERE username = ?',
    [username]
  )
  if (!rows.length) throw new Error('Wrong username or password')
  const ok = await bcrypt.compare(password, rows[0].password_hash)
  if (!ok) throw new Error('Wrong username or password')
  return { username: rows[0].username, role: rows[0].role_name }
}))

// ---------- Display (Q1) ----------
app.get('/api/table/:name', route(async (req) => {
  const t = okTable(req.params.name)
  const [rows] = await pool.query(`SELECT ${t.columns.join(', ')} FROM ${req.params.name}`)
  return rows
}))

// ---------- Dashboard (Section E) ----------
app.get('/api/stats', route(async () => {
  const out = []
  for (const name of Object.keys(TABLES)) {
    const [r] = await pool.query(`SELECT COUNT(*) AS count FROM ${name}`)
    out.push({ table: name, count: r[0].count })
  }
  return out
}))

// ---------- Insert (Q2) ----------
app.post('/api/insert', route(async (req) => {
  const { table, row } = req.body
  const t = okTable(table)
  const cols = Object.keys(row).filter((c) => t.columns.includes(c) && row[c] !== '')
  if (!cols.length) throw new Error('Nothing to insert')
  const sql = `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`
  await pool.query(sql, cols.map((c) => row[c]))
  return { ok: true }
}))

// ---------- Update (Q8) ----------
app.put('/api/update', route(async (req) => {
  const { table, id, changes } = req.body
  const t = okTable(table)
  const cols = Object.keys(changes).filter((c) => t.columns.includes(c) && c !== t.id && changes[c] !== '')
  if (!cols.length) throw new Error('Nothing to update')
  const sql = `UPDATE ${table} SET ${cols.map((c) => `${c} = ?`).join(', ')} WHERE ${t.id} = ?`
  await pool.query(sql, [...cols.map((c) => changes[c]), id])
  return { ok: true }
}))

// ---------- Delete ----------
app.delete('/api/delete', route(async (req) => {
  const { table, id } = req.body
  const t = okTable(table)
  await pool.query(`DELETE FROM ${table} WHERE ${t.id} = ?`, [id])
  return { ok: true }
}))

// ---------- Aggregate (Q3) ----------
app.get('/api/aggregate', route(async (req) => {
  const { table, fn, col } = req.query
  okTable(table)
  okIn(AGGREGATES, fn, 'Function')
  okColumn(table, col)
  const [r] = await pool.query(`SELECT ${fn}(${col}) AS result FROM ${table}`)
  return { result: r[0].result }
}))

// ---------- Filter with condition (Q4) ----------
app.get('/api/filter', route(async (req) => {
  const { table, col, op, val } = req.query
  const t = okTable(table)
  okColumn(table, col)
  okIn(OPERATORS, op, 'Operator')
  const value = op === 'LIKE' ? `%${val}%` : val
  const [rows] = await pool.query(
    `SELECT ${t.columns.join(', ')} FROM ${table} WHERE ${col} ${op} ?`,
    [value]
  )
  return rows
}))

// ---------- Join (Q5) ----------
// TODO: adjust table and column names to your schema.
app.get('/api/join', route(async (req) => {
  const type = okIn(JOIN_TYPES, req.query.type, 'Join type')
  const [rows] = await pool.query(
    `SELECT d.full_name AS driver, t.team_name AS team, t.team_chief
       FROM driver d ${type} team t ON d.team_name = t.team_name`
  )
  return rows
}))

// ---------- Subquery (Q6) and correlated subquery (Q7) ----------
// TODO: adjust to your schema.
app.get('/api/subquery', route(async (req) => {
  const option = req.query.option
  if (option === 'winners') {
    const [rows] = await pool.query(
      'SELECT * FROM driver WHERE driver_id IN (SELECT driver_id FROM race_result WHERE finishing_position = 1)'
    )
    return rows
  }
  if (option === 'above_team_avg') {
    const [rows] = await pool.query(
      'SELECT * FROM driver d WHERE d.points > (SELECT AVG(x.points) FROM driver x WHERE x.team_name = d.team_name)'
    )
    return rows
  }
  throw new Error('Option not allowed')
}))

// ---------- Home page numbers ----------
// TODO: replace with real queries on standings and results.
app.get('/api/home', route(async () => {
  const [[champion]] = await pool.query('SELECT * FROM driver ORDER BY points DESC LIMIT 1')
  const [[constructorChampion]] = await pool.query('SELECT * FROM team ORDER BY points DESC LIMIT 1')
  const [[races]] = await pool.query('SELECT COUNT(*) AS n FROM race')
  const [[drivers]] = await pool.query('SELECT COUNT(*) AS n FROM driver')
  return {
    champion,
    constructorChampion,
    counters: [
      { label: 'Races', value: races.n },
      { label: 'Drivers', value: drivers.n },
    ],
    records: [],
  }
}))

// ---------- XML (Section F) ----------
app.get('/api/xml/:name', async (req, res) => {
  try {
    const t = okTable(req.params.name)
    const [rows] = await pool.query(`SELECT ${t.columns.join(', ')} FROM ${req.params.name}`)
    const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const body = rows
      .map((r) => `  <${req.params.name}>\n${Object.entries(r).map(([k, v]) => `    <${k}>${esc(v)}</${k}>`).join('\n')}\n  </${req.params.name}>`)
      .join('\n')
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<${req.params.name}s>\n${body}\n</${req.params.name}s>`)
  } catch (e) {
    res.status(400).send(e.message)
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`ApexGrid API running on http://localhost:${PORT}`))
