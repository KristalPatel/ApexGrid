import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import AssetImage from './AssetImage.jsx'

// Optional assets: /images/cars/pass-1, pass-2, pass-3 (.webp, .png, .jpg or .jpeg).
// Use png/webp so the car has a transparent background.
const CARS = [
  { src: '/images/cars/pass-1', from: '120%', to: '-140%', top: '22%', w: '46vw', z: 3 },
  { src: '/images/cars/pass-2', from: '140%', to: '-120%', top: '48%', w: '34vw', z: 2 },
  { src: '/images/cars/pass-3', from: '160%', to: '-100%', top: '70%', w: '24vw', z: 1 },
]
const STREAKS = [
  { top: '18%', w: '55%', from: '60%', to: '-120%' },
  { top: '34%', w: '40%', from: '90%', to: '-90%' },
  { top: '52%', w: '65%', from: '50%', to: '-150%' },
  { top: '68%', w: '35%', from: '110%', to: '-70%' },
  { top: '82%', w: '50%', from: '70%', to: '-130%' },
]

function Layer({ progress, from, to, style, className, children, reduce }) {
  const x = useTransform(progress, [0.05, 0.95], [from, to])
  return <motion.div className={className} style={{ ...style, x: reduce ? 0 : x }}>{children}</motion.div>
}

export default function RaceTransition() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const titleY = useTransform(scrollYProgress, [0.2, 0.5], [40, 0])
  const titleO = useTransform(scrollYProgress, [0.2, 0.45, 0.8, 0.95], [0, 1, 1, 0])

  return (
    <section ref={ref} className="home-race-transition" aria-label="Every race makes history">
      <div className="home-race-transition__dark" />
      {STREAKS.map((s, i) => (
        <Layer key={i} progress={scrollYProgress} from={s.from} to={s.to} reduce={reduce} className={`home-streak${i > 2 ? ' home-streak--extra' : ''}`} style={{ top: s.top, width: s.w }} />
      ))}
      {CARS.map((c, i) => (
        <Layer key={c.src} progress={scrollYProgress} from={c.from} to={c.to} reduce={reduce} className={`home-pass-car${i > 0 ? ' home-pass-car--extra' : ''}`} style={{ top: c.top, width: c.w, zIndex: c.z }}>
          <AssetImage base={c.src} alt="" aria-hidden="true" />
        </Layer>
      ))}
      <motion.h2 className="home-display home-race-transition__title" style={reduce ? undefined : { y: titleY, opacity: titleO }}>
        Every race<br /><em>makes history.</em>
      </motion.h2>
      <div className="home-race-transition__line" aria-hidden="true" />
    </section>
  )
}