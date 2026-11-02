import { useCallback, useEffect, useState } from 'react'
import { getTable, insertRow, deleteRow, updateRow, getAuditTail } from '../api.js'
import './lab.css'

// Section C: shows the two extra triggers working.
//   trg_race_result_check_ins  (BEFORE INSERT on race_result)  blocks bad results
//   trg_circuit_audit_upd      (AFTER UPDATE on circuit)       writes to the audit log
// The tests use Charles Leclerc / Ferrari in race 1. Any row a test manages to insert is removed again.

export default function Triggers() {
  const [ids, setIds] = useState(null)
  const [audit, setAudit] = useState([])
  const [results, setResults] = useState({})
  const [busy, setBusy] = useState('')
  const [length, setLength] = useState('4.95')
  const [loadError, setLoadError] = useState('')

  const loadAudit = useCallback(() => getAuditTail().then(setAudit), [])

  useEffect(() => {
    ;(async () => {
      try {
        const [races, drivers, teams, circuits] = await Promise.all([
          getTable('race'), getTable('driver'), getTable('team'), getTable('circuit'),
        ])
        const race = races.find((r) => Number(r.round_number) === 1)
        const driver = drivers.find((d) => d.driver_code === 'LEC')
        const team = teams.find((t) => t.team_name === 'Ferrari')
        const circuit = circuits.find((c) => c.circuit_name.startsWith('Marina Bay'))
        if (!race || !driver || !team || !circuit) throw new Error('Sample data not found (race 1, LEC, Ferrari, Marina Bay).')
        setIds({
          race: race.race_id, driver: driver.driver_id, team: team.team_id,
          circuit: circuit.circuit_id, circuitLength: circuit.length_km,
        })
        setLength(String(circuit.length_km) === '4.95' ? '4.94' : '4.95')
        await loadAudit()
      } catch (e) {
        setLoadError(e.message)
      }
    })()
  }, [loadAudit])

  const setResult = (key, value) => setResults((r) => ({ ...r, [key]: value }))

  // Try to insert a result. Expect "blocked" for bad rows and "allowed" for the good one.
  const tryInsert = async (key, fields, expectBlocked) => {
    setBusy(key)
    setResult(key, null)
    const row = { race_id: ids.race, driver_id: ids.driver, team_id: ids.team, points: 0, status: 'Finished', ...fields }
    try {
      await insertRow('race_result', row)
      // It went in: remove it again so the data stays clean.
      const all = await getTable('race_result')
      const mine = all.find((r) => r.race_id === ids.race && r.driver_id === ids.driver)
      if (mine) await deleteRow('race_result', mine.result_id)
      setResult(key, expectBlocked
        ? { ok: false, title: 'NOT blocked', message: 'The row was inserted, so the trigger is missing. The test row was removed again.' }
        : { ok: true, title: 'Allowed', message: 'A valid result passes the trigger. The test row was removed again.' })
    } catch (e) {
      setResult(key, expectBlocked
        ? { ok: true, title: 'Blocked by the trigger', message: e.message }
        : { ok: false, title: 'Unexpected error', message: e.message })
    } finally {
      setBusy('')
    }
  }

  const tryUpdate = async () => {
    setBusy('audit')
    setResult('audit', null)
    const before = audit.length ? audit[0].log_id : 0
    try {
      await updateRow('circuit', ids.circuit, { length_km: length })
      const log = await getAuditTail()
      setAudit(log)
      const added = log.filter((a) => a.log_id > before)
      setResult('audit', added.length
        ? { ok: true, title: 'Audit row written', message: added[0].details }
        : { ok: true, title: 'No audit row', message: 'The value did not change, so the trigger wrote nothing.' })
      setLength((l) => (l === '4.95' ? '4.94' : '4.95'))
    } catch (e) {
      setResult('audit', { ok: false, title: 'Error', message: e.message })
    } finally {
      setBusy('')
    }
  }

  const Note = ({ id }) => {
    const r = results[id]
    if (!r) return null
    return (
      <div className={`lab-note ${r.ok ? 'ok' : 'blocked'}`} role="status">
        <b>{r.title}.</b> {r.message}
      </div>
    )
  }

  return (
    <div className="lab">
      <h1>Triggers</h1>
      <p className="lede">
        A trigger is code the database runs by itself when a row is inserted, updated or deleted. Two triggers are shown here.
        The first one checks race results before they are saved. The second one writes to the audit log after a circuit is changed.
      </p>
      {loadError && <p className="lab-error">Could not load the test data: {loadError}</p>}

      <div className="lab-grid">
        <div>
          <section className="lab-panel">
            <h2>Trigger: trg_race_result_check_ins</h2>
            <p className="lab-muted">BEFORE INSERT on race_result. Tests use Leclerc (Ferrari) in the Australian Grand Prix.</p>

            <div className="lab-actions">
              <button className="lab-btn" disabled={!ids || busy} onClick={() => tryInsert('t1', { finishing_position: 1, points: 25 }, true)}>
                Add a second winner
              </button>
            </div>
            <Note id="t1" />

            <div className="lab-actions">
              <button className="lab-btn" disabled={!ids || busy} onClick={() => tryInsert('t2', { finishing_position: 99 }, true)}>
                Finishing position 99
              </button>
            </div>
            <Note id="t2" />

            <div className="lab-actions">
              <button className="lab-btn" disabled={!ids || busy} onClick={() => tryInsert('t3', { grid_position: 30, finishing_position: 2 }, true)}>
                Grid position 30
              </button>
            </div>
            <Note id="t3" />

            <div className="lab-actions">
              <button className="lab-btn primary" disabled={!ids || busy} onClick={() => tryInsert('t4', { grid_position: 2, finishing_position: 2, points: 18 }, false)}>
                Valid result (P2)
              </button>
            </div>
            <Note id="t4" />
          </section>

          <section className="lab-panel">
            <h2>Trigger: trg_circuit_audit_upd</h2>
            <p className="lab-muted">AFTER UPDATE on circuit. Changes the lap length of Marina Bay and reads the audit log.</p>
            <div className="lab-form">
              <label className="lab-field">New length (km)
                <input value={length} onChange={(e) => setLength(e.target.value)} />
              </label>
            </div>
            <div className="lab-actions">
              <button className="lab-btn primary" disabled={!ids || busy} onClick={tryUpdate}>Update circuit</button>
            </div>
            <Note id="audit" />
            <p className="lab-muted" style={{ marginTop: 10 }}>Click again with the same value to see that no audit row is written.</p>
          </section>
        </div>

        <section className="lab-panel flush">
          <div className="head"><h2>Latest audit log entries</h2></div>
          <div className="lab-scroll">
            <table>
              <thead><tr><th>Table</th><th>Action</th><th>Details</th></tr></thead>
              <tbody>
                {audit.length === 0 && <tr><td colSpan="3" className="lab-empty">Nothing logged yet.</td></tr>}
                {audit.map((a) => (
                  <tr key={a.log_id}>
                    <td>{a.table_name}</td>
                    <td>{a.operation_type}</td>
                    <td className="lab-muted">{a.details}<br />{a.changed_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
