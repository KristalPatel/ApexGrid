import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getViewData,
  getViewLookups,
  addDriverViaProcedure,
  removeTestDriver,
  getAuditTail,
} from '../api.js'
import './lab.css'

const VIEW_NAME = 'v_british_drivers'

const VIEW_SQL = `CREATE OR REPLACE VIEW v_british_drivers AS
SELECT d.driver_id,
       CONCAT(d.first_name, ' ', d.last_name) AS driver_name,
       d.driver_code, d.nationality, t.team_name, c.car_number
FROM driver d
JOIN driver_contract c ON c.driver_id = d.driver_id
JOIN team t            ON t.team_id   = c.team_id
WHERE d.nationality = 'British';`

const blank = { first: '', last: '', dob: '2000-01-01', nationality: 'British', code: '', team: '', season: '', number: '' }

export default function Views() {
  const [rows, setRows] = useState([])
  const [audit, setAudit] = useState([])
  const [lookups, setLookups] = useState({ teams: [], seasons: [] })
  const [form, setForm] = useState(blank)
  const [outcome, setOutcome] = useState(null)
  const [busy, setBusy] = useState(false)
  const [loadError, setLoadError] = useState('')
  const baseIds = useRef(null) // drivers that existed when the page opened

  const refresh = useCallback(async () => {
    const [view, log] = await Promise.all([getViewData(VIEW_NAME), getAuditTail()])
    if (baseIds.current === null) baseIds.current = new Set(view.map((r) => r.driver_id))
    setRows(view)
    setAudit(log)
    return view
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const l = await getViewLookups()
        setLookups(l)
        setForm((f) => ({
          ...f,
          team: l.teams[0] ? String(l.teams[0].team_id) : '',
          season: l.seasons[0] ? String(l.seasons[0].season_id) : '',
        }))
        await refresh()
      } catch (e) {
        setLoadError(e.message)
      }
    })()
  }, [refresh])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  // kind = 'valid' uses the form as typed. kind = 'future' forces a birth date in 2099
  // so the trigger trg_driver_check_ins has to block it.
  const submit = async (kind) => {
    setBusy(true)
    setOutcome(null)
    const before = rows.length
    const payload =
      kind === 'future'
        ? { ...form, first: form.first || 'Bad', last: form.last || 'Date', code: form.code || 'BAD', number: form.number || '98', dob: '2099-01-01' }
        : form
    try {
      await addDriverViaProcedure(payload)
      const view = await refresh()
      const typed = payload.code
      const changed = typed && typed !== typed.toUpperCase()
      const shows = String(payload.nationality).toLowerCase() === 'british'
      setOutcome({
        ok: true,
        title: 'Saved by the procedure',
        message:
          (changed ? `The trigger changed the code "${typed}" to "${typed.toUpperCase()}". ` : '') +
          (shows ? 'The new driver is in the view below.' : `Nationality is ${payload.nationality}, so the view filters this driver out.`),
        before,
        after: view.length,
      })
      setForm((f) => ({ ...f, first: '', last: '', code: '', number: '' }))
    } catch (e) {
      let after = before
      try { after = (await refresh()).length } catch { /* keep the old count */ }
      setOutcome({ ok: false, title: 'Blocked by the database', message: e.message, before, after })
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id) => {
    try {
      await removeTestDriver(id)
      await refresh()
      setOutcome(null)
    } catch (e) {
      setOutcome({ ok: false, title: 'Could not remove', message: e.message })
    }
  }

  const ready = form.first && form.last && form.code.length === 3 && form.team && form.season && form.number

  return (
    <div className="lab">
      <h1>Views</h1>
      <p className="lede">
        A view is a saved query that behaves like a table. <code>{VIEW_NAME}</code> joins drivers, their contracts and their teams,
        and keeps only British drivers. Add a driver through the stored procedure to see the view change, or try an invalid
        birth date to see the trigger stop it.
      </p>

      {loadError && <p className="lab-error">Could not load the view: {loadError}</p>}

      <div className="lab-grid">
        <div>
          <section className="lab-panel flush">
            <div className="head"><h2>Rows in the view ({rows.length})</h2></div>
            <div className="lab-scroll">
              <table>
                <thead>
                  <tr><th>Driver</th><th>Code</th><th>Nationality</th><th>Team</th><th className="num">Car</th><th /></tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr><td colSpan="6" className="lab-empty">No British drivers yet. Add one with the form.</td></tr>
                  )}
                  {rows.map((r, i) => (
                    <tr key={`${r.driver_id}-${i}`}>
                      <td>{r.driver_name}</td>
                      <td>{r.driver_code}</td>
                      <td>{r.nationality}</td>
                      <td>{r.team_name}</td>
                      <td className="num">{r.car_number ?? '–'}</td>
                      <td className="num">
                        {baseIds.current && !baseIds.current.has(r.driver_id) && (
                          <button className="lab-btn small" onClick={() => remove(r.driver_id)}>Remove</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="lab-panel">
            <h2>The view definition</h2>
            <pre>{VIEW_SQL}</pre>
          </section>
        </div>

        <div>
          <section className="lab-panel">
            <h2>Add a driver (sp_add_driver_and_show)</h2>
            <div className="lab-form">
              <label className="lab-field">First name
                <input value={form.first} onChange={set('first')} />
              </label>
              <label className="lab-field">Last name
                <input value={form.last} onChange={set('last')} />
              </label>
              <label className="lab-field">Date of birth
                <input type="date" value={form.dob} onChange={set('dob')} />
              </label>
              <label className="lab-field">Nationality
                <input value={form.nationality} onChange={set('nationality')} />
              </label>
              <label className="lab-field">Driver code (3 letters)
                <input value={form.code} maxLength={3} onChange={set('code')} placeholder="try lowercase: tst" />
              </label>
              <label className="lab-field">Car number
                <input type="number" min="1" value={form.number} onChange={set('number')} />
              </label>
              <label className="lab-field">Team
                <select value={form.team} onChange={set('team')}>
                  {lookups.teams.map((t) => <option key={t.team_id} value={t.team_id}>{t.team_name}</option>)}
                </select>
              </label>
              <label className="lab-field">Season
                <select value={form.season} onChange={set('season')}>
                  {lookups.seasons.map((s) => <option key={s.season_id} value={s.season_id}>{s.year}</option>)}
                </select>
              </label>
            </div>

            <div className="lab-actions">
              <button className="lab-btn primary" disabled={busy || !ready} onClick={() => submit('valid')}>Add driver</button>
              <button className="lab-btn" disabled={busy} onClick={() => submit('future')}>Test trigger: birth date in 2099</button>
            </div>

            {outcome && (
              <div className={`lab-note ${outcome.ok ? 'ok' : 'blocked'}`} role="status">
                <b>{outcome.title}.</b> {outcome.message}
                {outcome.before != null && (
                  <div className="counts">Rows in the view: {outcome.before} before, {outcome.after} after.</div>
                )}
              </div>
            )}
          </section>

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
    </div>
  )
}