import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { getDriverImage } from '../../config/driverImages.js'
import AssetImage from '../home/AssetImage.jsx'
import { flagCode, formatDob, hasNumber, initials, splitName } from './driverUtils.js'

// Optional local flag: /images/flags/<iso>.svg (or .png). Hidden when missing.
function Flag({ code }) {
  const exts = ['svg', 'png', 'webp']
  const [i, setI] = useState(0)
  if (!code || i >= exts.length) return null
  return <img className="dd-flag" src={`/images/flags/${code}.${exts[i]}`} alt="" onError={() => setI(i + 1)} />
}

export default function DriverHero({ driver }) {
  const reduce = useReducedMotion()
  const { first, last } = splitName(driver)
  const img = getDriverImage(driver.driver_code)
  const number = hasNumber(driver.car_number) ? driver.car_number : null
  const dob = formatDob(driver.date_of_birth)
  const iso = flagCode(driver.nationality)
  const code = (driver.driver_code || '').toUpperCase()

  const rise = (delay = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: 'easeOut' },
  })

  return (
    <section className="dd-hero" aria-labelledby="dd-name">
      <div className="dd-hero__light" aria-hidden="true" />

      <motion.div className="dd-hero__photo" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        {img ? (
          <img src={img} alt={`Portrait of ${driver.full_name}`} decoding="async" />
        ) : (
          <span className="dd-hero__placeholder" aria-hidden="true">{code || initials(driver.full_name)}</span>
        )}
      </motion.div>

      {number !== null && <span className="dd-hero__bignum" aria-hidden="true">{number}</span>}
      {code && (
        <div className="dd-hero__signature">
          <AssetImage base={`/images/drivers/${code}-signature`} alt="" />
        </div>
      )}

      <div className="dd-wrap dd-hero__inner">
        <motion.nav className="dd-crumbs" aria-label="Breadcrumb" {...rise(0)}>
          <Link to="/">Home</Link><span aria-hidden="true">›</span>
          <Link to="/drivers">Drivers</Link><span aria-hidden="true">›</span>
          <span aria-current="page">{driver.full_name}</span>
        </motion.nav>

        {driver.nationality && (
          <motion.p className="dd-eyebrow" {...rise(0.05)}>
            <Flag code={iso} />
            {driver.nationality}
          </motion.p>
        )}

        <motion.h1 id="dd-name" className="dd-name" {...rise(0.1)}>
          {first && <span>{first}</span>}
          <em>{last}</em>
        </motion.h1>

        {driver.team_name && <motion.p className="dd-team" {...rise(0.2)}>{driver.team_name}</motion.p>}

        {(number !== null || dob || code) && (
          <motion.dl className="dd-meta" {...rise(0.3)}>
            {number !== null && <div className="dd-meta__num"><dt className="sr-only">Racing number</dt><dd>#{number}</dd></div>}
            {dob && <div><dt>Born</dt><dd>{dob}</dd></div>}
            {code && <div><dt>Code</dt><dd>{code}</dd></div>}
          </motion.dl>
        )}
      </div>
    </section>
  )
}
