import { useEffect, useState } from 'react'
import { JOIN_TYPES, POSITION_OPTIONS, TABLES } from '../config/appConfig.js'
import { getJoinLinks, getTable, runJoin, runTeamAverage, runTeamFinishers } from '../api.js'
import DataTable from '../components/DataTable.jsx'
import SelectBox from '../components/SelectBox.jsx'

const tableOptions = Object.entries(TABLES).map(([value, t]) => ({ value, label: t.label }))

// Small helper: run a request and keep either the rows or the error message.
function useRunner() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')
  const run = async (fn) => {
    try {
      setError('')
      setRows(await fn())
    } catch (e) {
      setRows(null)
      setError(e.message)
    }
  }
  return { rows, error, run }
}

function Result({ r }) {
  if (r.error) return <p className="notice" style={{ color: '#ff6b6b' }}>{r.error}</p>
  return r.rows ? <div className="result-box"><DataTable rows={r.rows} /></div> : null
}

// Q5 join, Q6 subquery, Q7 correlated subquery.
export default function QueryBuilder() {
  // ----- Q5 -----
  const [links, setLinks] = useState({})
  const [left, setLeft] = useState('driver')
  const [right, setRight] = useState('driver_contract')
  const [joinType, setJoinType] = useState('INNER JOIN')
  const join = useRunner()

  // ----- Q6 / Q7 -----
  const [teams, setTeams] = useState([])
  const [seasons, setSeasons] = useState([])
  const [team, setTeam] = useState('')
  const [maxPos, setMaxPos] = useState('1')
  const [year, setYear] = useState('')
  const [cmp, setCmp] = useState('above')
  const sub = useRunner()
  const corr = useRunner()

  useEffect(() => {
    getJoinLinks().then(setLinks)
    getTable('team').then((t) => { setTeams(t); if (t[0]) setTeam(t[0].team_name) })
    getTable('season').then((s) => { setSeasons(s); if (s[0]) setYear(String(s[s.length - 1].year)) })
  }, [])

  // The second dropdown only lists tables that really share a foreign key with the first.
  const rightChoices = tableOptions.filter((o) => (links[left] || []).includes(o.value))
  const changeLeft = (v) => {
    setLeft(v)
    const next = (links[v] || [])[0]
    if (next) setRight(next)
    join.run(async () => null)
  }

  return (
    <div>
      <p className="eyebrow">Admin</p>
      <h1>Query Builder</h1>

      <div className="section">
        <h2>Join (Q5)</h2>
        <div className="row">
          <SelectBox label="First table" value={left} onChange={changeLeft} options={tableOptions} />
          <SelectBox label="Second table" value={right} onChange={setRight} options={rightChoices.length ? rightChoices : tableOptions} />
          <SelectBox label="Join type" value={joinType} onChange={setJoinType} options={JOIN_TYPES} />
          <button className="btn small" onClick={() => join.run(() => runJoin(left, right, joinType))}>Run</button>
        </div>
        <Result r={join} />
      </div>

      <div className="section">
        <h2>Subquery (Q6): drivers who finished well for a team</h2>
        <div className="row">
          <SelectBox label="Team" value={team} onChange={setTeam} options={teams.map((t) => t.team_name)} />
          <SelectBox label="Result" value={maxPos} onChange={setMaxPos} options={POSITION_OPTIONS} />
          <button className="btn small" onClick={() => sub.run(() => runTeamFinishers(team, maxPos))}>Run</button>
        </div>
        <Result r={sub} />
      </div>

      <div className="section">
        <h2>Correlated subquery (Q7): drivers against their team average</h2>
        <div className="row">
          <SelectBox label="Season" value={year} onChange={setYear} options={seasons.map((s) => String(s.year))} />
          <SelectBox
            label="Drivers who scored"
            value={cmp}
            onChange={setCmp}
            options={[{ value: 'above', label: 'above team average' }, { value: 'below', label: 'below team average' }]}
          />
          <button className="btn small" onClick={() => corr.run(() => runTeamAverage(year, cmp))}>Run</button>
        </div>
        <Result r={corr} />
      </div>
    </div>
  )
}
