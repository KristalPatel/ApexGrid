import { useState } from 'react'
import { JOIN_TYPES, SUBQUERY_OPTIONS } from '../config/appConfig.js'
import { runJoin, runSubquery } from '../api.js'
import DataTable from '../components/DataTable.jsx'
import SelectBox from '../components/SelectBox.jsx'

// Q5 join, Q6 subquery, Q7 correlated subquery.
export default function QueryBuilder() {
  const [joinType, setJoinType] = useState('INNER JOIN')
  const [joinRows, setJoinRows] = useState(null)
  const [sub, setSub] = useState(SUBQUERY_OPTIONS[0].id)
  const [subRows, setSubRows] = useState(null)

  return (
    <div>
      <p className="eyebrow">Admin</p>
      <h1>Query Builder</h1>

      <div className="section">
        <h2>Join: drivers with their teams</h2>
        <div className="row">
          <SelectBox label="Join type" value={joinType} onChange={setJoinType} options={JOIN_TYPES} />
          <button className="btn small" onClick={async () => setJoinRows(await runJoin(joinType))}>Run</button>
        </div>
        {joinRows && <div className="result-box"><DataTable rows={joinRows} /></div>}
      </div>

      <div className="section">
        <h2>Subqueries</h2>
        <div className="row">
          <SelectBox label="Query" value={sub} onChange={setSub} options={SUBQUERY_OPTIONS.map((o) => ({ value: o.id, label: o.label }))} />
          <button className="btn small" onClick={async () => setSubRows(await runSubquery(sub))}>Run</button>
        </div>
        {subRows && <div className="result-box"><DataTable rows={subRows} /></div>}
      </div>
    </div>
  )
}
