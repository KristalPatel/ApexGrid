import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import CarSvg from '../CarSvg.jsx'

const VIDEO_SRC = '/videos/race-start.mp4'
const VIDEO_START_TIMEOUT = 2500   // ms to wait for playback to start before using the fallback
const VIDEO_MAX = 15000            // safety net if the video stalls mid-way
const LIGHT_GAP = 650              // fallback: ms between each red light
const LIGHTS_OUT_AT = 800 + 5 * LIGHT_GAP + 900
const END_AT = LIGHTS_OUT_AT + 1500

// Starting-light intro. Uses /videos/race-start.mp4 when it plays;
// otherwise runs a CSS/SVG starting-light sequence. Always ends in onDone().
export default function RaceStartIntro({ onDone }) {
  const [mode, setMode] = useState('video')     // 'video' | 'fallback'
  const [lit, setLit] = useState(0)
  const [out, setOut] = useState(false)
  const doneRef = useRef(false)
  const videoRef = useRef(null)

  const finish = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    onDone()
  }, [onDone])

  const toFallback = useCallback(() => setMode((m) => (m === 'video' ? 'fallback' : m)), [])

  // Video: start timeout + max-length safety net
  useEffect(() => {
    if (mode !== 'video') return undefined
    const start = setTimeout(() => {
      const v = videoRef.current
      if (!v || v.paused || v.readyState < 2) toFallback()
    }, VIDEO_START_TIMEOUT)
    const max = setTimeout(finish, VIDEO_MAX)
    return () => { clearTimeout(start); clearTimeout(max) }
  }, [mode, toFallback, finish])

  // Fallback: lights sequence, lights out, launch, done
  useEffect(() => {
    if (mode !== 'fallback') return undefined
    const timers = []
    for (let i = 1; i <= 5; i += 1) timers.push(setTimeout(() => setLit(i), 800 + i * LIGHT_GAP))
    timers.push(setTimeout(() => { setLit(0); setOut(true) }, LIGHTS_OUT_AT))
    timers.push(setTimeout(finish, END_AT))
    return () => timers.forEach(clearTimeout)
  }, [mode, finish])

  // Esc skips too
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') finish() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [finish])

  return (
    <motion.div
      className="race-start-overlay"
      role="dialog"
      aria-label="ApexGrid introduction"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: 'easeInOut' }}
    >
      {mode === 'video' ? (
        <video
          ref={videoRef}
          className="race-start-video"
          src={VIDEO_SRC}
          muted
          playsInline
          autoPlay
          preload="auto"
          onEnded={finish}
          onError={toFallback}
          onStalled={() => { if (videoRef.current?.readyState < 2) toFallback() }}
        />
      ) : (
        <div className="race-start-fallback">
          <motion.div className="logo race-start-logo" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            APEX<span>GRID</span>
          </motion.div>
          <motion.div className="race-start-gantry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="race-start-column">
                <span className={`race-start-light${lit >= n ? ' on' : ''}`} />
                <span className={`race-start-light${lit >= n ? ' on' : ''}`} />
              </div>
            ))}
          </motion.div>
          <p className="race-start-caption" aria-live="polite">{out ? 'LIGHTS OUT' : lit ? 'GET READY' : ''}</p>
          {out && (
            <motion.div
              className="race-start-car"
              initial={{ x: '-40vw', opacity: 1 }}
              animate={{ x: '130vw' }}
              transition={{ duration: 1.2, ease: [0.6, 0.05, 0.3, 1] }}
            >
              <CarSvg />
            </motion.div>
          )}
          {out && <motion.div className="race-start-flash" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.5, 0] }} transition={{ duration: 1.2 }} />}
        </div>
      )}
      <button type="button" className="btn ghost small race-start-skip" onClick={finish}>Skip intro</button>
    </motion.div>
  )
}
