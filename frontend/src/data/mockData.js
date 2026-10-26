// PLACEHOLDER DATA so the screens look alive before the database is connected.
// Names, wins and points here are illustrative only. Real numbers will come from MySQL.

export const drivers = [
  { driver_id: 1, full_name: 'Lando Norris', driver_code: 'NOR', nationality: 'British', team_name: 'McLaren', wins: 7, points: 423 },
  { driver_id: 2, full_name: 'Oscar Piastri', driver_code: 'PIA', nationality: 'Australian', team_name: 'McLaren', wins: 7, points: 410 },
  { driver_id: 3, full_name: 'Max Verstappen', driver_code: 'VER', nationality: 'Dutch', team_name: 'Red Bull Racing', wins: 8, points: 421 },
  { driver_id: 4, full_name: 'George Russell', driver_code: 'RUS', nationality: 'British', team_name: 'Mercedes', wins: 2, points: 319 },
  { driver_id: 5, full_name: 'Charles Leclerc', driver_code: 'LEC', nationality: 'Monegasque', team_name: 'Ferrari', wins: 0, points: 242 },
  { driver_id: 6, full_name: 'Lewis Hamilton', driver_code: 'HAM', nationality: 'British', team_name: 'Ferrari', wins: 0, points: 156 },
  { driver_id: 7, full_name: 'Kimi Antonelli', driver_code: 'ANT', nationality: 'Italian', team_name: 'Mercedes', wins: 0, points: 150 },
  { driver_id: 8, full_name: 'Fernando Alonso', driver_code: 'ALO', nationality: 'Spanish', team_name: 'Aston Martin', wins: 0, points: 56 },
]

export const teams = [
  { team_id: 1, team_name: 'McLaren', team_chief: 'Andrea Stella', country: 'United Kingdom', wins: 14, points: 833 },
  { team_id: 2, team_name: 'Mercedes', team_chief: 'Toto Wolff', country: 'Germany', wins: 2, points: 469 },
  { team_id: 3, team_name: 'Ferrari', team_chief: 'Frederic Vasseur', country: 'Italy', wins: 0, points: 398 },
  { team_id: 4, team_name: 'Red Bull Racing', team_chief: 'Laurent Mekies', country: 'Austria', wins: 8, points: 451 },
  { team_id: 5, team_name: 'Aston Martin', team_chief: 'Andy Cowell', country: 'United Kingdom', wins: 0, points: 89 },
]

export const circuits = [
  { circuit_id: 1, circuit_name: 'Monza', country: 'Italy', length_km: 5.793, laps: 53 },
  { circuit_id: 2, circuit_name: 'Silverstone', country: 'United Kingdom', length_km: 5.891, laps: 52 },
  { circuit_id: 3, circuit_name: 'Suzuka', country: 'Japan', length_km: 5.807, laps: 53 },
  { circuit_id: 4, circuit_name: 'Spa-Francorchamps', country: 'Belgium', length_km: 7.004, laps: 44 },
  { circuit_id: 5, circuit_name: 'Interlagos', country: 'Brazil', length_km: 4.309, laps: 71 },
  { circuit_id: 6, circuit_name: 'Marina Bay', country: 'Singapore', length_km: 4.94, laps: 62 },
]

export const races = [
  { race_id: 1, round: 1, race_name: 'Japanese Grand Prix', circuit_name: 'Suzuka', race_date: '2025-04-06', winner: 'Max Verstappen' },
  { race_id: 2, round: 2, race_name: 'British Grand Prix', circuit_name: 'Silverstone', race_date: '2025-07-06', winner: 'Lando Norris' },
  { race_id: 3, round: 3, race_name: 'Belgian Grand Prix', circuit_name: 'Spa-Francorchamps', race_date: '2025-07-27', winner: 'Oscar Piastri' },
  { race_id: 4, round: 4, race_name: 'Italian Grand Prix', circuit_name: 'Monza', race_date: '2025-09-07', winner: 'Max Verstappen' },
  { race_id: 5, round: 5, race_name: 'Singapore Grand Prix', circuit_name: 'Marina Bay', race_date: '2025-10-05', winner: 'George Russell' },
  { race_id: 6, round: 6, race_name: 'Brazilian Grand Prix', circuit_name: 'Interlagos', race_date: '2025-11-09', winner: 'Lando Norris' },
]

export const seasonRecords = [
  { label: 'Fastest lap', value: '1:21.4', note: 'Monza' },
  { label: 'Fastest pit stop', value: '1.92 s', note: 'McLaren' },
  { label: 'Most wins', value: '8', note: 'Max Verstappen' },
]

export const seasonCounters = [
  { label: 'Races', value: 24 },
  { label: 'Drivers', value: 20 },
  { label: 'Laps raced', value: 1347 },
  { label: 'Pit stops', value: 889 },
]

export const userLogins = [
  { username: 'admin', password: 'admin123', role: 'DBA' },
  { username: 'fan', password: 'fan123', role: 'USER' },
]
