import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getTable, getRaces } from '../api.js'
import TrackMap from '../components/circuit/TrackMap.jsx'
import { getLayout } from '../data/circuitLayouts.js'
import '../circuit.css'

const km = (v) => (v == null || v === '' || Number.isNaN(Number(v)) ? null : Number(v).toFixed(2))

// ---------- /circuits ----------
export function Circuits() {
  const [state, setState] = useState({ status: 'loading', rows: [] })
  useEffect(() => {
    let alive = true
    getTable('circuit')
      .then((rows) => alive && setState({ status: 'ok', rows: Array.isArray(rows) ? rows : [] }))
      .catch(() => alive && setState({ status: 'error', rows: [] }))
    return () => { alive = false }
  }, [])

  return (
    <main className="cl">
      <div className="cl-wrap">
        <p className="eyebrow">Around the world</p>
        <h1 className="page-title">Circuits</h1>
        <p className="page-sub">Pick a circuit to see its layout and who has won there.</p>

        {state.status === 'loading' && <p className="cl-note">Loading circuits…</p>}
        {state.status === 'error' && <p className="cl-note">Couldn’t load the circuits. Check that the API is running.</p>}
        {state.status === 'ok' && state.rows.length === 0 && <p className="cl-note">No circuits have been added yet.</p>}

        <div className="cl-grid">
          {state.rows.map((c, i) => (
            <motion.div key={c.circuit_id} initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 12) * 0.04 }}>
              <Link to={`/circuits/${c.circuit_id}`} className="cl-card">
                <div className="cl-card__map"><TrackMap d={getLayout(c).d} mini /></div>
                <h3>{c.circuit_name}</h3>
                <p>{[c.city, c.country].filter(Boolean).join(' · ')}</p>
                {km(c.length_km) && <span className="cl-card__km">{km(c.length_km)} km</span>}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  )
}

// ---------- /circuits/:id ----------
export function CircuitDetail() {
  const { id } = useParams()
  const [state, setState] = useState({ status: 'loading', all: [], races: [] }) // loading | ok | missing | error
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let alive = true
    setState({ status: 'loading', all: [], races: [] })
    Promise.all([getTable('circuit'), getRaces()])
      .then(([all, races]) => {
        if (!alive) return
        const list = Array.isArray(all) ? all : []
        const found = list.some((c) => String(c.circuit_id) === String(id))
        setState({ status: found ? 'ok' : 'missing', all: list, races: Array.isArray(races) ? races : [] })
      })
      .catch(() => alive && setState({ status: 'error', all: [], races: [] }))
    return () => { alive = false }
  }, [id, attempt])

  const view = useMemo(() => {
    if (state.status !== 'ok') return null
    const idx = state.all.findIndex((c) => String(c.circuit_id) === String(id))
    const circuit = state.all[idx]
    const here = state.races
      .filter((r) => String(r.circuit_id) === String(circuit.circuit_id))
      .sort((a, b) => String(b.race_date).localeCompare(String(a.race_date)))
    const n = state.all.length
    return {
      circuit,
      here,
      layout: getLayout(circuit),
      lastWinner: here.find((r) => r.winner)?.winner || null,
      prev: n > 1 ? state.all[(idx - 1 + n) % n] : null,
      next: n > 1 ? state.all[(idx + 1) % n] : null,
    }
  }, [state, id])

  if (state.status === 'loading') return <main className="cd"><p className="cl-note cd-pad">Loading circuit…</p></main>

  if (state.status === 'missing' || state.status === 'error') {
    return (
      <main className="cd cd-msg">
        <p className="eyebrow">{state.status === 'missing' ? 'Circuit not found' : 'Something went wrong'}</p>
        <h1 className="page-title">{state.status === 'missing' ? 'No such circuit' : 'Couldn’t load this circuit'}</h1>
        <div className="cd-actions">
          {state.status === 'error' && <button type="button" className="btn" onClick={() => setAttempt((n) => n + 1)}>Try again</button>}
          <Link to="/circuits" className="btn ghost">All circuits</Link>
        </div>
      </main>
    )
  }

  const { circuit, here, layout, lastWinner, prev, next } = view
  const length = km(circuit.length_km)

  return (
    <main className="cd">
      <section className="cd-hero">
        <div className="cd-glow" aria-hidden="true" />
        {circuit.country && <span className="cd-side" aria-hidden="true">{circuit.country}</span>}

        <div className="cd-head">
          <nav className="cd-crumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link><span aria-hidden="true">›</span>
            <Link to="/circuits">Circuits</Link><span aria-hidden="true">›</span>
            <span aria-current="page">{circuit.circuit_name}</span>
          </nav>
          <motion.p className="cd-eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {[circuit.city, circuit.country].filter(Boolean).join(' · ')}
          </motion.p>
          <motion.h1 className="cd-title" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            {circuit.circuit_name}
          </motion.h1>

          <dl className="cd-stats">
            {length && <div><dt>Length</dt><dd>{length}<small> km</small></dd></div>}
            <div><dt>Races on record</dt><dd>{here.length}</dd></div>
            <div><dt>Latest winner</dt><dd className="cd-stats__name">{lastWinner || '—'}</dd></div>
          </dl>
        </div>

        <div className="cd-map">
          <TrackMap d={layout.d} uid={String(circuit.circuit_id)} />
          {!layout.exact && <p className="cd-caption">Stylised layout, not an accurate map of this circuit.</p>}
        </div>

        {prev && next && (
          <div className="cd-pager">
            <Link to={`/circuits/${prev.circuit_id}`} aria-label={`Previous circuit: ${prev.circuit_name}`}>‹</Link>
            <Link to={`/circuits/${next.circuit_id}`} aria-label={`Next circuit: ${next.circuit_name}`}>›</Link>
          </div>
        )}
      </section>

      <section className="cd-lower">
        <h2>Races here</h2>
        {here.length === 0 ? (
          <p className="cl-note">No races have been recorded at this circuit yet.</p>
        ) : (
          <ul className="cd-races">
            {here.map((r) => (
              <li key={r.race_id}>
                <span className="cd-races__round">{r.season_year ? `${r.season_year} · ` : ''}R{r.round}</span>
                <span className="cd-races__name">{r.race_name}</span>
                <span className="cd-races__date">{r.race_date}</span>
                <span className="cd-races__winner">{r.winner || '—'}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="cd-actions">
          <Link to="/circuits" className="btn ghost">All circuits</Link>
          <Link to="/races" className="btn">Explore races</Link>
        </div>
      </section>
    </main>
  )
}
