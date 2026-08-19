import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Navigate, useLocation } from 'react-router-dom'
import {
  loginUser,
  selectAuthError,
  selectAuthLoading,
  selectIsAuthenticated,
} from '../features/auth/authSlice'

export default function LoginPage() {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const loading = useSelector(selectAuthLoading)
  const error = useSelector(selectAuthError)
  const location = useLocation()
  const from = location.state?.from || '/orders'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  function handleSubmit(e) {
    e.preventDefault()
    dispatch(loginUser({ email, password }))
  }

  return (
    <div className="auth-page">
      <h2>Log in</h2>
      {error && <p className="field-message field-message--error">{error}</p>}
      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="auth-switch">
        No account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  )
}