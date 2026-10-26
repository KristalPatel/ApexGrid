import { useEffect, useState } from 'react'
import { getStats } from '../api.js'
import Counter from '../components/Counter.jsx'

// Section E: one card per table showing COUNT(*).
export default function Dashboard() {
  const [stats, setStats] = useState([])
  useEffect(() => { getStats().then(setStats) }, [])

  return (
    <div>
      <p className="eyebrow">Admin</p>
      <h1>Dashboard</h1>
      <p className="page-sub">How many rows each table holds right now.</p>
      <div className="stat-cards">
        {stats.map((s) => (
          <div className="stat-card" key={s.table}>
            <span>{s.table}</span>
            <b><Counter to={s.count} /></b>
          </div>
        ))}
      </div>
    </div>
  )
}
