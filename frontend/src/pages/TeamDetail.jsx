import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { getDrivers, getTeams } from '../api.js'
import AssetImage from '../components/home/AssetImage.jsx'
import { getDriverImage } from '../config/driverImages.js'
import { hasNumber, hexToRgb, initials, teamColor } from '../components/driver/driverUtils.js'
import { ordinal, teamSlug } from '../components/team/teamUtils.js'
import '../team.css'

const EASE = [0.22, 1, 0.36, 1]
const show = (v) => (v === null || v === undefined || v === '' ? '—' : v)

// Route: /teams/:id  (id is team_id)
// The car photo is an optional local file: /images/cars/<team-slug>.(webp|png|jpg|jpeg), transparent background.
export default function TeamDetail() {
  const { id } = useParams()
  const reduce = useReducedMotion()
  const [state, setState] = useState({ status: 'loading', teams: [], drivers: [] }) // loading | ok | missing | error
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let alive = true
    setState({ status: 'loading', teams: [], drivers: [] })
    Promise.all([getTeams(), getDrivers()])
      .then(([teams, drivers]) => {
        if (!alive) return
        const t = Array.isArray(teams) ? teams : []
        const found = t.some((x) => String(x.team_id) === String(id))
        setState({ status: found ? 'ok' : 'missing', teams: t, drivers: Array.isArray(drivers) ? drivers : [] })
      })
      .catch(() => alive && setState({ status: 'error', teams: [], drivers: [] }))
    return () => { alive = false }
  }, [id, attempt])

  const view = useMemo(() => {
    if (state.status !== 'ok') return null
    const idx = state.teams.findIndex((x) => String(x.team_id) === String(id))
    const team = state.teams[idx]
    const n = state.teams.length
    return {
      team,
      drivers: state.drivers.filter((d) => String(d.team_id) === String(team.team_id)),
      prev: n > 1 ? state.teams[(idx - 1 + n) % n] : null,
      next: n > 1 ? state.teams[(idx + 1) % n] : null,
    }
  }, [state, id])

  if (state.status === 'loading') return <main className="td"><p className="td-note td-pad" role="status">Loading team…</p></main>

  if (state.status !== 'ok') {
    const missing = state.status === 'missing'
    return (
      <main className="td td-msg">
        <p className="td-eyebrow">{missing ? 'Team not found' : 'Something went wrong'}</p>
        <h1 className="td-title">{missing ? 'No such team' : 'Couldn’t load this team'}</h1>
        <div className="td-actions">
          {!missing && <button type="button" className="btn" onClick={() => setAttempt((n) => n + 1)}>Try again</button>}
          <Link to="/teams" className="btn ghost">All teams</Link>
        </div>
      </main>
    )
  }

  const { team, drivers, prev, next } = view
  const color = teamColor(team.team_name)
  const theme = { '--td-color': color, '--td-rgb': hexToRgb(color) }
  const slug = teamSlug(team.team_name)

  // Entrance: car first, then text from the left and details from the right.
  const slide = (x, delay) =>
    reduce
      ? {}
      : { initial: { opacity: 0, x }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.9, delay, ease: EASE } }
  const rise = (delay = 0) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y: 36 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-80px' }, transition: { duration: 0.8, delay, ease: EASE } }

  const stats = [
    ['Points', team.points],
    ['Wins', team.wins],
    ['Standing', team.standing_position != null ? ordinal(team.standing_position) : null],
  ]
  const details = [
    ['Team chief', team.team_chief],
    ['Nationality', team.country],
  ].filter(([, v]) => v)

  return (
    <main className="td" style={theme} key={team.team_id}>
      <section className="td-hero">
        <div className="td-glow" aria-hidden="true" />
        <span className="td-watermark" aria-hidden="true">{team.team_name}</span>

        <nav className="td-crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link><span aria-hidden="true">›</span>
          <Link to="/teams">Teams</Link><span aria-hidden="true">›</span>
          <span aria-current="page">{team.team_name}</span>
        </nav>

        <motion.div
          className="td-car"
          initial={reduce ? false : { opacity: 0, x: 220, scale: 0.94 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: EASE }}
        >
          <AssetImage base={`/images/cars/${slug}`} alt={`${team.team_name} Formula 1 car`} eager />
          <div className="td-floor" aria-hidden="true" />
        </motion.div>
      </section>

      <section className="td-info">
        <motion.div className="td-left" {...slide(-90, 0.5)}>
          <p className="td-eyebrow">Constructor</p>
          <h1 className="td-title">{team.team_name}</h1>
          {details.length > 0 && (
            <dl className="td-details">
              {details.map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
          )}
        </motion.div>

        <motion.dl className="td-stats" aria-label="Championship stats" {...slide(90, 0.7)}>
          {stats.map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{show(v)}</dd></div>
          ))}
        </motion.dl>
      </section>

      <section className="td-drivers" aria-labelledby="td-drivers-title">
        <motion.h2 id="td-drivers-title" {...rise(0)}>Drivers</motion.h2>
        {drivers.length === 0 ? (
          <p className="td-note">No drivers are listed for this team yet.</p>
        ) : (
          <div className="td-driver-grid">
            {drivers.map((d, i) => {
              const img = getDriverImage(d.driver_code)
              return (
                <motion.div key={d.driver_id} {...rise(i * 0.12)}>
                  <Link to={`/drivers/${d.driver_id}`} className="td-driver">
                    <span className="td-driver__thumb">
                      {img ? <img src={img} alt="" loading="lazy" decoding="async" /> : <span aria-hidden="true">{initials(d.full_name)}</span>}
                    </span>
                    <span className="td-driver__text">
                      <b>{d.full_name}</b>
                      <span>{[hasNumber(d.car_number) && `#${d.car_number}`, d.driver_code].filter(Boolean).join(' · ')}</span>
                    </span>
                    <span className="td-driver__arrow" aria-hidden="true">→</span>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </section>

      <nav className="td-pager" aria-label="Other teams">
        {prev ? <Link to={`/teams/${prev.team_id}`}>← {prev.team_name}</Link> : <span />}
        <Link to="/teams" className="td-pager__all">All teams</Link>
        {next ? <Link to={`/teams/${next.team_id}`}>{next.team_name} →</Link> : <span />}
      </nav>
    </main>
  )
}
