import { NavLink, Outlet, Link } from 'react-router-dom'
import { ADMIN_MENU } from '../config/appConfig.js'

export default function AdminLayout({ user, onLogout }) {
  return (
    <div className="admin">
      <aside className="side">
        <Link to="/" className="logo">APEX<span>GRID</span></Link>
        {ADMIN_MENU.map((m) => (
          <NavLink key={m.to} to={m.to} end={m.end}>{m.label}</NavLink>
        ))}
        <div className="bottom">
          <p className="notice" style={{ marginBottom: 10 }}>Signed in as {user.username}</p>
          <button className="btn ghost small" onClick={onLogout}>Log out</button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
