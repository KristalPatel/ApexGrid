import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getDrivers } from '../api.js'
import { TEAM_THEMES } from '../config/appConfig.js'
import { getDriverImage } from '../config/driverImages.js'   // NEW

export default function Drivers() {
  const [rows, setRows] = useState([])
  useEffect(() => { getDrivers().then(setRows).catch(() => setRows([])) }, [])

  return (
    <div className="page container">
      <p className="eyebrow">2025 grid</p>
      <h1 className="page-title">Drivers</h1>
      <p className="page-sub" style={{ marginBottom: 36 }}>Click a driver to see their page in their team colours.</p>
      <div className="grid cols-4">
        {rows.map((d, i) => {
          const img = getDriverImage(d.driver_code)            // NEW: look up this driver's image
          return (
            <motion.div key={d.driver_id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link
                to={`/drivers/${d.driver_id}`}
                className="card"
                style={{ display: 'block', borderTop: `3px solid ${TEAM_THEMES[d.team_name] || 'var(--accent)'}` }}
              >
                {img && <img src={img} alt="" className="driver-thumb" />}   {/* NEW: shows only if an image exists */}
                <span className="pill">{d.driver_code}</span>
                <h3 style={{ marginTop: 10 }}>{d.full_name}</h3>
                <p className="meta">{[d.team_name, d.nationality].filter(Boolean).join(' · ')}</p>
                {d.wins != null && d.points != null && (
                  <p className="meta" style={{ marginTop: 10 }}>{d.wins} wins · {d.points} pts</p>
                )}
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}