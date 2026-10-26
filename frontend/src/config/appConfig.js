// One place that lists tables, columns and dropdown options.
// The admin pages read from here, and the backend uses the same names as its "allowed list".
// IMPORTANT: change these names to match your real MySQL tables.

export const TABLES = {
  driver: {
    label: 'Drivers',
    columns: ['driver_id', 'full_name', 'driver_code', 'nationality', 'team_name', 'wins', 'points'],
    numeric: ['wins', 'points'],
  },
  team: {
    label: 'Teams',
    columns: ['team_id', 'team_name', 'team_chief', 'country', 'wins', 'points'],
    numeric: ['wins', 'points'],
  },
  race: {
    label: 'Races',
    columns: ['race_id', 'round', 'race_name', 'circuit_name', 'race_date', 'winner'],
    numeric: ['round'],
  },
  circuit: {
    label: 'Circuits',
    columns: ['circuit_id', 'circuit_name', 'country', 'length_km', 'laps'],
    numeric: ['length_km', 'laps'],
  },
}

export const AGGREGATES = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX']
export const OPERATORS = ['=', '!=', '>', '<', '>=', '<=', 'LIKE']
export const JOIN_TYPES = ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN']

export const SUBQUERY_OPTIONS = [
  { id: 'winners', label: 'Drivers who have won at least one race (subquery)' },
  { id: 'above_team_avg', label: 'Drivers scoring above their team average (correlated)' },
]

// Per-team colours. The driver page sets --accent from this, so the whole page recolours.
export const TEAM_THEMES = {
  'Red Bull Racing': '#1e41ff',
  McLaren: '#ff8000',
  Ferrari: '#e8002d',
  Mercedes: '#00d2be',
  'Aston Martin': '#229971',
}

// Admin sidebar. Each entry is one page of the assignment checklist.
export const ADMIN_MENU = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/manage', label: 'Manage Data' },
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/queries', label: 'Query Builder' },
  { to: '/admin/index-lab', label: 'Index Lab' },
  { to: '/admin/views', label: 'Views' },
  { to: '/admin/xml', label: 'XML Export' },
]
