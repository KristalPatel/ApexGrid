import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getHome } from '../api.js'
import Counter from '../components/Counter.jsx'

const fade = {
  initial: { opacity: 0, y: 50 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.8, ease: 'easeOut' },
}

export default function Home() {
  const [data, setData] = useState(null)
  useEffect(() => { getHome().then(setData) }, [])

  return (
    <div>
      {/* 1. Intro */}
      <section className="scene">
        <div className="glow" style={{ top: '5%', left: '-200px' }} />
        <div className="container">
          <motion.p className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            Season 2025
          </motion.p>
          <motion.h1 className="hero-title" initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
            Welcome to <em>Apex</em>Grid
          </motion.h1>
          <motion.p className="page-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            Every driver, every team, every lap. Ready to explore?
          </motion.p>
          <motion.p
            className="scroll-hint"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
          >
            Scroll to explore ↓
          </motion.p>
        </div>
      </section>

      {data && (
        <>
          {/* 2. Reigning champion */}
          <section className="scene">
            <div className="glow" style={{ top: '10%', right: '-250px' }} />
            <div className="container champ-grid">
              <motion.div {...fade}>
                <p className="eyebrow">Reigning world champion</p>
                <h2 className="page-title">{data.champion.full_name}</h2>
                <div className="stat-row">
                  <div><span>Wins</span><b>{data.champion.wins}</b></div>
                  <div><span>Points</span><b>{data.champion.points}</b></div>
                  <div><span>Team</span><b>{data.champion.team_name}</b></div>
                </div>
                <Link to="/drivers" className="btn">Know more</Link>
              </motion.div>
              <motion.div {...fade} className="portrait">{data.champion.driver_code}</motion.div>
            </div>
          </section>

          {/* 3. Constructors' champion */}
          <section className="scene" style={{ background: 'var(--bg-2)' }}>
            <div className="container">
              <motion.div {...fade}>
                <p className="eyebrow">Constructors&apos; champion</p>
                <h2 className="page-title">{data.constructorChampion.team_name}</h2>
                <div className="stat-row">
                  <div><span>Points</span><b>{data.constructorChampion.points}</b></div>
                  <div><span>Wins</span><b>{data.constructorChampion.wins}</b></div>
                  <div><span>Team chief</span><b>{data.constructorChampion.team_chief}</b></div>
                </div>
                <Link to="/teams" className="btn ghost">See all teams</Link>
              </motion.div>
            </div>
          </section>

          {/* 4. Counters */}
          <section className="scene">
            <div className="container">
              <motion.p className="eyebrow" {...fade}>The season in numbers</motion.p>
              <div className="grid cols-4" style={{ marginTop: 30 }}>
                {data.counters.map((c, i) => (
                  <motion.div key={c.label} className="card" {...fade} transition={{ ...fade.transition, delay: i * 0.12 }}>
                    <div className="big-number"><Counter to={c.value} /></div>
                    <p className="meta">{c.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* 5. Season records */}
          <section className="scene" style={{ background: 'var(--bg-2)' }}>
            <div className="container">
              <motion.p className="eyebrow" {...fade}>Season records</motion.p>
              <div className="grid cols-3" style={{ marginTop: 30 }}>
                {data.records.map((r, i) => (
                  <motion.div key={r.label} className="card" {...fade} transition={{ ...fade.transition, delay: i * 0.12 }}>
                    <p className="meta">{r.label}</p>
                    <div className="big-number">{r.value}</div>
                    <p className="meta">{r.note}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* 6. Explore */}
          <section className="scene">
            <div className="container">
              <motion.p className="eyebrow" {...fade}>Explore</motion.p>
              <div className="grid cols-4" style={{ marginTop: 30 }}>
                {[
                  ['/drivers', 'Drivers', 'Stats, wins and points'],
                  ['/teams', 'Teams', 'Constructors and chiefs'],
                  ['/races', 'Races', 'Every round and its winner'],
                  ['/circuits', 'Circuits', 'Tracks around the world'],
                ].map(([to, title, text], i) => (
                  <motion.div key={to} {...fade} transition={{ ...fade.transition, delay: i * 0.1 }}>
                    <Link to={to} className="card" style={{ display: 'block' }}>
                      <h3>{title}</h3>
                      <p className="meta">{text}</p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
