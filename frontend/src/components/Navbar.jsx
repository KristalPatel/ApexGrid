import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

// Works for a signed-in user object or null (public visitor).
// Signed-in users get a small, non-interactive profile chip. A DBA also gets "Admin Panel".
export default function Navbar({ user = null, onLogout }) {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const overHero = pathname === '/' && !scrolled

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isDBA = user?.role === 'DBA'
  const initial = (user?.username || '?').trim().charAt(0).toUpperCase()

  return (
    <header className={`nav${overHero ? ' nav--hero' : ''}`}>
      <NavLink to="/" className="logo">APEX<span>GRID</span></NavLink>
      <nav className="nav-links" aria-label="Main">
        <NavLink to="/drivers">Drivers</NavLink>
        <NavLink to="/compare">Compare</NavLink>
        <NavLink to="/teams">Teams</NavLink>
        <NavLink to="/races">Races</NavLink>
        <NavLink to="/circuits">Circuits</NavLink>
        {isDBA && <NavLink to="/admin" className="nav-admin">Admin Panel</NavLink>}
      </nav>
      {user ? (
        <div className="nav-user">
          {/* Display only. It does nothing when clicked. */}
          <div className="nav-profile" role="img" aria-label={`Signed in as ${user.username}`}>
            <span className="nav-avatar" aria-hidden="true">{initial}</span>
            <span className="nav-name">{user.username}</span>
          </div>
          <button className="btn ghost small" onClick={onLogout}>Log out</button>
        </div>
      ) : (
        <Link to="/login" className="btn ghost small">Sign in</Link>
      )}
    </header>
  )
}
