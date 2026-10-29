import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useReducedMotion } from 'framer-motion'
import { getDriverImage } from '../../config/driverImages.js'
import { TEAM_THEMES } from '../../config/appConfig.js'
import { hasNumber, initials } from './driverUtils.js'

function Card({ d, current }) {
  const img = getDriverImage(d.driver_code)
  const body = (
    <>
      <span className="dd-card__thumb">
        {img ? <img src={img} alt="" loading="lazy" decoding="async" /> : <span aria-hidden="true">{initials(d.full_name)}</span>}
      </span>
      <span className="dd-card__text">
        <b>{d.full_name}</b>
        {hasNumber(d.car_number) && <span className="dd-card__num">#{d.car_number}</span>}
        {d.team_name && (
          <span className="dd-card__team">
            <i style={{ background: TEAM_THEMES[d.team_name] || 'var(--dd-orange)' }} />
            {d.team_name}
          </span>
        )}
      </span>
    </>
  )
  // The current driver is not a link, so it can never navigate to itself.
  return current
    ? <div className="dd-card is-current" aria-current="page">{body}</div>
    : <Link className="dd-card" to={`/drivers/${d.driver_id}`}>{body}</Link>
}

export default function MoreDrivers({ drivers, status, currentId }) {
  const reduce = useReducedMotion()
  const rail = useRef(null)
  const [edge, setEdge] = useState({ left: false, right: false })

  const measure = useCallback(() => {
    const el = rail.current
    if (!el) return
    setEdge({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 })
  }, [])

  useEffect(() => {
    const el = rail.current
    if (!el) return undefined
    measure()
    el.addEventListener('scroll', measure, { passive: true })
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', measure); ro.disconnect() }
  }, [measure, drivers])

  // Bring the selected driver into view (horizontally only, never moves the page).
  useEffect(() => {
    const el = rail.current
    const cur = el?.querySelector('[aria-current="page"]')
    if (!el || !cur) return
    el.scrollLeft = Math.max(0, cur.offsetLeft - (el.clientWidth - cur.offsetWidth) / 2)
    measure()
  }, [currentId, drivers, measure])

  const nudge = (dir) => rail.current?.scrollBy({ left: dir * rail.current.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' })
  const overflow = edge.left || edge.right

  if (status === 'ok' && drivers.length === 0) return null

  return (
    <section className="dd-wrap dd-more" aria-labelledby="dd-more-title">
      <div className="dd-more__head">
        <h2 id="dd-more-title">More drivers</h2>
        <Link to="/drivers" className="dd-link">View all drivers →</Link>
      </div>

      {status === 'loading' && <p className="dd-note">Loading drivers…</p>}
      {status === 'error' && <p className="dd-note">Couldn’t load the other drivers right now.</p>}

      {status === 'ok' && (
        <div className="dd-more__row">
          {overflow && (
            <button type="button" className="dd-arrow" aria-label="Scroll drivers left" disabled={!edge.left} onClick={() => nudge(-1)}>‹</button>
          )}
          <div className="dd-rail" ref={rail}>
            {drivers.map((d) => (
              <Card key={d.driver_id} d={d} current={String(d.driver_id) === String(currentId)} />
            ))}
          </div>
          {overflow && (
            <button type="button" className="dd-arrow" aria-label="Scroll drivers right" disabled={!edge.right} onClick={() => nudge(1)}>›</button>
          )}
        </div>
      )}
    </section>
  )
}
