import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import AssetImage from './AssetImage.jsx'

const slug = (s = '') => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

// Optional assets (.webp, .png, .jpg or .jpeg): /images/teams/<team>-garage and /images/cars/<team>
export default function Constructors({ team, season }) {
  const reduce = useReducedMotion()
  const name = team?.team_name
  const s = slug(name || 'mclaren')
  const stats = [
    ['Points', team?.points],
    ['Wins', team?.wins],
    ['Team chief', team?.team_chief],
  ].filter(([, v]) => v !== undefined && v !== null && v !== '')

  const view = { once: true, margin: '-120px' }
  const rise = (delay = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: view,
    transition: { duration: 0.8, delay, ease: 'easeOut' },
  })

  return (
    <section className="home-constructors">
      <motion.div className="home-constructors__garage" initial={reduce ? false : { opacity: 0, x: -60 }} whileInView={{ opacity: 1, x: 0 }} viewport={view} transition={{ duration: 1 }}>
        <AssetImage base={`/images/teams/${s}-garage`} alt={`${name || 'McLaren'} garage celebrating`} />
      </motion.div>
      <div className="home-constructors__glow" />
      <div className="container home-constructors__inner">
        <div className="home-constructors__copy">
          <motion.p className="home-kicker home-kicker--papaya" {...rise(0)}>Constructors&apos; champion</motion.p>
          <motion.h2 className="home-display" {...rise(0.1)}>{name || 'McLaren'}</motion.h2>
          {season && <motion.p className="home-season" {...rise(0.2)}>{season} season</motion.p>}
          <motion.p className="home-lead" {...rise(0.25)}>
            A championship belongs to everyone in the garage, not just the name on the helmet.
          </motion.p>
          {stats.length > 0 && (
            <div className="home-stats">
              {stats.map(([label, value], i) => (
                <motion.div key={label} {...rise(0.3 + i * 0.1)}>
                  <span>{label}</span>
                  <b>{value}</b>
                </motion.div>
              ))}
            </div>
          )}
          <motion.div className="home-actions" {...rise(0.65)}>
            <Link to={team?.team_id != null ? `/teams/${team.team_id}` : '/teams'} className="btn btn--papaya">Know more</Link>
            <Link to="/teams" className="btn ghost">See all teams</Link>
          </motion.div>
        </div>
        <motion.div className="home-constructors__car" initial={reduce ? false : { opacity: 0, x: 140 }} whileInView={{ opacity: 1, x: 0 }} viewport={view} transition={{ duration: 1.1, delay: 0.2, ease: 'easeOut' }}>
          <AssetImage base={`/images/cars/${s}`} alt={`${name || 'McLaren'} Formula 1 car`} />
        </motion.div>
      </div>
    </section>
  )
}