import { useEffect, useState } from 'react'
import { getDrivers } from '../api.js'
import DataTable from '../components/DataTable.jsx'

// Section C: shows the result of your SQL view. For now it reads the driver table.
// Later point this at /api/view/<name> once the view exists in MySQL.
export default function Views() {
  const [rows, setRows] = useState([])
  useEffect(() => { getDrivers().then(setRows) }, [])

  return (
    <div>
      <p className="eyebrow">Admin</p>
      <h1>Views</h1>
      <p className="page-sub">Placeholder. This page will show the SQL view you create in Section C (for example, driver standings).</p>
      <div className="result-box">
        <DataTable rows={rows} columns={['full_name', 'team_name', 'wins', 'points']} />
      </div>
    </div>
  )
}
