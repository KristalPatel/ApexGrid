import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import 'dotenv/config'
import pool from './db.js'
import { TABLES, AGGREGATES, OPERATORS, JOIN_TYPES, okTable, okColumn, okIn, joinLinks, joinCondition } from './allowed.js'

const app = express()
app.use(cors({ origin: process.env.FRONTEND_URL || true }))
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
// Which tables can be joined with which (taken from the foreign keys in allowed.js).
app.get('/api/join/links', route(async () => joinLinks()))

// Any two linked tables, with a chosen join type. Every column is renamed table_column
// so two columns with the same name (like team_id) never overwrite each other.
app.get('/api/join', route(async (req) => {
  const type = okIn(JOIN_TYPES, req.query.type, 'Join type')
  const left = req.query.left
  const right = req.query.right
  const lt = okTable(left)
  const rt = okTable(right)
  if (left === right) throw new Error('Pick two different tables')
  const on = joinCondition(left, right)
  if (!on) throw new Error('These two tables are not linked by a foreign key')
  const cols = [
    ...lt.columns.map((c) => `l.${c} AS ${left}_${c}`),
    ...rt.columns.map((c) => `r.${c} AS ${right}_${c}`),
  ]
  const [rows] = await pool.query(
    `SELECT ${cols.join(', ')} FROM ${left} l ${type} ${right} r ON ${on} LIMIT 500`
  )
  return rows
}))

// ---------- Subquery (Q6) ----------
// Drivers who finished in the top N for a chosen team.
// Tables used: driver, race_result, team.
app.get('/api/subquery/team-finishers', route(async (req) => {
  const maxPos = Number(req.query.maxPos)
  if (!Number.isInteger(maxPos) || maxPos < 1 || maxPos > 30) throw new Error('Finishing position not allowed')
  const [rows] = await pool.query(
    `SELECT driver_id, first_name, last_name, nationality, driver_code
       FROM driver
      WHERE driver_id IN (
              SELECT driver_id FROM race_result
               WHERE finishing_position <= ?
                 AND team_id IN (SELECT team_id FROM team WHERE team_name = ?))`,
    [maxPos, req.query.team]
  )
  return rows
}))

// ---------- Correlated subquery (Q7) ----------
// Drivers scoring above (or below) the average of their own team in a chosen season.
// The inner query uses c.team_id from the outer query, so it runs again for every outer row.
// Tables used: driver_standing, driver, driver_contract, team, season.
app.get('/api/subquery/team-average', route(async (req) => {
  const cmp = okIn(['above', 'below'], req.query.cmp, 'Comparison')
  const op = cmp === 'above' ? '>' : '<'
  const [rows] = await pool.query(
    `SELECT d.first_name, d.last_name, t.team_name, CAST(ds.total_points AS DOUBLE) AS total_points,
            (SELECT ROUND(AVG(ds2.total_points), 1)
               FROM driver_standing ds2
               JOIN driver_contract c2 ON c2.driver_id = ds2.driver_id AND c2.season_id = ds2.season_id
              WHERE c2.team_id = c.team_id AND ds2.season_id = ds.season_id) AS team_average
       FROM driver_standing ds
       JOIN season s          ON s.season_id = ds.season_id
       JOIN driver d          ON d.driver_id = ds.driver_id
       JOIN driver_contract c ON c.driver_id = ds.driver_id AND c.season_id = ds.season_id
       JOIN team t            ON t.team_id = c.team_id
      WHERE s.year = ?
        AND ds.total_points ${op} (
              SELECT AVG(ds2.total_points)
                FROM driver_standing ds2
                JOIN driver_contract c2 ON c2.driver_id = ds2.driver_id AND c2.season_id = ds2.season_id
               WHERE c2.team_id = c.team_id AND ds2.season_id = ds.season_id)
      ORDER BY ds.total_points DESC`,
    [Number(req.query.year)]
  )
  return rows
}))

// ---------- Home page numbers ----------
// Champion = the driver / team with final_position 1 in the most recent season that has standings.
app.get('/api/home', route(async () => {
  const [champRows] = await pool.query(
    `SELECT d.driver_id, CONCAT(d.first_name, ' ', d.last_name) AS full_name, d.driver_code, d.nationality,
            ds.wins, CAST(ds.total_points AS DOUBLE) AS points, s.year AS season_year,
            (SELECT t.team_name FROM driver_contract c JOIN team t ON t.team_id = c.team_id
              WHERE c.driver_id = d.driver_id AND c.season_id = ds.season_id
              ORDER BY c.start_date DESC, c.contract_id DESC LIMIT 1) AS team_name
       FROM driver_standing ds
       JOIN season s ON s.season_id = ds.season_id
       JOIN driver d ON d.driver_id = ds.driver_id
      WHERE ds.final_position = 1
      ORDER BY s.year DESC LIMIT 1`
  )
  const [teamRows] = await pool.query(
    `SELECT t.team_id, t.team_name, t.team_chief, t.nationality AS country,
            cs.wins, CAST(cs.total_points AS DOUBLE) AS points, s.year AS season_year
       FROM constructor_standing cs
       JOIN season s ON s.season_id = cs.season_id
       JOIN team t ON t.team_id = cs.team_id
      WHERE cs.final_position = 1
      ORDER BY s.year DESC LIMIT 1`
  )
  const [[races]] = await pool.query('SELECT COUNT(*) AS n FROM race')
  const [[drivers]] = await pool.query('SELECT COUNT(*) AS n FROM driver')
  return {
    champion: champRows[0] || null,
    constructorChampion: teamRows[0] || null,
    counters: [
      { label: 'Races', value: races.n },
      { label: 'Drivers', value: drivers.n },
    ],
    records: [],
  }
}))

// ---------- Driver detail page ----------
// Current team = the driver's latest contract (newest season year, then newest start_date).
// DATE_FORMAT keeps date_of_birth as a plain 'YYYY-MM-DD' string (no timezone shift).
const DRIVER_WITH_TEAM = `
  SELECT d.driver_id, d.first_name, d.last_name,
         DATE_FORMAT(d.date_of_birth, '%Y-%m-%d') AS date_of_birth,
         d.nationality, d.driver_code,
         t.team_id, t.team_name, c.car_number,
         ds.wins, CAST(ds.total_points AS DOUBLE) AS points, ds.final_position AS standing_position
    FROM driver d
    LEFT JOIN driver_contract c ON c.contract_id = (
      SELECT c2.contract_id
        FROM driver_contract c2
        LEFT JOIN season s ON s.season_id = c2.season_id
       WHERE c2.driver_id = d.driver_id
       ORDER BY s.year DESC, c2.start_date DESC, c2.contract_id DESC
       LIMIT 1)
    LEFT JOIN team t ON t.team_id = c.team_id
    LEFT JOIN driver_standing ds ON ds.driver_id = d.driver_id AND ds.season_id = (
      SELECT x.season_id FROM driver_standing x JOIN season s3 ON s3.season_id = x.season_id
       ORDER BY s3.year DESC LIMIT 1)`

// All drivers with their current team and number (used by the "More drivers" row).
app.get('/api/drivers/summary', route(async () => {
  const [rows] = await pool.query(`${DRIVER_WITH_TEAM} ORDER BY ds.final_position IS NULL, ds.final_position, d.last_name, d.first_name`)
  return rows
}))

// One driver plus career stats. Returns null when the driver does not exist.
// A stat is null (not 0) when the data needed to calculate it has not been loaded yet,
// so an empty database never shows fake zeros.
app.get('/api/driver/:id', route(async (req) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) throw new Error('Invalid driver id')

  const [drivers] = await pool.query(`${DRIVER_WITH_TEAM} WHERE d.driver_id = ?`, [id])
  if (!drivers.length) return null

  // Separate scalar subqueries, so joins can never double-count a race.
  const [[n]] = await pool.query(
    `SELECT
       (SELECT COUNT(DISTINCT race_id) FROM race_result WHERE driver_id = ?) AS result_races,
       (SELECT COUNT(DISTINCT race_id) FROM race_result WHERE driver_id = ? AND finishing_position = 1) AS wins,
       (SELECT COUNT(DISTINCT race_id) FROM race_result WHERE driver_id = ? AND finishing_position BETWEEN 1 AND 3) AS podiums,
       (SELECT COUNT(*) FROM (SELECT race_id FROM race_result GROUP BY race_id
                              HAVING COALESCE(SUM(finishing_position BETWEEN 1 AND 3), 0) < 3) x) AS podium_incomplete_races,
       (SELECT COUNT(DISTINCT race_id) FROM qualifying WHERE driver_id = ?) AS qualifying_races,
       (SELECT COUNT(DISTINCT race_id) FROM qualifying WHERE driver_id = ? AND position = 1) AS poles,
       (SELECT COUNT(*) FROM fastest_lap) AS fastest_lap_rows,
       (SELECT COUNT(DISTINCT race_id) FROM fastest_lap WHERE driver_id = ?) AS fastest_laps`,
    [id, id, id, id, id, id]
  )
  const stats = {
    wins: n.result_races > 0 ? n.wins : null,
    // Podiums need the top three of every race with results. Until then the number would be wrong.
    podiums: n.result_races > 0 && n.podium_incomplete_races === 0 ? n.podiums : null,
    poles: n.qualifying_races > 0 ? n.poles : null,
    fastest_laps: n.result_races > 0 && n.fastest_lap_rows > 0 ? n.fastest_laps : null,
  }
  return { driver: drivers[0], stats }
}))

// ---------- Teams and races for the public pages ----------
// Team list with the latest constructor standing.
app.get('/api/teams/summary', route(async () => {
  const [rows] = await pool.query(
    `SELECT t.team_id, t.team_name, t.nationality AS country, t.team_chief,
            cs.wins, CAST(cs.total_points AS DOUBLE) AS points, cs.final_position AS standing_position
       FROM team t
       LEFT JOIN constructor_standing cs ON cs.team_id = t.team_id AND cs.season_id = (
         SELECT x.season_id FROM constructor_standing x JOIN season s ON s.season_id = x.season_id
          ORDER BY s.year DESC LIMIT 1)
      ORDER BY cs.final_position IS NULL, cs.final_position, t.team_name`
  )
  return rows
}))

// Races with circuit and winner. The winner is a subquery so a race never appears twice.
app.get('/api/races/summary', route(async () => {
  const [rows] = await pool.query(
    `SELECT r.race_id, r.round_number AS round, r.race_name,
            DATE_FORMAT(r.race_date, '%Y-%m-%d') AS race_date, s.year AS season_year,
            c.circuit_id, c.circuit_name, c.country,
            (SELECT CONCAT(d.first_name, ' ', d.last_name)
               FROM race_result rr JOIN driver d ON d.driver_id = rr.driver_id
              WHERE rr.race_id = r.race_id AND rr.finishing_position = 1
              ORDER BY rr.result_id LIMIT 1) AS winner
       FROM race r
       JOIN circuit c ON c.circuit_id = r.circuit_id
       JOIN season s ON s.season_id = r.season_id
      ORDER BY s.year DESC, r.round_number`
  )
  return rows
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

// ---------------------------------------------------------------
// PASTE THIS INTO backend/server.js
// Place it just ABOVE the line:  const PORT = process.env.PORT || 5000
// No new imports are needed (it uses `route` and `pool` already in the file).
// ---------------------------------------------------------------

// =============== SECTION C: VIEWS ===============
// Only views listed here can be read, so the name in the URL is never put into SQL.
const VIEWS = { v_british_drivers: 'SELECT * FROM v_british_drivers' }

// Must stay ABOVE /api/view/:name, or "lookups" would be read as a view name.
app.get('/api/view/lookups', route(async () => {
  const [teams] = await pool.query('SELECT team_id, team_name FROM team ORDER BY team_name')
  const [seasons] = await pool.query('SELECT season_id, year FROM season ORDER BY year DESC')
  return { teams, seasons }
}))

app.get('/api/view/:name', route(async (req) => {
  const sql = VIEWS[req.params.name]
  if (!sql) throw new Error('View not allowed')
  const [rows] = await pool.query(sql)
  return rows
}))

// Calls the saved procedure. If a trigger blocks the insert (future birth date),
// MySQL's SIGNAL message reaches the browser as { error: '...' } through route().
app.post('/api/view/add-driver', route(async (req) => {
  const { first, last, dob, nationality, code, team, season, number } = req.body
  const [result] = await pool.query('CALL sp_add_driver_and_show(?, ?, ?, ?, ?, ?, ?, ?)', [
    first, last, dob || null, nationality || null, code,
    Number(team), Number(season), number ? Number(number) : null,
  ])
  return result[0] // the procedure's last SELECT: the rows of the view
}))

// Cleans up drivers created while demonstrating. Refuses real drivers that have results or standings.
app.delete('/api/view/driver/:id', route(async (req) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) throw new Error('Invalid driver id')
  const [[used]] = await pool.query(
    `SELECT (SELECT COUNT(*) FROM race_result WHERE driver_id = ?)
          + (SELECT COUNT(*) FROM driver_standing WHERE driver_id = ?) AS n`,
    [id, id]
  )
  if (used.n > 0) throw new Error('This driver has results or standings, so it is not a test driver')
  await pool.query('DELETE FROM driver_contract WHERE driver_id = ?', [id])
  await pool.query('DELETE FROM driver WHERE driver_id = ?', [id])
  return { ok: true }
}))

app.get('/api/audit/tail', route(async () => {
  const [rows] = await pool.query(
    `SELECT log_id, table_name, operation_type, record_id,
            DATE_FORMAT(changed_at, '%Y-%m-%d %H:%i:%s') AS changed_at, details
       FROM application_audit_log ORDER BY log_id DESC LIMIT 8`
  )
  return rows
}))

// =============== SECTION B: INDEX LAB ===============
// Everything runnable is listed here. The browser sends only a name or an id.
const INDEXES = {
  idx_driver_nationality:     { table: 'driver',          cols: 'nationality',                     helps: 'Q4' },
  idx_result_points:          { table: 'race_result',     cols: 'points',                          helps: 'Q3' },
  idx_result_pos_driver:      { table: 'race_result',     cols: 'finishing_position, driver_id',   helps: 'Q6' },
  idx_contract_driver_season: { table: 'driver_contract', cols: 'driver_id, season_id, team_id',   helps: 'Q5, Q7' },
}

const BENCH = {
  Q1: { label: 'Display all drivers', sql: 'SELECT * FROM driver' },
  Q3: { label: 'Aggregate: MAX points', sql: 'SELECT MAX(points) FROM race_result' },
  Q4: { label: 'Condition: British drivers', sql: "SELECT * FROM driver WHERE nationality = 'British'" },
  Q5: {
    label: 'Join: driver, contract, team',
    sql: `SELECT CONCAT(d.first_name, ' ', d.last_name) AS driver, t.team_name
            FROM driver d
            JOIN driver_contract c ON c.driver_id = d.driver_id
            JOIN team t ON t.team_id = c.team_id`,
  },
  Q6: {
    label: 'Subquery: drivers with a win',
    sql: 'SELECT * FROM driver WHERE driver_id IN (SELECT driver_id FROM race_result WHERE finishing_position = 1)',
  },
  Q7: {
    label: 'Correlated: above team average',
    sql: `SELECT d.driver_id, ds.total_points
            FROM driver_standing ds
            JOIN driver d ON d.driver_id = ds.driver_id
            JOIN driver_contract c ON c.driver_id = ds.driver_id AND c.season_id = ds.season_id
           WHERE ds.total_points > (
                 SELECT AVG(ds2.total_points)
                   FROM driver_standing ds2
                   JOIN driver_contract c2 ON c2.driver_id = ds2.driver_id AND c2.season_id = ds2.season_id
                  WHERE c2.team_id = c.team_id AND ds2.season_id = ds.season_id)`,
  },
}

const oneLine = (s) => s.replace(/\s+/g, ' ').trim()

app.get('/api/index/state', route(async () => {
  const tables = [...new Set(Object.values(INDEXES).map((i) => i.table))]
  const indexes = []
  for (const t of tables) {
    const [rows] = await pool.query(`SHOW INDEX FROM ${t}`)
    rows.forEach((r) =>
      indexes.push({ table: r.Table, name: r.Key_name, column: r.Column_name, seq: r.Seq_in_index, unique: r.Non_unique === 0 })
    )
  }
  const catalog = Object.entries(INDEXES).map(([name, i]) => ({
    name, ...i, exists: indexes.some((x) => x.name === name),
  }))
  const queries = Object.entries(BENCH).map(([id, q]) => ({ id, label: q.label, sql: oneLine(q.sql) }))
  return { catalog, indexes, queries }
}))

app.post('/api/index/create', route(async (req) => {
  const name = req.body.name
  const i = INDEXES[name]
  if (!i) throw new Error('Index not allowed')
  await pool.query(`CREATE INDEX ${name} ON ${i.table} (${i.cols})`)
  return { ok: true }
}))

app.post('/api/index/drop', route(async (req) => {
  const name = req.body.name
  const i = INDEXES[name]
  if (!i) throw new Error('Index not allowed')
  try {
    await pool.query(`DROP INDEX ${name} ON ${i.table}`)
  } catch (e) {
    // MySQL may have used our composite index in place of the foreign key's own index.
    // Error 1553 = the index is still needed by a foreign key. Give the key its own index, then retry.
    if (e.errno === 1553 && i.table === 'driver_contract') {
      await pool.query('CREATE INDEX idx_contract_driver_fk ON driver_contract (driver_id)')
      await pool.query(`DROP INDEX ${name} ON ${i.table}`)
    } else {
      throw e
    }
  }
  return { ok: true }
}))

const median = (list) => {
  const s = [...list].sort((a, b) => a - b)
  return s[Math.floor(s.length / 2)]
}

// Runs one query 5 times. server_ms comes from EXPLAIN ANALYZE (time inside MySQL),
// wall_ms is the full round trip including the network to the cloud database.
app.post('/api/index/bench', route(async (req) => {
  const id = req.body.id
  const q = BENCH[id]
  if (!q) throw new Error('Query not allowed')
  const server = []
  const wall = []
  for (let n = 0; n < 5; n++) {
    const t0 = process.hrtime.bigint()
    await pool.query(q.sql)
    wall.push(Number(process.hrtime.bigint() - t0) / 1e6)

    const [r] = await pool.query(`EXPLAIN ANALYZE ${q.sql}`)
    const text = String(Object.values(r[0])[0])
    const m = text.match(/actual time=[\d.]+\.\.([\d.]+)/) // first match = top node = whole query
    if (m) server.push(parseFloat(m[1]))
  }
  const [plan] = await pool.query(`EXPLAIN ${q.sql}`)
  return {
    id,
    server_ms: server.length ? median(server) : null,
    wall_ms: median(wall),
    plan: plan.map((p) => ({ table: p.table, type: p.type, key: p.key, rows: p.rows, extra: p.Extra })),
  }
}))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`ApexGrid API running on http://localhost:${PORT}`))
