import { useEffect, useState } from 'react'
import { AGGREGATES, OPERATORS, TABLES } from '../config/appConfig.js'
import { getXml, getXmlAggregate, getXmlFilter } from '../api.js'
import SelectBox from '../components/SelectBox.jsx'

const tableOptions = Object.entries(TABLES).map(([value, t]) => ({ value, label: t.label }))

// Shows XML text with a Download button, or the error from the database.
function XmlBox({ xml, error, name }) {
  if (error) return <p className="notice" style={{ color: '#ff6b6b' }}>{error}</p>
  if (!xml) return null
  const download = () => {
    const url = URL.createObjectURL(new Blob([xml], { type: 'application/xml' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `${name}.xml`
    a.click()
    URL.revokeObjectURL(url)
  }
  return (
    <div className="result-box">
      <button className="btn ghost small" style={{ marginBottom: 12 }} onClick={download}>Download .xml</button>
      <pre className="xml">{xml}</pre>
    </div>
  )
}

// Section F: Q1, Q3 and Q4 shown as XML.
export default function XmlExport() {
  // ----- Q1: whole table -----
  const [t1, setT1] = useState('driver')
  const [x1, setX1] = useState('')
  const [e1, setE1] = useState('')
  useEffect(() => {
    getXml(t1).then((x) => { setX1(x); setE1('') }).catch((e) => { setX1(''); setE1(e.message) })
  }, [t1])

  // ----- Q3: aggregate -----
  const [t3, setT3] = useState('race_result')
  const [fn3, setFn3] = useState('AVG')
  const [c3, setC3] = useState('points')
  const [x3, setX3] = useState('')
  const [e3, setE3] = useState('')
  // COUNT works on any column; SUM, AVG, MIN and MAX only on number columns.
  const cols3 = (table, fn) => (fn === 'COUNT' ? TABLES[table].columns : TABLES[table].numeric)
  const changeT3 = (v) => {
    const fn = TABLES[v].numeric.length ? fn3 : 'COUNT'
    setT3(v); setFn3(fn); setC3(cols3(v, fn)[0] || ''); setX3(''); setE3('')
  }
  const changeFn3 = (fn) => {
    setFn3(fn)
    const cols = cols3(t3, fn)
    if (!cols.includes(c3)) setC3(cols[0] || '')
    setX3(''); setE3('')
  }
  const run3 = () =>
    getXmlAggregate(t3, fn3, c3).then((x) => { setX3(x); setE3('') }).catch((e) => { setX3(''); setE3(e.message) })

  // ----- Q4: condition -----
  const [t4, setT4] = useState('driver')
  const [c4, setC4] = useState('nationality')
  const [op4, setOp4] = useState('=')
  const [v4, setV4] = useState('British')
  const [x4, setX4] = useState('')
  const [e4, setE4] = useState('')
  const run4 = () =>
    getXmlFilter(t4, c4, op4, v4).then((x) => { setX4(x); setE4('') }).catch((e) => { setX4(''); setE4(e.message) })

  return (
    <div>
      <p className="eyebrow">Admin</p>
      <h1>XML Export</h1>
      <p className="page-sub">The same queries as Q1, Q3 and Q4, returned by the database as XML.</p>

      <div className="section">
        <h2>Q1: all data of a table</h2>
        <div className="row">
          <SelectBox label="Table" value={t1} onChange={setT1} options={tableOptions} />
        </div>
        <XmlBox xml={x1} error={e1} name={t1} />
      </div>

      <div className="section">
        <h2>Q3: aggregate result</h2>
        <div className="row">
          <SelectBox label="Table" value={t3} onChange={changeT3} options={tableOptions} />
          <SelectBox label="Function" value={fn3} onChange={changeFn3} options={TABLES[t3].numeric.length ? AGGREGATES : ['COUNT']} />
          <SelectBox label="Column" value={c3} onChange={setC3} options={cols3(t3, fn3)} />
          <button className="btn small" onClick={run3} disabled={!c3}>Run</button>
        </div>
        <XmlBox xml={x3} error={e3} name={`${t3}_${fn3}`} />
      </div>

      <div className="section">
        <h2>Q4: rows that match a condition</h2>
        <div className="row">
          <SelectBox label="Table" value={t4} onChange={(v) => { setT4(v); setC4(TABLES[v].columns[0]); setX4(''); setE4('') }} options={tableOptions} />
          <SelectBox label="Column" value={c4} onChange={setC4} options={TABLES[t4].columns} />
          <SelectBox label="Operator" value={op4} onChange={setOp4} options={OPERATORS} />
          <div className="field">
            <label>Value</label>
            <input value={v4} onChange={(e) => setV4(e.target.value)} />
          </div>
          <button className="btn small" onClick={run4}>Run</button>
        </div>
        <XmlBox xml={x4} error={e4} name={`${t4}_filtered`} />
      </div>
    </div>
  )
}
