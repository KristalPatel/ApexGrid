import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getTable } from '../api.js'
import DataTable from '../components/DataTable.jsx'

export function Circuits() {
  const [rows, setRows] = useState([])
  useEffect(() => { getTable('circuit').then(setRows) }, [])

  return (
    <div className="page container">
      <p className="eyebrow">Around the world</p>
      <h1 className="page-title">Circuits</h1>
      <div className="grid cols-3" style={{ marginTop: 36 }}>
        {rows.map((c, i) => (
          <motion.div key={c.circuit_id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Link to={`/circuits/${c.circuit_id}`} className="card" style={{ display: 'block' }}>
              <h3>{c.circuit_name}</h3>
              <p className="meta">{c.country}</p>
              <p className="meta" style={{ marginTop: 10 }}>{c.length_km} km · {c.laps} laps</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Circuit page: details plus the races held there and who won.
export function CircuitDetail() {
  const { id } = useParams()
  const [circuit, setCircuit] = useState(null)
  const [races, setRaces] = useState([])

  useEffect(() => {
    getTable('circuit').then((rows) => {
      const c = rows.find((r) => String(r.circuit_id) === id)
      setCircuit(c)
      getTable('race').then((rs) => setRaces(rs.filter((r) => c && r.circuit_name === c.circuit_name)))
    })
  }, [id])

  if (!circuit) return <div className="page container"><p className="notice">Loading...</p></div>

  return (
    <div className="page container">
      <Link to="/circuits" className="eyebrow">← All circuits</Link>
      <h1 className="page-title">{circuit.circuit_name}</h1>
      <p className="page-sub">{circuit.country}</p>
      <div className="stat-row">
        <div><span>Length</span><b>{circuit.length_km} km</b></div>
        <div><span>Laps</span><b>{circuit.laps}</b></div>
      </div>
      <h2 style={{ fontSize: 30, margin: '10px 0 14px' }}>Who won here</h2>
      <DataTable rows={races} columns={['round', 'race_name', 'race_date', 'winner']} />
    </div>
  )
}
