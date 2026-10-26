// The ONLY file that knows where data comes from.
// Today every function returns mock data. When the backend is ready,
// set USE_MOCK = false and the same functions call the Express API instead.
// The pages never change.

import * as mock from './data/mockData.js'

const USE_MOCK = true
const wait = (data) => new Promise((res) => setTimeout(() => res(data), 150))

async function get(url) {
  const r = await fetch(url)
  if (!r.ok) throw new Error('Request failed')
  return r.json()
}
async function send(url, method, body) {
  const r = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error('Request failed')
  return r.json()
}

const tableData = { driver: mock.drivers, team: mock.teams, race: mock.races, circuit: mock.circuits }

export const login = (username, password) => {
  if (!USE_MOCK) return send('/api/login', 'POST', { username, password })
  const u = mock.userLogins.find((x) => x.username === username && x.password === password)
  return u ? wait({ username: u.username, role: u.role }) : Promise.reject(new Error('Wrong username or password'))
}

export const getTable = (name) => (USE_MOCK ? wait(tableData[name] || []) : get(`/api/table/${name}`))

export const getHome = () =>
  USE_MOCK
    ? wait({
        champion: mock.drivers[0],
        constructorChampion: mock.teams[0],
        counters: mock.seasonCounters,
        records: mock.seasonRecords,
      })
    : get('/api/home')

export const getStats = () =>
  USE_MOCK
    ? wait(Object.entries(tableData).map(([name, rows]) => ({ table: name, count: rows.length })))
    : get('/api/stats')

export const insertRow = (table, row) =>
  USE_MOCK ? wait({ ok: true, row }) : send('/api/insert', 'POST', { table, row })

export const updateRow = (table, id, changes) =>
  USE_MOCK ? wait({ ok: true }) : send('/api/update', 'PUT', { table, id, changes })

export const deleteRow = (table, id) =>
  USE_MOCK ? wait({ ok: true }) : send('/api/delete', 'DELETE', { table, id })

export const runAggregate = (table, fn, column) => {
  if (!USE_MOCK) return get(`/api/aggregate?table=${table}&fn=${fn}&col=${column}`)
  const vals = (tableData[table] || []).map((r) => Number(r[column])).filter((n) => !Number.isNaN(n))
  const calc = {
    COUNT: vals.length,
    SUM: vals.reduce((a, b) => a + b, 0),
    AVG: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0,
    MIN: Math.min(...vals),
    MAX: Math.max(...vals),
  }
  return wait({ result: Number(calc[fn].toFixed(2)) })
}

export const runFilter = (table, column, op, value) => {
  if (!USE_MOCK) return get(`/api/filter?table=${table}&col=${column}&op=${encodeURIComponent(op)}&val=${encodeURIComponent(value)}`)
  const rows = (tableData[table] || []).filter((r) => {
    const a = r[column]
    const n = Number(value)
    const numeric = !Number.isNaN(n) && value !== ''
    switch (op) {
      case '=': return numeric ? Number(a) === n : String(a).toLowerCase() === value.toLowerCase()
      case '!=': return numeric ? Number(a) !== n : String(a).toLowerCase() !== value.toLowerCase()
      case '>': return Number(a) > n
      case '<': return Number(a) < n
      case '>=': return Number(a) >= n
      case '<=': return Number(a) <= n
      case 'LIKE': return String(a).toLowerCase().includes(value.toLowerCase().replace(/%/g, ''))
      default: return true
    }
  })
  return wait(rows)
}

export const runJoin = (type) => {
  if (!USE_MOCK) return get(`/api/join?type=${encodeURIComponent(type)}`)
  // Mock join: driver with team.
  const rows = mock.drivers.map((d) => {
    const t = mock.teams.find((x) => x.team_name === d.team_name)
    return { driver: d.full_name, team: d.team_name, team_chief: t ? t.team_chief : null }
  })
  return wait(rows)
}

export const runSubquery = (option) => {
  if (!USE_MOCK) return get(`/api/subquery?option=${option}`)
  if (option === 'winners') return wait(mock.drivers.filter((d) => d.wins > 0))
  const avg = {}
  mock.drivers.forEach((d) => {
    avg[d.team_name] = avg[d.team_name] || []
    avg[d.team_name].push(d.points)
  })
  return wait(
    mock.drivers.filter((d) => {
      const list = avg[d.team_name]
      return d.points > list.reduce((a, b) => a + b, 0) / list.length
    })
  )
}

export const getXml = (table) => {
  if (!USE_MOCK) return fetch(`/api/xml/${table}`).then((r) => r.text())
  const rows = tableData[table] || []
  const body = rows
    .map((r) => `  <${table}>\n${Object.entries(r).map(([k, v]) => `    <${k}>${v}</${k}>`).join('\n')}\n  </${table}>`)
    .join('\n')
  return wait(`<?xml version="1.0" encoding="UTF-8"?>\n<${table}s>\n${body}\n</${table}s>`)
}
