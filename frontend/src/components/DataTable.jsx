// Shows any list of rows as a table. Almost every page uses this.
export default function DataTable({ rows, columns }) {
  if (!rows || rows.length === 0) return <p className="notice">No rows to show.</p>
  const cols = columns || Object.keys(rows[0])
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{cols.map((c) => <th key={c}>{c.replace(/_/g, ' ')}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{cols.map((c) => <td key={c}>{String(r[c] ?? '')}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
