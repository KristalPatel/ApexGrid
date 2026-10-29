import { useEffect, useState } from 'react'
import { getRaces } from '../api.js'
import DataTable from '../components/DataTable.jsx'

export default function Races() {
  const [rows, setRows] = useState([])
  useEffect(() => { getRaces().then(setRows).catch(() => setRows([])) }, [])

  return (
    <div className="page container">
      <p className="eyebrow">Season 2025</p>
      <h1 className="page-title">Races</h1>
      <p className="page-sub" style={{ marginBottom: 30 }}>Every round and who won it.</p>
      <DataTable rows={rows} columns={['round', 'race_name', 'circuit_name', 'race_date', 'winner']} />
    </div>
  )
}
