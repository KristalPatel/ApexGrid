import { useState } from 'react'
import { AGGREGATES, OPERATORS, TABLES } from '../config/appConfig.js'
import { runAggregate, runFilter } from '../api.js'
import DataTable from '../components/DataTable.jsx'
import SelectBox from '../components/SelectBox.jsx'

const tableOptions = Object.entries(TABLES).map(([value, t]) => ({ value, label: t.label }))

// Q3: aggregate with dropdowns. Q4: condition with column / operator / value.
export default function Analytics() {
  const [aTable, setATable] = useState('race_result')
  const [aFn, setAFn] = useState('AVG')
  const [aCol, setACol] = useState('points')
  const [aResult, setAResult] = useState(null)
  const [aError, setAError] = useState('')

  const [fTable, setFTable] = useState('driver')
  const [fCol, setFCol] = useState('nationality')
  const [fOp, setFOp] = useState('=')
  const [fVal, setFVal] = useState('British')
  const [fRows, setFRows] = useState(null)
  const [fError, setFError] = useState('')

  // COUNT works on any column. SUM, AVG, MIN and MAX only make sense on number columns.
  const aggCols = (table, fn) => (fn === 'COUNT' ? TABLES[table].columns : TABLES[table].numeric)
  const numericCols = aggCols(aTable, aFn)
  const allCols = TABLES[fTable].columns

  const pickCol = (table, fn) => aggCols(table, fn)[0] || ''
  const changeAggTable = (v) => {
    const fn = TABLES[v].numeric.length ? aFn : 'COUNT'
    setATable(v); setAFn(fn); setACol(pickCol(v, fn)); setAResult(null); setAError('')
  }
  const changeAggFn = (fn) => {
    setAFn(fn)
    const cols = aggCols(aTable, fn)
    if (!cols.includes(aCol)) setACol(cols[0] || '')
    setAResult(null); setAError('')
  }
  const runAgg = async () => {
    try {
      setAError('')
      setAResult((await runAggregate(aTable, aFn, aCol)).result)
    } catch (e) {
      setAResult(null); setAError(e.message)
    }
  }
  const runCond = async () => {
    try {
      setFError('')
      setFRows(await runFilter(fTable, fCol, fOp, fVal))
    } catch (e) {
      setFRows(null); setFError(e.message)
    }
  }

  return (
    <div>
      <p className="eyebrow">Admin</p>
      <h1>Analytics</h1>

      <div className="section">
        <h2>Aggregate</h2>
        <div className="row">
          <SelectBox label="Table" value={aTable} onChange={changeAggTable} options={tableOptions} />
          <SelectBox label="Function" value={aFn} onChange={changeAggFn} options={TABLES[aTable].numeric.length ? AGGREGATES : ['COUNT']} />
          <SelectBox label="Column" value={aCol} onChange={setACol} options={numericCols} />
          <button className="btn small" onClick={runAgg} disabled={!aCol}>Run</button>
        </div>
        {aError && <p className="notice" style={{ color: '#ff6b6b' }}>{aError}</p>}
        {aResult !== null && (
          <div className="result-box"><span className="notice">{aFn}({aCol}) =</span> <span className="big-number">{aResult}</span></div>
        )}
      </div>

      <div className="section">
        <h2>Filter with a condition</h2>
        <div className="row">
          <SelectBox label="Table" value={fTable} onChange={(v) => { setFTable(v); setFCol(TABLES[v].columns[0]); setFRows(null); setFError('') }} options={tableOptions} />
          <SelectBox label="Column" value={fCol} onChange={setFCol} options={allCols} />
          <SelectBox label="Operator" value={fOp} onChange={setFOp} options={OPERATORS} />
          <div className="field">
            <label>Value</label>
            <input value={fVal} onChange={(e) => setFVal(e.target.value)} />
          </div>
          <button className="btn small" onClick={runCond}>Run</button>
        </div>
        {fError && <p className="notice" style={{ color: '#ff6b6b' }}>{fError}</p>}
        {fRows && <div className="result-box"><DataTable rows={fRows} /></div>}
      </div>
    </div>
  )
}
