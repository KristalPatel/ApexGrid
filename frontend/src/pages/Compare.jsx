import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getCompare, getDrivers } from '../api.js'
import { getDriverImage } from '../config/driverImages.js'
import { teamColor } from '../components/driver/driverUtils.js'
import '../compare.css'

const RACE_WIN_POINTS = 25 // points for a win, used to say how many wins a gap is worth

const fmt = (n) => (n == null ? '–' : Number(n).toLocaleString('en', { maximumFractionDigits: 1 }))

// One row: left value, label in the middle, right value. `better` says which side is higher or lower.
// With `bar`, a split bar shows each driver's share of the two values.
function StatRow({ label, a, b, lowerIsBetter = false, bar = false, suffix = '', judge = true }) {
  const known = a != null && b != null
  const aWins = judge && known && a !== b && (lowerIsBetter ? a < b : a > b)
  const bWins = judge && known && a !== b && (lowerIsBetter ? b < a : b > a)
  const total = known ? Number(a) + Number(b) : 0
  const share = total > 0 ? (Number(a) / total) * 100 : 50
  return (
    <div className="cmp-row">
      <div className={`cmp-val a${aWins ? ' win' : ''}`}>{fmt(a)}<small>{suffix}</small></div>
      <div className="cmp-mid">
        <div className="cmp-label">{label}</div>
        {bar && known && (
          <div className="cmp-bar" aria-hidden="true">
            <i className="a" style={{ width: `${share}%` }} />
            <i className="b" style={{ width: `${100 - share}%` }} />
          </div>
        )}
      </div>
      <div className={`cmp-val b${bWins ? ' win' : ''}`}>{fmt(b)}<small>{suffix}</small></div>
    </div>
  )
}

function Head({ d, side, color }) {
  const img = getDriverImage(d.driver_code)
  return (
    <div className={`cmp-head ${side}`} style={{ '--c': color }}>
      <div className="cmp-photo">{img ? <img src={img} alt="" /> : d.driver_code}</div>
      <div>
        <div className="cmp-num">{d.car_number != null ? `#${d.car_number}` : d.driver_code}</div>
        <h2>{d.first_name} <span>{d.last_name}</span></h2>
        <p className="meta">{[d.team_name, d.nationality].filter(Boolean).join(' · ')}</p>
      </div>
    </div>
  )
}

// How far this driver is from the championship leader.
function GapCard({ d, leader, color }) {
  const wins = d.gap_to_leader != null ? d.gap_to_leader / RACE_WIN_POINTS : null
  return (
    <div className="cmp-gap-card" style={{ '--c': color }}>
      <div className="who">{d.full_name}</div>
      {d.points == null ? (
        <p>No standings data for this driver.</p>
      ) : d.is_leader ? (
        <>
          <div className="big">Leader<small>{fmt(d.points)} pts</small></div>
          <p>Top of the championship table.</p>
        </>
      ) : (
        <>
          <div className="big">{fmt(d.gap_to_leader)}<small>pts behind</small></div>
          <p>
            Behind {leader.full_name} ({fmt(leader.points)} pts).
            {wins != null && wins > 0 && (wins < 1
              ? ` That is less than one race win (${RACE_WIN_POINTS} pts).`
              : ` That is about ${wins.toFixed(1)} race wins (${RACE_WIN_POINTS} pts each).`)}
          </p>
        </>
      )}
      {d.pct_of_leader != null && (
        <>
          <div className="cmp-track" aria-hidden="true"><i style={{ width: `${Math.min(100, d.pct_of_leader)}%` }} /></div>
          <p>{d.pct_of_leader}% of the leader's points</p>
        </>
      )}
    </div>
  )
}

export default function Compare() {
  const [params, setParams] = useSearchParams()
  const [drivers, setDrivers] = useState([])
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { getDrivers().then(setDrivers).catch((e) => setError(e.message)) }, [])

  // Default to the top two drivers of the championship.
  const a = params.get('a') || (drivers[0] ? String(drivers[0].driver_id) : '')
  const b = params.get('b') || (drivers[1] ? String(drivers[1].driver_id) : '')

  useEffect(() => {
    if (!a || !b) return
    if (a === b) { setData(null); setError('Pick two different drivers.'); return }
    let alive = true
    setLoading(true)
    getCompare(a, b)
      .then((r) => { if (alive) { setData(r); setError('') } })
      .catch((e) => { if (alive) { setData(null); setError(e.message) } })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [a, b])

  const pick = (key) => (e) => {
    const next = new URLSearchParams(params)
    next.set('a', key === 'a' ? e.target.value : a)
    next.set('b', key === 'b' ? e.target.value : b)
    setParams(next, { replace: true })
  }

  // Two teammates share a colour, so the second driver gets a neutral one.
  const colors = useMemo(() => {
    if (!data) return { a: '#e10600', b: '#9a9aa6' }
    const ca = teamColor(data.a.team_name)
    let cb = teamColor(data.b.team_name)
    if (cb === ca) cb = '#d0d3d8'
    return { a: ca, b: cb }
  }, [data])

  const summary = data && data.points_gap != null && (
    data.points_gap === 0
      ? <>Both drivers have the same points.</>
      : <><b>{(data.a.points > data.b.points ? data.a : data.b).last_name}</b> <span>is</span> <b>{fmt(data.points_gap)} pts</b>{' '}
          <span>ahead of</span> <b>{(data.a.points > data.b.points ? data.b : data.a).last_name}</b></>
  )

  return (
    <div className="page container">
      <p className="eyebrow">{data?.season_year ? `${data.season_year} season` : 'Season'}</p>
      <h1 className="page-title">Head to head</h1>
      <p className="page-sub">Pick two drivers to compare their season and see how far each one is from the championship lead.</p>

      <div className="cmp-pickers">
        <div className="cmp-field">
          <label htmlFor="cmp-a">Driver 1</label>
          <select id="cmp-a" value={a} onChange={pick('a')}>
            {drivers.map((d) => <option key={d.driver_id} value={d.driver_id}>{d.full_name} ({d.driver_code})</option>)}
          </select>
        </div>
        <div className="vs">VS</div>
        <div className="cmp-field">
          <label htmlFor="cmp-b">Driver 2</label>
          <select id="cmp-b" value={b} onChange={pick('b')}>
            {drivers.map((d) => <option key={d.driver_id} value={d.driver_id}>{d.full_name} ({d.driver_code})</option>)}
          </select>
        </div>
      </div>

      {error && <p className="cmp-msg err">{error}</p>}
      {loading && !data && <p className="cmp-msg">Loading…</p>}

      {data && (
        <div style={{ '--ca': colors.a, '--cb': colors.b, opacity: loading ? 0.6 : 1, transition: 'opacity .2s' }}>
          <div className="cmp-heads">
            <Head d={data.a} side="a" color={colors.a} />
            <Head d={data.b} side="b" color={colors.b} />
          </div>

          <div className="cmp-panel">
            <h3>SEASON</h3>
            <StatRow label="Championship position" a={data.a.standing_position} b={data.b.standing_position} lowerIsBetter />
            <StatRow label="Points" a={data.a.points} b={data.b.points} bar />
            <StatRow label="Wins" a={data.a.wins} b={data.b.wins} bar />
            <StatRow label="Age" a={data.a.age} b={data.b.age} judge={false} />
          </div>

          <div className="cmp-panel">
            <h3>DISTANCE FROM THE CHAMPIONSHIP LEAD</h3>
            {summary && <p className="cmp-summary">{summary}</p>}
            <div className="cmp-gap">
              <GapCard d={data.a} leader={data.leader} color={colors.a} />
              <GapCard d={data.b} leader={data.leader} color={colors.b} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
