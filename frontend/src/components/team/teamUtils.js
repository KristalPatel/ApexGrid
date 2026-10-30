// Same rule the homepage uses, so one image name works everywhere:
// "Red Bull Racing" -> /images/cars/red-bull-racing.(webp|png|jpg|jpeg)
export const teamSlug = (name = '') =>
  String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export function ordinal(n) {
  const v = Number(n)
  if (!Number.isFinite(v)) return null
  const mod100 = v % 100
  if (mod100 >= 11 && mod100 <= 13) return `${v}th`
  return `${v}${{ 1: 'st', 2: 'nd', 3: 'rd' }[v % 10] || 'th'}`
}
