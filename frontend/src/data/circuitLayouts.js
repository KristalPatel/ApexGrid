// Stylised circuit outlines for the circuit pages. These are NOT survey-accurate maps.
// The database has no track geometry, so each circuit gets one of these shapes.
//
// To use a real outline for a circuit, add its SVG path (viewBox 0 0 800 420) to
// EXACT_LAYOUTS below, keyed by the circuit name in lowercase.

// Closed, smooth path through a list of points (Catmull-Rom converted to cubic Beziers).
function smoothClosed(pts, tension = 0.5) {
  const n = pts.length
  const p = (i) => pts[(i + n) % n]
  let d = `M ${p(0)[0]} ${p(0)[1]}`
  for (let i = 0; i < n; i += 1) {
    const [x0, y0] = p(i - 1), [x1, y1] = p(i), [x2, y2] = p(i + 1), [x3, y3] = p(i + 2)
    const c1 = [x1 + ((x2 - x0) * tension) / 3, y1 + ((y2 - y0) * tension) / 3]
    const c2 = [x2 - ((x3 - x1) * tension) / 3, y2 - ((y3 - y1) * tension) / 3]
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${x2} ${y2}`
  }
  return `${d} Z`
}

const SHAPES = [
  // long straights with a hairpin
  [[120, 330], [110, 260], [180, 200], [300, 190], [360, 140], [480, 100], [640, 90], [720, 140], [700, 210], [620, 240], [560, 300], [600, 350], [520, 380], [300, 385], [190, 370]],
  // tight and twisty
  [[140, 300], [130, 220], [210, 150], [290, 170], [330, 240], [400, 260], [470, 200], [450, 120], [540, 80], [640, 110], [670, 190], [640, 260], [700, 320], [640, 380], [520, 360], [450, 320], [380, 350], [300, 380], [200, 370]],
  // figure of eight (crosses itself)
  [[490, 150], [590, 115], [690, 150], [710, 230], [650, 300], [540, 310], [460, 265], [340, 155], [260, 115], [160, 130], [110, 200], [135, 285], [235, 315], [330, 265], [410, 215]],
  // big sweeper
  [[130, 300], [160, 200], [260, 140], [420, 120], [600, 100], [720, 130], [730, 200], [650, 230], [540, 250], [470, 300], [500, 360], [400, 385], [250, 380], [160, 360]],
  // wide oval with a chicane
  [[110, 230], [150, 150], [260, 110], [400, 100], [540, 105], [660, 120], [720, 180], [700, 250], [620, 290], [540, 280], [490, 230], [430, 230], [390, 290], [300, 330], [200, 320]],
  // compact street style
  [[200, 340], [150, 280], [180, 210], [260, 200], [300, 150], [380, 130], [430, 180], [500, 190], [540, 140], [620, 120], [690, 170], [680, 250], [600, 280], [560, 340], [480, 370], [380, 350], [310, 380], [250, 370]],
]
export const GENERIC_LAYOUTS = SHAPES.map((s) => smoothClosed(s))

// circuit name (lowercase) -> exact SVG path. Empty on purpose; add real outlines here.
export const EXACT_LAYOUTS = {}

export function getLayout(circuit) {
  const exact = EXACT_LAYOUTS[String(circuit?.circuit_name || '').toLowerCase()]
  if (exact) return { d: exact, exact: true }
  const id = Number(circuit?.circuit_id)
  const i = Number.isFinite(id) ? Math.abs(id) % GENERIC_LAYOUTS.length : 0
  return { d: GENERIC_LAYOUTS[i], exact: false }
}
