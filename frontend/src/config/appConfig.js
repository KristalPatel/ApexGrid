// One place that lists tables, columns and dropdown options.
// The admin pages read from here, and the backend uses the same names as its "allowed list"
// (backend/allowed.js). The column names below MUST match allowed.js and the real MySQL tables.
// "numeric" = the columns that hold numbers you can SUM / AVG / compare.

export const TABLES = {
  driver: {
    label: 'Drivers',
    columns: ['driver_id', 'first_name', 'last_name', 'date_of_birth', 'nationality', 'driver_code'],
    numeric: [],
  },
  team: {
    label: 'Teams',
    columns: ['team_id', 'team_name', 'nationality', 'team_chief'],
    numeric: [],
  },
  race: {
    label: 'Races',
    columns: ['race_id', 'season_id', 'circuit_id', 'race_name', 'round_number', 'race_date'],
    numeric: ['round_number'],
  },
  circuit: {
    label: 'Circuits',
    columns: ['circuit_id', 'circuit_name', 'city', 'country', 'length_km'],
    numeric: ['length_km'],
  },
  season: {
    label: 'Seasons',
    columns: ['season_id', 'year', 'start_date', 'end_date'],
    numeric: ['year'],
  },
  car: {
    label: 'Cars',
    columns: ['car_id', 'team_id', 'season_id', 'car_name', 'car_number'],
    numeric: ['car_number'],
  },
  driver_contract: {
    label: 'Driver Contracts',
    columns: ['contract_id', 'driver_id', 'team_id', 'season_id', 'start_date', 'end_date', 'car_number'],
    numeric: ['car_number'],
  },
  race_result: {
    label: 'Race Results',
    columns: ['result_id', 'race_id', 'driver_id', 'team_id', 'grid_position', 'finishing_position', 'points', 'status_id'],
    numeric: ['grid_position', 'finishing_position', 'points'],
  },
  qualifying: {
    label: 'Qualifying',
    columns: ['qualifying_id', 'race_id', 'driver_id', 'position', 'q1_time', 'q2_time', 'q3_time'],
    numeric: ['position'],
  },
  lap: {
    label: 'Laps',
    columns: ['lap_id', 'race_id', 'driver_id', 'lap_number', 'lap_time_seconds', 'position'],
    numeric: ['lap_number', 'lap_time_seconds', 'position'],
  },
  pit_stop: {
    label: 'Pit Stops',
    columns: ['pit_stop_id', 'race_id', 'driver_id', 'lap_number', 'stop_number', 'duration_seconds'],
    numeric: ['lap_number', 'stop_number', 'duration_seconds'],
  },
  tire_compound: {
    label: 'Tire Compounds',
    columns: ['compound_id', 'compound_name'],
    numeric: [],
  },
  pit_stop_tire: {
    label: 'Pit Stop Tires',
    columns: ['pit_stop_id', 'compound_id', 'tire_age_laps'],
    numeric: ['tire_age_laps'],
  },
  penalty: {
    label: 'Penalties',
    columns: ['penalty_id', 'race_id', 'driver_id', 'penalty_type_id', 'time_penalty_seconds', 'reason'],
    numeric: ['time_penalty_seconds'],
  },
  driver_standing: {
    label: 'Driver Standings',
    columns: ['season_id', 'driver_id', 'total_points', 'wins', 'final_position'],
    numeric: ['total_points', 'wins', 'final_position'],
  },
  constructor_standing: {
    label: 'Constructor Standings',
    columns: ['season_id', 'team_id', 'total_points', 'wins', 'final_position'],
    numeric: ['total_points', 'wins', 'final_position'],
  },
  fastest_lap: {
    label: 'Fastest Laps',
    columns: ['race_id', 'driver_id', 'lap_number', 'lap_time_seconds'],
    numeric: ['lap_number', 'lap_time_seconds'],
  },
  sector_time: {
    label: 'Sector Times',
    columns: ['race_id', 'driver_id', 'lap_number', 'sector_number', 'sector_time_seconds'],
    numeric: ['lap_number', 'sector_number', 'sector_time_seconds'],
  },
  sponsor: {
    label: 'Sponsors',
    columns: ['sponsor_id', 'sponsor_name', 'industry', 'country'],
    numeric: [],
  },
  team_sponsor: {
    label: 'Team Sponsors',
    columns: ['team_id', 'sponsor_id', 'season_id', 'sponsorship_type'],
    numeric: [],
  },
  race_status: {
    label: 'Race Status',
    columns: ['status_id', 'status_name'],
    numeric: [],
  },
  penalty_type: {
    label: 'Penalty Types',
    columns: ['penalty_type_id', 'type_name'],
    numeric: [],
  },
  user_login: {
    label: 'Users',
    columns: ['user_id', 'username', 'role_name', 'created_at', 'is_active'],
    numeric: [],
  },
  application_audit_log: {
    label: 'Audit Log',
    columns: ['log_id', 'table_name', 'operation_type', 'record_id', 'changed_at', 'details', 'changed_by'],
    numeric: [],
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
  Williams: '#41a6ff',
  'Racing Bulls': '#6692ff',
  Haas: '#d0d3d8',
  'Kick Sauber': '#52e252',
  Alpine: '#2a9df4',
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