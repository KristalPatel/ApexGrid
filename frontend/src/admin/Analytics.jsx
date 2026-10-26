import { useState } from 'react'
import { AGGREGATES, OPERATORS, TABLES } from '../config/appConfig.js'
import { runAggregate, runFilter } from '../api.js'
import DataTable from '../components/DataTable.jsx'
import SelectBox from '../components/SelectBox.jsx'

const tableOptions = Object.entries(TABLES).map(([value, t]) => ({ value, label: t.label }))

// Q3: aggregate with dropdowns. Q4: condition with column / operator / value.
export default function Analytics() {
  const [aTable, setATable] = useState('driver')
  const [aFn, setAFn] = useState('AVG')
  const [aCol, setACol] = useState('points')
  const [aResult, setAResult] = useState(null)

  const [fTable, setFTable] = useState('driver')
  const [fCol, setFCol] = useState('points')
  const [fOp, setFOp] = useState('>')
  const [fVal, setFVal] = useState('300')
  const [fRows, setFRows] = useState(null)

  const numericCols = TABLES[aTable].numeric
  const allCols = TABLES[fTable].columns

  return (
    <div>
      <p className="eyebrow">Admin</p>
      <h1>Analytics</h1>

      <div className="section">
        <h2>Aggregate</h2>
        <div className="row">
          <SelectBox label="Table" value={aTable} onChange={(v) => { setATable(v); setACol(TABLES[v].numeric[0]); setAResult(null) }} options={tableOptions} />
          <SelectBox label="Function" value={aFn} onChange={setAFn} options={AGGREGATES} />
          <SelectBox label="Column" value={aCol} onChange={setACol} options={numericCols} />
          <button className="btn small" onClick={async () => setAResult((await runAggregate(aTable, aFn, aCol)).result)}>Run</button>
        </div>
        {aResult !== null && (
          <div className="result-box"><span className="notice">{aFn}({aCol}) =</span> <span className="big-number">{aResult}</span></div>
        )}
      </div>

      <div className="section">
        <h2>Filter with a condition</h2>
        <div className="row">
          <SelectBox label="Table" value={fTable} onChange={(v) => { setFTable(v); setFCol(TABLES[v].columns[0]); setFRows(null) }} options={tableOptions} />
          <SelectBox label="Column" value={fCol} onChange={setFCol} options={allCols} />
          <SelectBox label="Operator" value={fOp} onChange={setFOp} options={OPERATORS} />
          <div className="field">
            <label>Value</label>
            <input value={fVal} onChange={(e) => setFVal(e.target.value)} />
          </div>
          <button className="btn small" onClick={async () => setFRows(await runFilter(fTable, fCol, fOp, fVal))}>Run</button>
        </div>
        {fRows && <div className="result-box"><DataTable rows={fRows} /></div>}
      </div>
    </div>
  )
}
