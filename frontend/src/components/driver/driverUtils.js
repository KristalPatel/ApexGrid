// Small helpers for the driver detail page. No data lives here, only formatting.

// Nationality (as stored in the driver table) -> ISO country code, used only to look up an
// optional local flag file at /images/flags/<code>.svg. Unknown values simply show no flag.
const NATIONALITY_ISO = {
  british: 'gb', 'great britain': 'gb', english: 'gb', dutch: 'nl', netherlands: 'nl', australian: 'au',
  monegasque: 'mc', spanish: 'es', italian: 'it', german: 'de', french: 'fr', finnish: 'fi',
  mexican: 'mx', canadian: 'ca', japanese: 'jp', thai: 'th', chinese: 'cn', danish: 'dk',
  brazilian: 'br', argentine: 'ar', argentinian: 'ar', 'new zealander': 'nz', american: 'us',
  austrian: 'at', swiss: 'ch', belgian: 'be', swedish: 'se', polish: 'pl', russian: 'ru', indian: 'in',
}
export const flagCode = (nationality) => NATIONALITY_ISO[String(nationality || '').trim().toLowerCase()] || null

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
// '1999-11-13' -> '13 NOV 1999'. Parsed by hand so timezones can never shift the day.
export function formatDob(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value || ''))
  if (!m) return null
  const month = MONTHS[Number(m[2]) - 1]
  return month ? `${Number(m[3])} ${month} ${m[1]}` : null
}

// first / last name for the two-tone title.
export function splitName(driver) {
  if (driver.first_name && driver.last_name) return { first: driver.first_name, last: driver.last_name }
  const parts = String(driver.full_name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length <= 1) return { first: '', last: parts[0] || '' }
  return { first: parts[0], last: parts.slice(1).join(' ') }
}

export const initials = (name) =>
  String(name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('')

export const hasNumber = (n) => n !== null && n !== undefined && n !== ''
