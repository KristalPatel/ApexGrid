import { motion } from 'framer-motion'
import CarSvg from './CarSvg.jsx'

// A dark curtain and a car sweep across the screen (left to right) about 1.2 seconds.
// App.jsx switches the page while the screen is covered.
export default function CarTransition() {
  return (
    <div className="transition">
      <motion.div
        className="curtain"
        initial={{ x: '-100%' }}
        animate={{ x: ['-100%', '0%', '0%', '100%'] }}
        transition={{ duration: 1.3, times: [0, 0.4, 0.6, 1], ease: 'easeInOut' }}
      />
      <motion.div
        className="car"
        initial={{ x: '-30vw' }}
        animate={{ x: '120vw' }}
        transition={{ duration: 1.1, ease: [0.6, 0.05, 0.3, 1] }}
      >
        <CarSvg />
      </motion.div>
    </div>
  )
}
