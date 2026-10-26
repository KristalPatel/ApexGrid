import { useEffect, useState } from 'react'
import { TABLES } from '../config/appConfig.js'
import { getTable, insertRow, updateRow, deleteRow } from '../api.js'
import DataTable from '../components/DataTable.jsx'
import SelectBox from '../components/SelectBox.jsx'

// Section D: Insert, Display, Update, Delete.
export default function ManageData() {
  const [mode, setMode] = useState('display')
  const [table, setTable] = useState('driver')
  const [rows, setRows] = useState([])
  const [form, setForm] = useState({})
  const [targetId, setTargetId] = useState('')
  const [msg, setMsg] = useState('')

  const cfg = TABLES[table]
  const idCol = cfg.columns[0]
  const refresh = () => getTable(table).then(setRows)

  useEffect(() => { refresh(); setForm({}); setMsg('') }, [table, mode])

  const tableOptions = Object.entries(TABLES).map(([value, t]) => ({ value, label: t.label }))
  const setField = (c, v) => setForm((f) => ({ ...f, [c]: v }))

  const doInsert = async (e) => {
    e.preventDefault()
    await insertRow(table, form)
    setMsg('Row inserted.')
    setForm({})
    refresh()
  }
  const doUpdate = async (e) => {
    e.preventDefault()
    await updateRow(table, targetId, form)
    setMsg('Row updated.')
    refresh()
  }
  const doDelete = async (e) => {
    e.preventDefault()
    await deleteRow(table, targetId)
    setMsg('Row deleted.')
    refresh()
  }

  const fields = cfg.columns.filter((c) => c !== idCol)

  return (
    <div>
      <p className="eyebrow">Admin</p>
      <h1>Manage Data</h1>
      <div className="tabs">
        {['display', 'insert', 'update', 'delete'].map((m) => (
          <button key={m} className={`tab ${mode === m ? 'on' : ''}`} onClick={() => setMode(m)}>
            {m[0].toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 260 }}>
        <SelectBox label="Table" value={table} onChange={setTable} options={tableOptions} />
      </div>

      {mode === 'insert' && (
        <form onSubmit={doInsert} className="section">
          <div className="row">
            {fields.map((c) => (
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

      {msg && <p className="notice" style={{ color: 'var(--text)' }}>{msg}</p>}
      <div className="result-box">
        <DataTable rows={rows} columns={cfg.columns} />
      </div>
    </div>
  )
}
