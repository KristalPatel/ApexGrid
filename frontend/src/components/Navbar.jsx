import { NavLink } from 'react-router-dom'

export default function Navbar({ user, onLogout }) {
  return (
    <header className="nav">
      <NavLink to="/" className="logo">APEX<span>GRID</span></NavLink>
      <nav className="nav-links">
        <NavLink to="/drivers">Drivers</NavLink>
        <NavLink to="/teams">Teams</NavLink>
        <NavLink to="/races">Races</NavLink>
        <NavLink to="/circuits">Circuits</NavLink>
        {user.role === 'DBA' && <NavLink to="/admin">Admin</NavLink>}
      </nav>
      <button className="btn ghost small" onClick={onLogout}>Log out</button>
    </header>
  )
}
