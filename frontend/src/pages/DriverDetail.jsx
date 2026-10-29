import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getDriverProfile, getDrivers } from '../api.js'
import DriverHero from '../components/driver/DriverHero.jsx'
import StatsStrip from '../components/driver/StatsStrip.jsx'
import MoreDrivers from '../components/driver/MoreDrivers.jsx'
import '../driver.css'

// Route: /drivers/:id  (id is the driver_id, never the racing number)
export default function DriverDetail() {
  const { id } = useParams()
  const [profile, setProfile] = useState({ status: 'loading', data: null }) // loading | ok | missing | error
  const [list, setList] = useState({ status: 'loading', rows: [] })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let alive = true
    setProfile({ status: 'loading', data: null })
    getDriverProfile(id)
      .then((p) => alive && setProfile(p ? { status: 'ok', data: p } : { status: 'missing', data: null }))
      .catch(() => alive && setProfile({ status: 'error', data: null }))
    return () => { alive = false }
  }, [id, attempt])

  // The driver list does not depend on the selected driver, so switching drivers does not refetch it.
  useEffect(() => {
    let alive = true
    setList({ status: 'loading', rows: [] })
    getDrivers()
      .then((rows) => alive && setList({ status: 'ok', rows: Array.isArray(rows) ? rows : [] }))
      .catch(() => alive && setList({ status: 'error', rows: [] }))
    return () => { alive = false }
  }, [attempt])

  return (
    <main className="dd">
      {profile.status === 'loading' && (
        <div className="dd-state" role="status" aria-live="polite">
          <div className="dd-skeleton" aria-hidden="true" />
          <p className="dd-note">Loading driver…</p>
        </div>
      )}

      {profile.status === 'missing' && (
        <div className="dd-state dd-state--msg">
          <p className="dd-eyebrow">Driver not found</p>
          <h1 className="dd-name"><em>No such driver</em></h1>
          <p className="dd-note">There is no driver with this ID in the database.</p>
          <Link to="/drivers" className="btn">Back to drivers</Link>
        </div>
      )}

      {profile.status === 'error' && (
        <div className="dd-state dd-state--msg">
          <p className="dd-eyebrow">Something went wrong</p>
          <h1 className="dd-name"><em>Couldn’t load this driver</em></h1>
          <p className="dd-note">The request to the server failed. Check that the API is running and try again.</p>
          <div className="dd-actions">
            <button type="button" className="btn" onClick={() => setAttempt((n) => n + 1)}>Try again</button>
            <Link to="/drivers" className="btn ghost">Back to drivers</Link>
          </div>
        </div>
      )}

      {profile.status === 'ok' && (
        <>
          <DriverHero driver={profile.data.driver} />
          <StatsStrip stats={profile.data.stats} />
          {profile.data.mock && <p className="dd-wrap dd-note">Showing sample data. The database is not connected yet.</p>}
          <MoreDrivers drivers={list.rows} status={list.status} currentId={id} />
        </>
      )}
    </main>
  )
}
