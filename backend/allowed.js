// The "allowed list". Table names, column names, operators and functions can NOT be sent
// to MySQL as ? values, so we only accept names that appear here. This stops SQL injection.
//
// TODO (both teammates): change these to match your REAL table and column names.
// Never list password_hash.

export const TABLES = {
  driver: { id: 'driver_id', columns: ['driver_id', 'full_name', 'driver_code', 'nationality', 'team_name', 'wins', 'points'] },
  team: { id: 'team_id', columns: ['team_id', 'team_name', 'team_chief', 'country', 'wins', 'points'] },
  race: { id: 'race_id', columns: ['race_id', 'round', 'race_name', 'circuit_name', 'race_date', 'winner'] },
  circuit: { id: 'circuit_id', columns: ['circuit_id', 'circuit_name', 'country', 'length_km', 'laps'] },
}

export const AGGREGATES = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX']
export const OPERATORS = ['=', '!=', '>', '<', '>=', '<=', 'LIKE']
export const JOIN_TYPES = ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN']

// Check helpers. They throw a friendly error if the name is not allowed.
export function okTable(name) {
  if (!TABLES[name]) throw new Error('Table not allowed')
  return TABLES[name]
}
export function okColumn(table, col) {
  if (!okTable(table).columns.includes(col)) throw new Error('Column not allowed')
  return col
}
export function okIn(list, value, what) {
  if (!list.includes(value)) throw new Error(`${what} not allowed`)
  return value
}
