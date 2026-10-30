import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

// A decorative dot that circles the track. Runs only while the map is on screen.
function Runner({ pathRef, active }) {
  const dot = useRef(null)
  useEffect(() => {
    const path = pathRef.current
    const el = dot.current
    if (!active || !path || !el || typeof path.getTotalLength !== 'function') return undefined
    const len = path.getTotalLength()
    let raf
    let t0
    const tick = (t) => {
      if (t0 === undefined) t0 = t
      const p = path.getPointAtLength((((t - t0) / 8000) % 1) * len)
      el.setAttribute('transform', `translate(${p.x} ${p.y})`)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [pathRef, active])
  return (
    <g ref={dot}>
      <circle r="16" className="trk__halo" />
      <circle r="5.5" className="trk__dot" />
    </g>
  )
}

// `d` is an SVG path in a 800 x 420 box. `mini` is the small static version used on cards.
export default function TrackMap({ d, uid = 'a', mini = false }) {
  const reduce = useReducedMotion()
  const wrap = useRef(null)
  const pathRef = useRef(null)
  const visible = useInView(wrap, { margin: '-60px' })
  const [start, setStart] = useState(null)

  useEffect(() => {
    const p = pathRef.current
    if (mini || !p || typeof p.getPointAtLength !== 'function') return
    const a = p.getPointAtLength(0)
    const b = p.getPointAtLength(6)
    setStart({ x: a.x, y: a.y, deg: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI })
  }, [d, mini])

  if (mini) {
    return (
      <svg viewBox="0 0 800 420" className="trk trk--mini" aria-hidden="true">
        <path d={d} className="trk__mini-bg" />
        <path d={d} className="trk__mini" />
      </svg>
    )
  }

  const draw = {
    initial: reduce ? false : { pathLength: 0 },
    animate: { pathLength: 1 },
    transition: { duration: 2.4, ease: 'easeInOut' },
  }

  return (
    <div ref={wrap} className="trk-wrap">
      <svg viewBox="0 0 800 420" className="trk" role="img" aria-label="Stylised circuit layout">
        <defs>
          <filter id={`trk-glow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        {/* extrusion gives the track some thickness */}
        <path d={d} className="trk__ext" transform="translate(0 18)" />
        <path d={d} className="trk__ext2" transform="translate(0 9)" />
        <path d={d} className="trk__rim" />
        <path d={d} className="trk__body" />
        <motion.path key={`g${d}`} d={d} className="trk__glow" filter={`url(#trk-glow-${uid})`} {...draw} />
        <motion.path key={`l${d}`} ref={pathRef} d={d} className="trk__line" {...draw} />
        {start && (
          <g transform={`translate(${start.x} ${start.y}) rotate(${start.deg + 90})`} className="trk__start">
            <rect x="-17" y="-3" width="34" height="6" />
          </g>
        )}
        {!reduce && <Runner pathRef={pathRef} active={visible} />}
      </svg>
    </div>
  )
}
