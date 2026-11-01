// The ONLY file that knows where data comes from.
// Today every function returns mock data. When the backend is ready,
// set USE_MOCK = false and the same functions call the Express API instead.
// The pages never change.

import * as mock from './data/mockData.js'

const USE_MOCK = false
const wait = (data) => new Promise((res) => setTimeout(() => res(data), 150))

// When the backend says no (a trigger, a rule, a wrong password...), it sends { error: '...' }.
// We pass that real message on, so the pages can show it instead of a vague "Request failed".
async function fail(r) {
  let msg = 'Request failed'
  try {
    const body = await r.json()
    if (body && body.error) msg = body.error
  } catch {
    // the reply was not JSON, keep the default message
  }
  throw new Error(msg)
}

async function get(url) {
  const r = await fetch(url)
  if (!r.ok) await fail(r)
  return r.json()
}
async function send(url, method, body) {
  const r = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!r.ok) await fail(r)
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

// ---------- Driver detail page ----------
// The real driver table stores first_name / last_name and has no team column.
// Team and racing number come from the driver's latest contract, joined in the backend.
// Everything below returns the same shape in mock and real mode:
//   driver: { driver_id, full_name, first_name?, last_name?, driver_code, nationality,
//             date_of_birth|null, team_id|null, team_name|null, car_number|null }
//   stats : { wins, podiums, poles, fastest_laps }   (a value is null when it cannot be calculated)
const shapeDriver = (d) => ({
  ...d,
  full_name: d.full_name || [d.first_name, d.last_name].filter(Boolean).join(' '),
})

const mockSummary = (d) => {
  const team = mock.teams.find((t) => t.team_name === d.team_name)
  return shapeDriver({
    driver_id: d.driver_id,
    full_name: d.full_name,
    driver_code: d.driver_code,
    nationality: d.nationality,
    date_of_birth: null,
    team_id: team ? team.team_id : null,
    team_name: d.team_name || null,
    car_number: null,
    wins: d.wins ?? null,
    points: d.points ?? null,
  })
}

export const getDrivers = () =>
  USE_MOCK
    ? wait(mock.drivers.map(mockSummary))
    : get('/api/drivers/summary').then((rows) => rows.map(shapeDriver))

// Resolves to null when the driver does not exist.
export const getDriverProfile = (id) => {
  if (!USE_MOCK) {
    return get(`/api/driver/${encodeURIComponent(id)}`).then((r) =>
      r ? { driver: shapeDriver(r.driver), stats: r.stats, mock: false } : null
    )
  }
  const d = mock.drivers.find((x) => String(x.driver_id) === String(id))
  return wait(
    d
      ? { driver: mockSummary(d), stats: { wins: d.wins ?? null, podiums: null, poles: null, fastest_laps: null }, mock: true }
      : null
  )
}

// ---------- Teams and races for the public pages ----------
// Same shape in mock and real mode, so the pages never care which one is active.
//   team: { team_id, team_name, country, team_chief, wins|null, points|null }
//   race: { race_id, round, race_name, race_date, circuit_id, circuit_name, country?, winner|null }
export const getTeams = () =>
  USE_MOCK
    ? wait(mock.teams.map((t) => ({ ...t, wins: t.wins ?? null, points: t.points ?? null })))
    : get('/api/teams/summary')

export const getRaces = () =>
  USE_MOCK
    ? wait(
        mock.races.map((r) => {
          const c = mock.circuits.find((x) => x.circuit_name === r.circuit_name)
          return { ...r, circuit_id: c ? c.circuit_id : null, winner: r.winner || null }
        })
      )
    : get('/api/races/summary')



  // ---------------------------------------------------------------
// PASTE THIS AT THE VERY BOTTOM OF frontend/src/api.js
// (it uses the existing get() and send() helpers in that file)
// ---------------------------------------------------------------

// ---------- Section C: views ----------
export const getViewData = (name) => get(`/api/view/${name}`)
export const getViewLookups = () => get('/api/view/lookups')
export const addDriverViaProcedure = (body) => send('/api/view/add-driver', 'POST', body)
export const removeTestDriver = (id) => send(`/api/view/driver/${id}`, 'DELETE', {})
export const getAuditTail = () => get('/api/audit/tail')

// ---------- Section B: indexes ----------
export const getIndexState = () => get('/api/index/state')
export const createIndex = (name) => send('/api/index/create', 'POST', { name })
export const dropIndex = (name) => send('/api/index/drop', 'POST', { name })
export const benchQuery = (id) => send('/api/index/bench', 'POST', { id })