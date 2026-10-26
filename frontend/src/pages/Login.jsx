import { useState } from 'react'
import { motion } from 'framer-motion'
import { login } from '../api.js'

export default function Login({ onSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const user = await login(username.trim(), password)
      onSuccess(user)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="login-wrap">
      <div className="stripes" />
      <div className="glow" style={{ top: '-200px', right: '-150px' }} />
      <motion.form
        className="login-card"
        onSubmit={submit}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="logo" style={{ marginBottom: 18 }}>APEX<span>GRID</span></div>
        <h1>Lights out.</h1>
        <p className="page-sub" style={{ margin: '8px 0 26px' }}>Sign in to enter the paddock.</p>

        <div className="field">
          <label>Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus required />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <div className="error">{error}</div>}
        <button className="btn" style={{ width: '100%' }} disabled={busy}>
          {busy ? 'Checking...' : 'Enter'}
        </button>
        <p className="notice" style={{ marginTop: 18 }}>
          Don&apos;t have an account? Contact Admin.
        </p>
        <p className="notice">Demo logins: admin / admin123 (admin), fan / fan123 (user)</p>
      </motion.form>
    </div>
  )
}
