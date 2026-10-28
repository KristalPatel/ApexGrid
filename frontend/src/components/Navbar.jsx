import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

// Works for a signed-in user object or null (public visitor).
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

  return (
    <header className={`nav${overHero ? ' nav--hero' : ''}`}>
      <NavLink to="/" className="logo">APEX<span>GRID</span></NavLink>
      <nav className="nav-links" aria-label="Main">
        <NavLink to="/drivers">Drivers</NavLink>
        <NavLink to="/teams">Teams</NavLink>
        <NavLink to="/races">Races</NavLink>
        <NavLink to="/circuits">Circuits</NavLink>
        {user?.role === 'DBA' && <NavLink to="/admin">Admin</NavLink>}
      </nav>
      {user ? (
        <button className="btn ghost small" onClick={onLogout}>Log out</button>
      ) : (
        <Link to="/login" className="btn ghost small">Sign in</Link>
      )}
    </header>
  )
}
