import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getTable } from '../api.js'
import { TEAM_THEMES } from '../config/appConfig.js'

// The whole page takes the driver's team colour by changing the --accent variable.
export default function DriverDetail() {
  const { id } = useParams()
  const [d, setD] = useState(null)
  useEffect(() => {
    getTable('driver').then((rows) => setD(rows.find((r) => String(r.driver_id) === id)))
  }, [id])

  if (!d) return <div className="page container"><p className="notice">Loading...</p></div>
  const color = TEAM_THEMES[d.team_name] || '#e10600'

  return (
    <div className="page" style={{ '--accent': color, '--accent-glow': color + '59' }}>
      <div className="glow" style={{ top: 60, right: -200 }} />
      <div className="container champ-grid">
        <div>
          <Link to="/drivers" className="eyebrow">← All drivers</Link>
          <h1 className="page-title">{d.full_name}</h1>
          <p className="page-sub">{d.team_name} · {d.nationality}</p>
          <div className="stat-row">
            <div><span>Wins</span><b>{d.wins}</b></div>
            <div><span>Points</span><b>{d.points}</b></div>
            <div><span>Code</span><b>{d.driver_code}</b></div>
          </div>
        </div>
        <DriverPortrait code={d.driver_code} name={d.full_name} />
      </div>
    </div>
  )
}
