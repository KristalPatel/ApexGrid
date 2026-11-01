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
    columns: ['result_id', 'race_id', 'driver_id', 'team_id', 'grid_position', 'finishing_position', 'points', 'status_id'],
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
    columns: ['penalty_id', 'race_id', 'driver_id', 'penalty_type_id', 'time_penalty_seconds', 'reason'],
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
  race_status: {
    id: 'status_id',
    columns: ['status_id', 'status_name'],
  },
  penalty_type: {
    id: 'penalty_type_id',
    columns: ['penalty_type_id', 'type_name'],
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