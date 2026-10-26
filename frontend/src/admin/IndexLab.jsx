import { useState } from 'react'

// Section B: record query timings before and after adding indexes.
// You type the numbers from MySQL Workbench. Later the backend can fill them automatically.
const START = [
  { q: 'Q1', before: '', after: '', index: '' },
  { q: 'Q3', before: '', after: '', index: '' },
  { q: 'Q4', before: '', after: '', index: '' },
  { q: 'Q5', before: '', after: '', index: '' },
]

export default function IndexLab() {
  const [rows, setRows] = useState(START)
  const set = (i, k, v) => setRows((r) => r.map((x, j) => (j === i ? { ...x, [k]: v } : x)))

  return (
    <div>
      <p className="eyebrow">Admin</p>
      <h1>Index Lab</h1>
      <p className="page-sub">Enter the time (in seconds) from MySQL Workbench before and after adding an index.</p>
      <div className="table-wrap" style={{ marginTop: 26 }}>
        <table>
          <thead><tr><th>Query</th><th>Index used</th><th>Before (s)</th><th>After (s)</th><th>Faster by</th></tr></thead>
          <tbody>
            {rows.map((r, i) => {
              const b = parseFloat(r.before), a = parseFloat(r.after)
              const gain = b > 0 && a >= 0 && !Number.isNaN(a) ? Math.round(((b - a) / b) * 100) + '%' : '-'
              return (
                <tr key={r.q}>
                  <td>{r.q}</td>
                  <td><input value={r.index} onChange={(e) => set(i, 'index', e.target.value)} placeholder="idx_driver_nationality" /></td>
                  <td><input value={r.before} onChange={(e) => set(i, 'before', e.target.value)} style={{ width: 90 }} /></td>
                  <td><input value={r.after} onChange={(e) => set(i, 'after', e.target.value)} style={{ width: 90 }} /></td>
                  <td>{gain}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
