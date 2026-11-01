import { Fragment, useCallback, useEffect, useState } from 'react'
import { getIndexState, createIndex, dropIndex, benchQuery } from '../api.js'
import './lab.css'

const fmt = (n) => (n == null ? '–' : n < 1 ? n.toFixed(3) : n.toFixed(2))

// Positive = the query got faster after the index.
const gain = (before, after) => (before > 0 && after != null ? ((before - after) / before) * 100 : null)

function verdict(pct) {
  if (pct == null) return null
  if (pct >= 15) return { text: 'Faster', cls: 'fast' }
  if (pct <= -15) return { text: 'Slower', cls: 'slow' }
  return { text: 'No clear change', cls: '' }
}

const keysOf = (plan) => {
  const keys = (plan || []).map((p) => p.key).filter(Boolean)
  return keys.length ? keys.join(', ') : 'none (full scan)'
}

export default function IndexLab() {
  const [info, setInfo] = useState({ catalog: [], indexes: [], queries: [] })
  const [bucket, setBucket] = useState('before')
  const [results, setResults] = useState({ before: {}, after: {} })
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [open, setOpen] = useState('')
  const [copied, setCopied] = useState(false)

  const load = useCallback(async () => {
    try {
      setInfo(await getIndexState())
    } catch (e) {
      setError(e.message)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const toggle = async (idx) => {
    setBusy(`${idx.exists ? 'Dropping' : 'Creating'} ${idx.name}`)
    setError('')
    try {
      await (idx.exists ? dropIndex(idx.name) : createIndex(idx.name))
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy('')
    }
  }

  const setAll = async (create) => {
    setError('')
    try {
      for (const idx of info.catalog) {
        if (idx.exists === create) continue
        setBusy(`${create ? 'Creating' : 'Dropping'} ${idx.name}`)
        await (create ? createIndex(idx.name) : dropIndex(idx.name))
      }
      await load()
    } catch (e) {
      setError(e.message)
      await load()
    } finally {
      setBusy('')
    }
  }

  const runAll = async () => {
    setError('')
    const active = info.catalog.filter((i) => i.exists).length
    try {
      for (const q of info.queries) {
        setBusy(`Running ${q.id} (5 runs)`)
        const res = await benchQuery(q.id)
        setResults((prev) => ({ ...prev, [bucket]: { ...prev[bucket], [q.id]: { ...res, active } } }))
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy('')
    }
  }

  const copyResults = async () => {
    const lines = ['Query\tBefore (ms)\tAfter (ms)\tChange']
    info.queries.forEach((q) => {
      const b = results.before[q.id]?.server_ms
      const a = results.after[q.id]?.server_ms
      const g = gain(b, a)
      lines.push(`${q.id}\t${fmt(b)}\t${fmt(a)}\t${g == null ? '–' : g.toFixed(0) + '%'}`)
    })
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setError('Could not copy. Select the table and copy it by hand.')
    }
  }

  // SHOW INDEX returns one row per column, so group them back into one line per index.
  const grouped = Object.values(
    info.indexes.reduce((acc, r) => {
      const k = `${r.table}.${r.name}`
      acc[k] = acc[k] || { table: r.table, name: r.name, unique: r.unique, cols: [] }
      acc[k].cols[r.seq - 1] = r.column
      return acc
    }, {})
  )

  const onCount = info.catalog.filter((i) => i.exists).length

  return (
    <div className="lab">
      <h1>Index lab</h1>
      <p className="lede">
        An index lets MySQL jump to rows instead of reading the whole table. Time each query without the indexes, create them,
        time the same queries again, and compare. Times come from MySQL itself (EXPLAIN ANALYZE, median of 5 runs), so network
        delay to the cloud database is not counted.
      </p>

      {error && <p className="lab-error" role="alert">{error}</p>}

      <section className="lab-panel">
        <h2>How to take the before and after times</h2>
        <ol className="lab-steps">
          <li><b>Drop all</b> indexes below.</li>
          <li>Choose <b>Before</b> and press <b>Run all queries</b>.</li>
          <li><b>Create all</b> indexes.</li>
          <li>Choose <b>After</b> and press <b>Run all queries</b>.</li>
        </ol>
      </section>

      <section className="lab-panel">
        <div className="lab-actions" style={{ marginTop: 0, marginBottom: 14, alignItems: 'center' }}>
          <h2 style={{ margin: 0, marginRight: 'auto' }}>Indexes ({onCount} of {info.catalog.length} created)</h2>
          <button className="lab-btn" disabled={!!busy} onClick={() => setAll(true)}>Create all</button>
          <button className="lab-btn" disabled={!!busy} onClick={() => setAll(false)}>Drop all</button>
        </div>
        <div className="lab-index-list">
          {info.catalog.map((idx) => (
            <div className="lab-index" key={idx.name}>
              <div className="name">{idx.name}</div>
              <div className="meta">
                {idx.table} ({idx.cols})<br />
                Helps {idx.helps}
              </div>
              <div className="row">
                <span className={`lab-pill ${idx.exists ? 'on' : ''}`}>{idx.exists ? 'Created' : 'Not created'}</span>
                <button className="lab-btn small" disabled={!!busy} onClick={() => toggle(idx)}>
                  {idx.exists ? 'Drop' : 'Create'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="lab-panel flush">
        <div className="head">
          <div className="lab-actions" style={{ marginTop: 0, marginBottom: 14, alignItems: 'center' }}>
            <h2 style={{ margin: 0, marginRight: 'auto' }}>Query times</h2>
            <div className="lab-seg" role="group" aria-label="Save results as">
              <button className={bucket === 'before' ? 'active' : ''} onClick={() => setBucket('before')}>Before</button>
              <button className={bucket === 'after' ? 'active' : ''} onClick={() => setBucket('after')}>After</button>
            </div>
            <button className="lab-btn primary" disabled={!!busy || !info.queries.length} onClick={runAll}>
              {busy.startsWith('Running') ? busy : `Run all queries as ${bucket}`}
            </button>
            <button className="lab-btn" onClick={copyResults}>{copied ? 'Copied' : 'Copy table'}</button>
          </div>
          {busy && !busy.startsWith('Running') && <p className="lab-muted" role="status">{busy}...</p>}
        </div>

        <div className="lab-scroll">
          <table>
            <thead>
              <tr>
                <th>Query</th>
                <th className="num">Before (ms)</th>
                <th className="num">After (ms)</th>
                <th className="num">Change</th>
                <th>Result</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {info.queries.map((q) => {
                const b = results.before[q.id]
                const a = results.after[q.id]
                const pct = gain(b?.server_ms, a?.server_ms)
                const v = verdict(pct)
                return (
                  <Fragment key={q.id}>
                    <tr>
                      <td>
                        <b>{q.id}</b> {q.label}
                        <div className="lab-sql">{q.sql}</div>
                      </td>
                      <td className="num lab-timing">{fmt(b?.server_ms)}</td>
                      <td className="num lab-timing">{fmt(a?.server_ms)}</td>
                      <td className="num">{pct == null ? '–' : `${pct > 0 ? '-' : '+'}${Math.abs(pct).toFixed(0)}%`}</td>
                      <td>{v ? <span className={`lab-pill ${v.cls}`}>{v.text}</span> : <span className="lab-muted">Run both</span>}</td>
                      <td>
                        {(b || a) && (
                          <button className="lab-btn small" onClick={() => setOpen(open === q.id ? '' : q.id)}>
                            {open === q.id ? 'Hide plan' : 'Show plan'}
                          </button>
                        )}
                      </td>
                    </tr>
                    {open === q.id && (
                      <tr>
                        <td colSpan="6">
                          <p className="lab-muted" style={{ margin: '0 0 6px' }}>
                            Index used before: <b>{b ? keysOf(b.plan) : 'not run'}</b>
                            {b && <> ({b.active} created, {b.plan?.[0]?.rows ?? '?'} rows estimated)</>}
                          </p>
                          <p className="lab-muted" style={{ margin: 0 }}>
                            Index used after: <b>{a ? keysOf(a.plan) : 'not run'}</b>
                            {a && <> ({a.active} created, {a.plan?.[0]?.rows ?? '?'} rows estimated)</>}
                          </p>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="lab-muted" style={{ padding: '0 18px 16px', margin: 0, lineHeight: 1.5 }}>
          The tables hold only a few dozen rows, so the whole table already fits in memory and the gains are small. Changes
          under a few hundredths of a millisecond are noise. On millions of rows an index turns a full scan into a direct
          lookup, and the gap grows with the table. Note that "Show plan" tells you whether MySQL actually chose the index.
        </p>
      </section>

      <section className="lab-panel flush">
        <div className="head"><h2>Every index on these tables (SHOW INDEX)</h2></div>
        <div className="lab-scroll">
          <table>
            <thead><tr><th>Table</th><th>Index</th><th>Columns</th><th>Unique</th></tr></thead>
            <tbody>
              {grouped.map((g) => (
                <tr key={`${g.table}.${g.name}`}>
                  <td>{g.table}</td>
                  <td>{g.name}</td>
                  <td>{g.cols.join(', ')}</td>
                  <td>{g.unique ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}