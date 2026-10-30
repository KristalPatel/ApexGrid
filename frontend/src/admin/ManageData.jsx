
import { useEffect, useState } from 'react'
import { TABLES } from '../config/appConfig.js'
import { getTable, insertRow, updateRow, deleteRow } from '../api.js'
import DataTable from '../components/DataTable.jsx'
import SelectBox from '../components/SelectBox.jsx'

// Tables that have a composite key (2+ columns), so Update/Delete by one id is unsafe.
// The audit log is also locked: a database trigger blocks edits and deletes on it.
const NO_EDIT = [
  'driver_standing',
  'constructor_standing',
  'team_sponsor',
  'sector_time',
  'application_audit_log',
]
// Rows here are created by the database or by the login system, not by hand.
const NO_INSERT = ['application_audit_log', 'user_login']

// Section D: Insert, Display, Update, Delete.
export default function ManageData() {
  const [mode, setMode] = useState('display')
  const [table, setTable] = useState('driver')
  const [rows, setRows] = useState([])
  const [form, setForm] = useState({})
  const [targetId, setTargetId] = useState('')
  const [msg, setMsg] = useState('')
  const [isError, setIsError] = useState(false)

  const cfg = TABLES[table]
  const idCol = cfg.columns[0]
  const refresh = () => getTable(table).then(setRows)

  useEffect(() => { refresh(); setForm({}); setMsg('') }, [table, mode])

  // Which tabs are allowed for the chosen table
  const modes = ['display', 'insert', 'update', 'delete'].filter((m) => {
    if (m === 'insert') return !NO_INSERT.includes(table)
    if (m === 'update' || m === 'delete') return !NO_EDIT.includes(table)
    return true
  })

  const changeTable = (t) => {
    setTable(t)
    // if the current tab is not allowed for the new table, go back to Display
    const stillOk =
      mode === 'display' ||
      (mode === 'insert' && !NO_INSERT.includes(t)) ||
      ((mode === 'update' || mode === 'delete') && !NO_EDIT.includes(t))
    if (!stillOk) setMode('display')
  }

  const tableOptions = Object.entries(TABLES).map(([value, t]) => ({ value, label: t.label }))
  const setField = (c, v) => setForm((f) => ({ ...f, [c]: v }))

  // Run an action and show the database's message if a trigger or rule blocks it
  const run = async (action, okMessage) => {
    try {
      await action()
      setIsError(false)
      setMsg(okMessage)
      return true
    } catch (err) {
      setIsError(true)
      setMsg(err?.message || 'The database rejected this change.')
      return false
    } finally {
      refresh()
    }
  }

  const doInsert = async (e) => {
    e.preventDefault()
    const ok = await run(() => insertRow(table, form), 'Row inserted.')
    if (ok) setForm({})
  }
  const doUpdate = async (e) => {
    e.preventDefault()
    await run(() => updateRow(table, targetId, form), 'Row updated.')
  }
  const doDelete = async (e) => {
    e.preventDefault()
    await run(() => deleteRow(table, targetId), 'Row deleted.')
  }

  const fields = cfg.columns.filter((c) => c !== idCol)
  // For composite-key tables the first column is NOT unique, so it must be typed in on Insert
  const insertFields = NO_EDIT.includes(table) ? cfg.columns : fields

  return (
    <div>
      <p className="eyebrow">Admin</p>
      <h1>Manage Data</h1>
      <div className="tabs">
        {modes.map((m) => (
          <button key={m} className={`tab ${mode === m ? 'on' : ''}`} onClick={() => setMode(m)}>
            {m[0].toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 260 }}>
        <SelectBox label="Table" value={table} onChange={changeTable} options={tableOptions} />
      </div>

      {mode === 'insert' && (
        <form onSubmit={doInsert} className="section">
          <div className="row">
            {insertFields.map((c) => (
              <div className="field" key={c}>
                <label>{c.replace(/_/g, ' ')}</label>
                <input value={form[c] || ''} onChange={(e) => setField(c, e.target.value)} />
              </div>
            ))}
          </div>
          <button className="btn small" style={{ marginTop: 16 }}>Insert</button>
        </form>
      )}

      {mode === 'update' && (
        <form onSubmit={doUpdate} className="section">
          <div className="row">
            <div className="field">
              <label>{idCol} to update</label>
              <input value={targetId} onChange={(e) => setTargetId(e.target.value)} required />
            </div>
            {fields.map((c) => (
              <div className="field" key={c}>
                <label>new {c.replace(/_/g, ' ')}</label>
                <input value={form[c] || ''} onChange={(e) => setField(c, e.target.value)} />
              </div>
            ))}
          </div>
          <p className="notice">Leave a box empty to keep the old value.</p>
          <button className="btn small" style={{ marginTop: 16 }}>Update</button>
        </form>
      )}

      {mode === 'delete' && (
        <form onSubmit={doDelete} className="section">
          <div className="row">
            <div className="field" style={{ maxWidth: 260 }}>
              <label>{idCol} to delete</label>
              <input value={targetId} onChange={(e) => setTargetId(e.target.value)} required />
            </div>
          </div>
          <button className="btn small" style={{ marginTop: 16 }}>Delete</button>
        </form>
      )}

      {msg && (
        <p className="notice" style={{ color: isError ? '#ff6b6b' : 'var(--text)' }}>{msg}</p>
      )}
      <div className="result-box">
        <DataTable rows={rows} columns={cfg.columns} />
      </div>
    </div>
  )
}