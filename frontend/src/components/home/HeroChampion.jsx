import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { getDriverImage } from '../../config/driverImages.js'
import AssetImage from './AssetImage.jsx'

// Default view: the HELMETED portrait (/images/drivers/<CODE>-helmet.webp|png|jpg|jpeg).
// Hovering reveals the face (the driver photo) inside a cursor spotlight.
// The "Remove helmet" button shows the face everywhere, with no hover needed.
// Both images must have the same framing/size so they line up.
// If no helmet image exists, the portrait is shown dimmed and the spotlight reveals it in full colour.
const FULL = 2000 // spotlight radius big enough to cover the whole portrait

export default function HeroChampion({ champion, driverId }) {
  const reduce = useReducedMotion()
  const stage = useRef(null)
  const timer = useRef(null)
  const [helmet, setHelmet] = useState('pending') // pending | loaded | missing
  const [active, setActive] = useState(false)
  const [full, setFull] = useState(false)          // helmet removed, face fully shown

  const code = champion?.driver_code
  const name = champion?.full_name || 'Lando Norris'
  const face = getDriverImage(code || 'NOR')
  const helmetBase = `/images/drivers/${(code || 'NOR').toUpperCase()}-helmet`
  const hasHelmet = helmet === 'loaded'
  const noHelmet = helmet === 'missing'
  const [first, ...rest] = name.split(' ')
  const last = rest.join(' ')
  const driverTo = driverId != null ? `/drivers/${driverId}` : '/drivers'

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rad = useMotionValue(0)
  const sr = useSpring(rad, { stiffness: 160, damping: 26 })
  const r = reduce ? rad : sr
  const mask = useMotionTemplate`radial-gradient(circle ${r}px at ${mx}px ${my}px, #000 60%, transparent 100%)`

  useEffect(() => () => clearTimeout(timer.current), [])

  const size = () => (window.innerWidth < 800 ? 120 : 190)
  const place = (e) => {
    const b = stage.current?.getBoundingClientRect()
    if (!b) return
    mx.set(e.clientX - b.left)
    my.set(e.clientY - b.top)
  }
  const open = () => { clearTimeout(timer.current); if (!full) rad.set(size()); setActive(true) }
  const close = () => { if (!full) rad.set(0); setActive(false) }

  const onEnter = (e) => { if (e.pointerType === 'mouse') { place(e); open() } }
  const onMove = (e) => { if (e.pointerType === 'mouse' || active) place(e) }
  const onLeave = (e) => { if (e.pointerType === 'mouse') close() }
  const onDown = (e) => { if (e.pointerType !== 'mouse') { place(e); open() } }
  const onUp = (e) => { if (e.pointerType !== 'mouse') timer.current = setTimeout(close, 1400) }
  const onFocus = () => {
    const b = stage.current?.getBoundingClientRect()
    if (!b) return
    mx.set(b.width / 2); my.set(b.height * 0.35)
    if (!full) rad.set(size() + 40)
    setActive(true)
  }

  const toggleHelmet = () => {
    const b = stage.current?.getBoundingClientRect()
    if (!full) {
      // grow the face reveal from the centre of the portrait
      if (b && !active) { mx.set(b.width / 2); my.set(b.height * 0.4) }
      rad.set(FULL); setFull(true)
    } else {
      rad.set(0); setFull(false)
    }
  }

  const fade = (delay) => ({ initial: reduce ? false : { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay } })
  const label = full ? 'Without the helmet' : hasHelmet ? 'Behind the visor' : 'Look closer'

  return (
    <section className="home-champion">
      <div className="home-champion__light home-champion__light--red" />
      <div className="home-champion__light home-champion__light--papaya" />

      <div className="home-champion__grid">
        {/* Left */}
        <div className="home-champion__side home-champion__side--left">
          <motion.p className="home-kicker" {...fade(0.2)}>The man behind the helmet.</motion.p>
          <motion.h1 className="home-champion__title" {...fade(0.1)}>
            <span>{first}</span>
            {last && <em>{last}</em>}
          </motion.h1>
          <motion.p className="home-lead" {...fade(0.5)}>Precision. Instinct. The pursuit of every tenth.</motion.p>
        </div>

        {/* Centre: the main attraction */}
        <motion.div
          ref={stage}
          className={`home-champion__stage${active ? ' is-active' : ''}${full ? ' is-full' : ''}`}
          tabIndex={0}
          role="img"
          aria-label={`${name} portrait. Move the cursor over it to reveal the face behind the helmet.`}
          onPointerEnter={onEnter}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          onPointerDown={onDown}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onFocus={onFocus}
          onBlur={close}
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <div className="home-champion__frame">
            {/* base layer: the helmet (or a dimmed portrait if there is no helmet image) */}
            <AssetImage base={helmetBase} alt="" className="home-champion__img" onState={setHelmet} eager />
            {noHelmet && (face
              ? <img src={face} alt="" className="home-champion__img is-dim" decoding="async" />
              : <span className="home-champion__code">{code || 'NOR'}</span>)}

            {/* reveal layer: the face, shown inside the spotlight */}
            <motion.div className="home-champion__reveal" style={{ WebkitMaskImage: mask, maskImage: mask }} aria-hidden="true">
              {face && <img src={face} alt="" className="home-champion__img" decoding="async" />}
            </motion.div>
          </div>
          <span className={`home-champion__label${active || full ? ' on' : ''}`}>{label}</span>
        </motion.div>

        {/* Right */}
        <div className="home-champion__side home-champion__side--right">
          {champion && (
            <motion.p className="home-champion__meta" {...fade(0.6)}>
              {[champion.team_name, champion.nationality].filter(Boolean).join(' · ')}
            </motion.p>
          )}
          <motion.div className="home-actions" {...fade(0.8)}>
            <Link to={driverTo} className="btn">View driver</Link>
            <Link to="/drivers" className="btn ghost">View all drivers</Link>
          </motion.div>
          {hasHelmet && (
            <motion.button type="button" className="home-champion__toggle" aria-pressed={full} onClick={toggleHelmet} {...fade(0.95)}>
              <span className="home-champion__toggle-dot" />
              {full ? 'Put helmet on' : 'Remove helmet'}
            </motion.button>
          )}
          <motion.p className="home-champion__hint" {...fade(1.1)}>
            {full ? 'Showing the face. No hover needed.' : 'Move your cursor over the portrait.'}
          </motion.p>
        </div>
      </div>

      <div className="home-scroll" aria-hidden="true">
        <span>Scroll</span>
        <motion.i animate={reduce ? undefined : { y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.8 }} />
      </div>
    </section>
  )
}