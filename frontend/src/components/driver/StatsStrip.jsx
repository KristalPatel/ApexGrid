import Counter from '../Counter.jsx'

const Icon = ({ children }) => (
  <svg className="dd-stat__icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

const ITEMS = [
  { key: 'wins', label: 'Wins', icon: <Icon><path d="M10 5h12v7a6 6 0 0 1-12 0V5Z" /><path d="M10 8H5v2a4 4 0 0 0 5 3.8M22 8h5v2a4 4 0 0 1-5 3.8" /><path d="M16 18v5M11 27h10M13 23h6" /></Icon> },
  { key: 'podiums', label: 'Podiums', icon: <Icon><rect x="3" y="18" width="8" height="9" /><rect x="12" y="13" width="8" height="14" /><rect x="21" y="21" width="8" height="6" /><path d="M16 5l1.2 2.6 2.8.3-2.1 1.9.6 2.8L16 11.2l-2.5 1.4.6-2.8-2.1-1.9 2.8-.3L16 5Z" /></Icon> },
  { key: 'poles', label: 'Poles', icon: <Icon><path d="M7 28V4" /><path d="M7 5h18v13H7" /><path d="M7 5h4.5v4.3H7M16 5h4.5v4.3H16M11.5 9.3H16v4.3h-4.5M20.5 9.3H25v4.3h-4.5M7 13.6h4.5V18H7M16 13.6h4.5V18H16" /></Icon> },
  { key: 'fastest_laps', label: 'Fastest laps', icon: <Icon><circle cx="16" cy="18" r="9" /><path d="M16 18l4-5M13 4h6M16 4v5" /></Icon> },
]

const isNum = (v) => typeof v === 'number' && Number.isFinite(v)

export default function StatsStrip({ stats }) {
  const anyData = ITEMS.some((i) => isNum(stats?.[i.key]))
  return (
    <section className="dd-wrap" aria-label="Career statistics">
      <ul className="dd-stats">
        {ITEMS.map((i) => {
          const v = stats?.[i.key]
          return (
            <li key={i.key} className="dd-stat">
              {i.icon}
              <div>
                <b className="dd-stat__value" aria-label={isNum(v) ? `${v} ${i.label}` : `${i.label} not available`}>
                  {isNum(v) ? <Counter to={v} duration={1100} /> : '—'}
                </b>
                <span className="dd-stat__label">{i.label}</span>
              </div>
            </li>
          )
        })}
      </ul>
      {!anyData && <p className="dd-note">Career statistics will appear once race results are recorded.</p>}
      {anyData && ITEMS.some((i) => !isNum(stats?.[i.key])) && (
        <p className="dd-note">A dash means that statistic hasn’t been recorded in the database yet.</p>
      )}
    </section>
  )
}
