// The "allowed list". Table names, column names, operators and functions can NOT be sent
// to MySQL as ? values, so we only accept names that appear here. This stops SQL injection.
//
// All 22 ApexGrid tables, with the real column names (matches the Aiven schema).
// Never list password_hash.
//
// "id" is the column used by the Update and Delete routes.
// NOTE: 4 tables have a composite key (2+ columns together): driver_standing,
// constructor_standing, team_sponsor, sector_time. For these, "id" is only the first
// key column, so Update/Delete by id would touch many rows. Do not show Edit/Delete
// buttons for those 4 tables in the admin console.

export const TABLES = {
  season: {
    id: 'season_id',
    columns: ['season_id', 'year', 'start_date', 'end_date'],
  },
  circuit: {
    id: 'circuit_id',
    columns: ['circuit_id', 'circuit_name', 'city', 'country', 'length_km'],
  },
  driver: {
    id: 'driver_id',
    columns: ['driver_id', 'first_name', 'last_name', 'date_of_birth', 'nationality', 'driver_code'],
  },
  team: {
    id: 'team_id',
    columns: ['team_id', 'team_name', 'nationality', 'team_chief'],
  },
  car: {
    id: 'car_id',
    columns: ['car_id', 'team_id', 'season_id', 'car_name', 'car_number'],
  },
  race: {
    id: 'race_id',
    columns: ['race_id', 'season_id', 'circuit_id', 'race_name', 'round_number', 'race_date'],
  },
  driver_contract: {
    id: 'contract_id',
    columns: ['contract_id', 'driver_id', 'team_id', 'season_id', 'start_date', 'end_date', 'car_number'],
  },
  race_result: {
    id: 'result_id',
    columns: ['result_id', 'race_id', 'driver_id', 'team_id', 'grid_position', 'finishing_position', 'points', 'status'],
  },
  qualifying: {
    id: 'qualifying_id',
    columns: ['qualifying_id', 'race_id', 'driver_id', 'position', 'q1_time', 'q2_time', 'q3_time'],
  },
  lap: {
    id: 'lap_id',
    columns: ['lap_id', 'race_id', 'driver_id', 'lap_number', 'lap_time_seconds', 'position'],
  },
  pit_stop: {
    id: 'pit_stop_id',
    columns: ['pit_stop_id', 'race_id', 'driver_id', 'lap_number', 'stop_number', 'duration_seconds'],
  },
  tire_compound: {
    id: 'compound_id',
    columns: ['compound_id', 'compound_name'],
  },
  pit_stop_tire: {
    id: 'pit_stop_id',
    columns: ['pit_stop_id', 'compound_id', 'tire_age_laps'],
  },
  penalty: {
    id: 'penalty_id',
    columns: ['penalty_id', 'race_id', 'driver_id', 'penalty_type', 'time_penalty_seconds', 'reason'],
  },
  driver_standing: {
    id: 'season_id', // composite key (season_id + driver_id)
    columns: ['season_id', 'driver_id', 'total_points', 'wins', 'final_position'],
  },
  constructor_standing: {
    id: 'season_id', // composite key (season_id + team_id)
    columns: ['season_id', 'team_id', 'total_points', 'wins', 'final_position'],
  },
  fastest_lap: {
    id: 'race_id',
    columns: ['race_id', 'driver_id', 'lap_number', 'lap_time_seconds'],
  },
  sector_time: {
    id: 'race_id', // composite key (race_id + driver_id + lap_number + sector_number)
    columns: ['race_id', 'driver_id', 'lap_number', 'sector_number', 'sector_time_seconds'],
  },
  sponsor: {
    id: 'sponsor_id',
    columns: ['sponsor_id', 'sponsor_name', 'industry', 'country'],
  },
  team_sponsor: {
    id: 'team_id', // composite key (team_id + sponsor_id + season_id)
    columns: ['team_id', 'sponsor_id', 'season_id', 'sponsorship_type'],
  },
  user_login: {
    id: 'user_id',
    columns: ['user_id', 'username', 'role_name', 'created_at', 'is_active'], // no password_hash
  },
  application_audit_log: {
    id: 'log_id',
    columns: ['log_id', 'table_name', 'operation_type', 'record_id', 'changed_at', 'details', 'changed_by'],
  },
}

export const AGGREGATES = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX']
export const OPERATORS = ['=', '!=', '>', '<', '>=', '<=', 'LIKE']
export const JOIN_TYPES = ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN']

// Check helpers. They throw a friendly error if the name is not allowed.
export function okTable(name) {
  if (!Object.hasOwn(TABLES, name)) throw new Error('Table not allowed')
  return TABLES[name]
}

export function okColumn(table, col) {
  const t = okTable(table)
  if (!t.columns.includes(col)) throw new Error('Column not allowed')
  return col
}

export function okIn(list, value, label = 'Value') {
  if (!list.includes(value)) throw new Error(`${label} not allowed`)
  return value
}

// ---------- Foreign-key links, used by the Join page (Q5) ----------
// One entry per foreign key in the schema: the parent table, the child table,
// and the column pairs [parent column, child column] that join them.
// The Join page only offers pairs of tables that appear here.
export const RELATIONS = [
  { parent: 'season', child: 'car', on: [['season_id', 'season_id']] },
  { parent: 'season', child: 'race', on: [['season_id', 'season_id']] },
  { parent: 'season', child: 'driver_contract', on: [['season_id', 'season_id']] },
  { parent: 'season', child: 'driver_standing', on: [['season_id', 'season_id']] },
  { parent: 'season', child: 'constructor_standing', on: [['season_id', 'season_id']] },
  { parent: 'season', child: 'team_sponsor', on: [['season_id', 'season_id']] },
  { parent: 'team', child: 'car', on: [['team_id', 'team_id']] },
  { parent: 'team', child: 'driver_contract', on: [['team_id', 'team_id']] },
  { parent: 'team', child: 'race_result', on: [['team_id', 'team_id']] },
  { parent: 'team', child: 'constructor_standing', on: [['team_id', 'team_id']] },
  { parent: 'team', child: 'team_sponsor', on: [['team_id', 'team_id']] },
  { parent: 'circuit', child: 'race', on: [['circuit_id', 'circuit_id']] },
  { parent: 'race', child: 'race_result', on: [['race_id', 'race_id']] },
  { parent: 'race', child: 'qualifying', on: [['race_id', 'race_id']] },
  { parent: 'race', child: 'lap', on: [['race_id', 'race_id']] },
  { parent: 'race', child: 'pit_stop', on: [['race_id', 'race_id']] },
  { parent: 'race', child: 'penalty', on: [['race_id', 'race_id']] },
  { parent: 'race', child: 'fastest_lap', on: [['race_id', 'race_id']] },
  { parent: 'driver', child: 'driver_contract', on: [['driver_id', 'driver_id']] },
  { parent: 'driver', child: 'race_result', on: [['driver_id', 'driver_id']] },
  { parent: 'driver', child: 'qualifying', on: [['driver_id', 'driver_id']] },
  { parent: 'driver', child: 'lap', on: [['driver_id', 'driver_id']] },
  { parent: 'driver', child: 'pit_stop', on: [['driver_id', 'driver_id']] },
  { parent: 'driver', child: 'penalty', on: [['driver_id', 'driver_id']] },
  { parent: 'driver', child: 'driver_standing', on: [['driver_id', 'driver_id']] },
  { parent: 'driver', child: 'fastest_lap', on: [['driver_id', 'driver_id']] },
  { parent: 'pit_stop', child: 'pit_stop_tire', on: [['pit_stop_id', 'pit_stop_id']] },
  { parent: 'tire_compound', child: 'pit_stop_tire', on: [['compound_id', 'compound_id']] },
  { parent: 'sponsor', child: 'team_sponsor', on: [['sponsor_id', 'sponsor_id']] },
  {
    parent: 'lap',
    child: 'sector_time',
    on: [['race_id', 'race_id'], ['driver_id', 'driver_id'], ['lap_number', 'lap_number']],
  },
]

// table name -> list of tables it can be joined with
export function joinLinks() {
  const out = {}
  for (const name of Object.keys(TABLES)) out[name] = []
  for (const r of RELATIONS) {
    if (!out[r.parent].includes(r.child)) out[r.parent].push(r.child)
    if (!out[r.child].includes(r.parent)) out[r.child].push(r.parent)
  }
  return out
}

// Find the ON clause for two tables (in either direction). Returns null if they are not linked.
export function joinCondition(left, right) {
  for (const r of RELATIONS) {
    if (r.parent === left && r.child === right)
      return r.on.map(([p, c]) => `l.${p} = r.${c}`).join(' AND ')
    if (r.parent === right && r.child === left)
      return r.on.map(([p, c]) => `r.${p} = l.${c}`).join(' AND ')
  }
  return null
}
