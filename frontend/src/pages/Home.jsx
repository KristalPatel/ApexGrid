import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { getHome, getTable, getDrivers, getRaces } from '../api.js'
import RaceStartIntro from '../components/home/RaceStartIntro.jsx'
import HeroChampion from '../components/home/HeroChampion.jsx'
import Constructors from '../components/home/Constructors.jsx'
import RaceTransition from '../components/home/RaceTransition.jsx'
import WorldOfRacing from '../components/home/WorldOfRacing.jsx'
import FinalPaddock from '../components/home/FinalPaddock.jsx'
import '../home.css'

const SEEN_KEY = 'apexgrid_intro_seen'

function introShouldPlay() {
  try {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false
    return sessionStorage.getItem(SEEN_KEY) !== '1'
  } catch { return true }
}

export default function Home() {
  const [home, setHome] = useState(null)
  const [tables, setTables] = useState({ driver: [], race: [], circuit: [] })
  const [intro, setIntro] = useState(introShouldPlay)

  // All data comes through the existing API layer. Failures fall back to empty states.
  useEffect(() => {
    let alive = true
    Promise.allSettled([getHome(), getDrivers(), getRaces(), getTable('circuit')]).then(([h, d, r, c]) => {
      if (!alive) return
      if (h.status === 'fulfilled') setHome(h.value)
      setTables({
        driver: d.status === 'fulfilled' && Array.isArray(d.value) ? d.value : [],
        race: r.status === 'fulfilled' && Array.isArray(r.value) ? r.value : [],
        circuit: c.status === 'fulfilled' && Array.isArray(c.value) ? c.value : [],
      })
    })
    return () => { alive = false }
  }, [])

  // Lock page scroll while the intro is on screen
  useEffect(() => {
    if (!intro) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [intro])

  const finishIntro = useCallback(() => {
    try { sessionStorage.setItem(SEEN_KEY, '1') } catch { /* private mode */ }
    setIntro(false)
  }, [])
  const replayIntro = useCallback(() => {
    window.scrollTo(0, 0)
    setIntro(true)
  }, [])

  const champion = home?.champion || null
  const team = home?.constructorChampion || null

  // Resolve a driver route only when the data supports it
  const driverId = useMemo(() => {
    if (!champion) return null
    if (champion.driver_id != null) return champion.driver_id
    const m = tables.driver.find((d) => d.driver_code === champion.driver_code || d.full_name === champion.full_name)
    return m?.driver_id ?? null
  }, [champion, tables.driver])

  // Season label comes from race dates if available
  const season = useMemo(() => {
    const years = tables.race.map((r) => String(r.race_date || '').slice(0, 4)).filter((y) => /^\d{4}$/.test(y))
    return years.length ? years.sort().pop() : null
  }, [tables.race])

  // Featured-circuit options: circuits joined to their latest race, by name
  const options = useMemo(() => {
    return tables.circuit.slice(0, 4).map((c) => {
      const races = tables.race.filter((r) => r.circuit_name === c.circuit_name)
      const race = races.sort((a, b) => String(b.race_date).localeCompare(String(a.race_date)))[0]
      return { key: c.circuit_id ?? c.circuit_name, ...c, race_name: race?.race_name, race_date: race?.race_date }
    })
  }, [tables.circuit, tables.race])

  return (
    <div className="home">
      <AnimatePresence>{intro && <RaceStartIntro key="intro" onDone={finishIntro} />}</AnimatePresence>
      <HeroChampion champion={champion} driverId={driverId} />
      <Constructors team={team} season={season} />
      <RaceTransition />
      <WorldOfRacing options={options} />
      <FinalPaddock onReplayIntro={replayIntro} />
    </div>
  )
}
