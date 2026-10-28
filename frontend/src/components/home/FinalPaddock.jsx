import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'

export default function FinalPaddock({ onReplayIntro }) {
  const reduce = useReducedMotion()
  return (
    <>
      <section className="home-final">
        <div className="home-final__glow" />
        <motion.div className="container home-final__inner" initial={reduce ? false : { opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.8 }}>
          <h2 className="home-display">Your grid.<br /><em>Your story.</em></h2>
          <p className="home-lead">Discover the drivers, teams, races, and circuits that make Formula 1 extraordinary.</p>
          <div className="home-actions home-actions--center">
            <Link to="/drivers" className="btn">Explore the grid</Link>
            <Link to="/login" className="btn ghost">Sign in for your personal paddock</Link>
          </div>
        </motion.div>
      </section>
      <footer className="home-footer">
        <div className="container home-footer__inner">
          <span className="logo">APEX<span>GRID</span></span>
          <nav aria-label="Footer">
            <Link to="/drivers">Drivers</Link>
            <Link to="/teams">Teams</Link>
            <Link to="/races">Races</Link>
            <Link to="/circuits">Circuits</Link>
            {onReplayIntro && <button type="button" onClick={onReplayIntro}>Replay intro</button>}
          </nav>
        </div>
      </footer>
    </>
  )
}
