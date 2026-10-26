import { useEffect, useState } from 'react'
import { TABLES } from '../config/appConfig.js'
import { getXml } from '../api.js'
import SelectBox from '../components/SelectBox.jsx'

// Section F: show query results as XML.
export default function XmlExport() {
  const [table, setTable] = useState('driver')
  const [xml, setXml] = useState('')
  useEffect(() => { getXml(table).then(setXml) }, [table])

  return (
    <div>
      <p className="eyebrow">Admin</p>
      <h1>XML Export</h1>
      <div style={{ maxWidth: 260, margin: '20px 0' }}>
        <SelectBox
          label="Table"
          value={table}
          onChange={setTable}
          options={Object.entries(TABLES).map(([value, t]) => ({ value, label: t.label }))}
        />
      </div>
      <pre className="xml">{xml}</pre>
    </div>
  )
}
