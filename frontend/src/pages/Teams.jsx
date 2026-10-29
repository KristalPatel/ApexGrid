import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getTeams } from '../api.js'
import { TEAM_THEMES } from '../config/appConfig.js'

export default function Teams() {
  const [rows, setRows] = useState([])
  useEffect(() => { getTeams().then(setRows).catch(() => setRows([])) }, [])

  return (
    <div className="page container">
      <p className="eyebrow">Constructors</p>
      <h1 className="page-title">Teams</h1>
      <div className="grid cols-3" style={{ marginTop: 36 }}>
        {rows.map((t, i) => (
          <motion.div
            key={t.team_id}
            className="card"
            style={{ borderTop: `3px solid ${TEAM_THEMES[t.team_name] || 'var(--accent)'}` }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <h3>{t.team_name}</h3>
            <p className="meta">{[t.country, t.team_chief && `Chief: ${t.team_chief}`].filter(Boolean).join(' · ')}</p>
            {t.wins != null && t.points != null && (
              <p className="meta" style={{ marginTop: 10 }}>{t.wins} wins · {t.points} pts</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
