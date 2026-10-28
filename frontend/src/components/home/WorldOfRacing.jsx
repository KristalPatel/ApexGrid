import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useReducedMotion } from 'framer-motion'

// Illustrative layouts only. They are NOT accurate circuit outlines.
const LAYOUTS = [
  'M120 250 C60 250 40 200 80 170 L170 120 C200 100 230 110 240 140 C250 170 290 170 320 140 L400 70 C430 40 480 50 490 90 C500 130 470 150 440 170 L420 190 C400 210 420 250 470 250 L520 250 C560 250 570 300 520 310 L160 310 C120 310 100 280 120 250 Z',
  'M100 200 C100 130 160 90 230 100 L330 115 C380 122 400 90 440 80 C500 66 540 110 520 160 C505 200 450 205 430 240 C415 270 440 300 400 310 L220 315 C150 318 100 270 100 200 Z',
  'M90 270 L90 150 C90 110 130 90 160 110 L230 160 C260 180 300 160 300 125 L300 90 C300 60 340 50 365 70 L500 175 C530 198 520 240 485 245 L380 255 C350 258 340 290 365 305 L400 320 L140 320 C110 320 90 300 90 270 Z',
]

function TrackDot({ pathRef, active }) {
  const dot = useRef(null)
  useEffect(() => {
    const path = pathRef.current
    const el = dot.current
    if (!active || !path || !el) return undefined
    const len = path.getTotalLength()
    let raf
    let t0
    const tick = (t) => {
      if (t0 === undefined) t0 = t
      const p = path.getPointAtLength((((t - t0) / 9000) % 1) * len)
      el.setAttribute('transform', `translate(${p.x} ${p.y})`)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [pathRef, active])
  return (
    <g ref={dot}>
      <circle r="14" className="home-track__dot-halo" />
      <circle r="5" className="home-track__dot" />
    </g>
  )
}

export default function WorldOfRacing({ options = [] }) {
  const reduce = useReducedMotion()
  const [sel, setSel] = useState(0)
  const wrap = useRef(null)
  const pathRef = useRef(null)
  const visible = useInView(wrap, { margin: '-80px' })
  const opt = options[sel] || null

  return (
    <section className="home-world">
      <div className="container">
        <motion.p className="home-kicker" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          Races. Circuits. Moments that matter.
        </motion.p>
        <motion.h2 className="home-display" initial={reduce ? false : { opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8 }}>
          Every corner<br /><em>tells a story.</em>
        </motion.h2>

        <div className="home-world__stage" ref={wrap}>
          <svg className="home-track" viewBox="0 0 620 360" role="img" aria-label="Illustrative circuit layout with an animated racing line">
            <defs>
              <filter id="home-track-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" />
              </filter>
            </defs>
            <path key={`b${sel}`} d={LAYOUTS[sel % LAYOUTS.length]} className="home-track__base" />
            <motion.path
              key={`g${sel}`}
              d={LAYOUTS[sel % LAYOUTS.length]}
              className="home-track__glow"
              filter="url(#home-track-glow)"
              initial={reduce ? false : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2.2, ease: 'easeInOut' }}
            />
            <motion.path
              key={`l${sel}`}
              ref={pathRef}
              d={LAYOUTS[sel % LAYOUTS.length]}
              className="home-track__line"
              initial={reduce ? false : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2.2, ease: 'easeInOut' }}
            />
            {!reduce && <TrackDot pathRef={pathRef} active={visible} />}
          </svg>
          <p className="home-track__note">Illustrative layout, not an accurate circuit map.</p>

          <div className="home-gp">
            <p className="home-gp__label">Featured Grand Prix</p>
            {opt ? (
              <>
                <h3>{opt.race_name || opt.circuit_name}</h3>
                <dl>
                  {opt.circuit_name && <div><dt>Circuit</dt><dd>{opt.circuit_name}</dd></div>}
                  {opt.country && <div><dt>Country</dt><dd>{opt.country}</dd></div>}
                  {opt.race_date && <div><dt>Date</dt><dd>{opt.race_date}</dd></div>}
                  {opt.length_km != null && <div><dt>Length</dt><dd>{opt.length_km} km</dd></div>}
                  {opt.laps != null && <div><dt>Laps</dt><dd>{opt.laps}</dd></div>}
                </dl>
                {options.length > 1 && (
                  <div className="home-gp__picker" role="group" aria-label="Choose a featured circuit">
                    {options.map((o, i) => (
                      <button key={o.key} type="button" className={i === sel ? 'on' : ''} aria-pressed={i === sel} onClick={() => setSel(i)}>
                        {o.circuit_name}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="home-gp__empty">Race details will appear here.</p>
            )}
          </div>
        </div>

        <div className="home-actions">
          <Link to="/races" className="btn">Explore races</Link>
          <Link to="/circuits" className="btn ghost">Explore circuits</Link>
        </div>
      </div>
    </section>
  )
}
