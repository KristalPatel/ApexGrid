import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Lenis from 'lenis'

import Navbar from './components/Navbar.jsx'
import CarTransition from './components/CarTransition.jsx'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import Drivers from './pages/Drivers.jsx'
import DriverDetail from './pages/DriverDetail.jsx'
import Teams from './pages/Teams.jsx'
import TeamDetail from './pages/TeamDetail.jsx'
import Races from './pages/Races.jsx'
import { Circuits, CircuitDetail } from './pages/Circuits.jsx'
import AdminLayout from './admin/AdminLayout.jsx'
import Dashboard from './admin/Dashboard.jsx'
import ManageData from './admin/ManageData.jsx'
import Analytics from './admin/Analytics.jsx'
import QueryBuilder from './admin/QueryBuilder.jsx'
import IndexLab from './admin/IndexLab.jsx'
import Views from './admin/Views.jsx'
import Triggers from './admin/Triggers.jsx'
import Compare from './pages/Compare.jsx'
import XmlExport from './admin/XmlExport.jsx'

function load() {
  try { return JSON.parse(localStorage.getItem('apexgrid_user')) } catch { return null }
}

// Guards for protected areas. Public pages never go through these.
function RequireAuth({ user, children }) {
  return user ? children : <Navigate to="/login" replace />
}
function RequireDBA({ user, children }) {
  if (!user) return <Navigate to="/login" replace />
  return user.role === 'DBA' ? children : <Navigate to="/" replace />
}

export default function App() {
  const [user, setUser] = useState(load)
  const [showCar, setShowCar] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Smooth, inertial scrolling (skipped when the visitor prefers reduced motion)
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined
    const lenis = new Lenis()
    let id
    const raf = (t) => { lenis.raf(t); id = requestAnimationFrame(raf) }
    id = requestAnimationFrame(raf)
    return () => { cancelAnimationFrame(id); lenis.destroy() }
  }, [])

  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  const handleLogin = (u) => {
    // Car sweeps across. The page changes while the screen is covered (about 0.5s in).
    setShowCar(true)
    setTimeout(() => {
      localStorage.setItem('apexgrid_user', JSON.stringify(u))
      setUser(u)
      navigate('/')
    }, 550)
    setTimeout(() => setShowCar(false), 1400)
  }

  const handleLogout = () => {
    localStorage.removeItem('apexgrid_user')
    setUser(null)
    navigate('/') // public homepage, not the login page
  }

  const isAdminArea = pathname.startsWith('/admin')

  return (
    <>
      <AnimatePresence>{showCar && <CarTransition key="car" />}</AnimatePresence>

      {!isAdminArea && <Navbar user={user} onLogout={handleLogout} />}

      <Routes>
        <Route path="/login" element={user && !showCar ? <Navigate to="/" /> : <Login onSuccess={handleLogin} />} />

        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/drivers" element={<Drivers />} />
        <Route path="/drivers/:id" element={<DriverDetail />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/teams/:id" element={<TeamDetail />} />
        <Route path="/races" element={<Races />} />
        <Route path="/circuits" element={<Circuits />} />
        <Route path="/circuits/:id" element={<CircuitDetail />} />

        {/* Protected: DBA only */}
        <Route
          path="/admin"
          element={<RequireDBA user={user}><AdminLayout user={user} onLogout={handleLogout} /></RequireDBA>}
        >
          <Route index element={<Dashboard />} />
          <Route path="manage" element={<ManageData />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="queries" element={<QueryBuilder />} />
          <Route path="index-lab" element={<IndexLab />} />
          <Route path="views" element={<Views />} />
          <Route path="triggers" element={<Triggers />} />
          <Route path="xml" element={<XmlExport />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}
