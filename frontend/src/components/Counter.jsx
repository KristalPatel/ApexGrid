import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

// Counts up from 0 when it scrolls into view.
export default function Counter({ to, duration = 1600 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!inView) return
    let start
    let frame
    const step = (t) => {
      if (!start) start = t
      const p = Math.min((t - start) / duration, 1)
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))))
      if (p < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [inView, to, duration])

  return <span ref={ref}>{n.toLocaleString()}</span>
}
