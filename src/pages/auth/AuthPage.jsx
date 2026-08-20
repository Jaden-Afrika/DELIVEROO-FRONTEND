import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { loginUser, signupUser } from '../../features/auth/authSlice'

export default function AuthPage({ mode }) {
  const isSignup = mode === 'signup'
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { status, error } = useSelector((state) => state.auth)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [validationError, setValidationError] = useState('')
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  async function submit(event) {
    event.preventDefault()
    if (form.password.length < 8) return setValidationError('Use at least 8 characters for your password.')
    if (isSignup && form.password !== form.confirmPassword) return setValidationError('Passwords do not match.')
    setValidationError('')
    const result = await dispatch(isSignup ? signupUser(form) : loginUser(form))
    const fulfilled = isSignup ? signupUser.fulfilled.match(result) : loginUser.fulfilled.match(result)
    if (fulfilled) navigate(location.state?.from?.pathname || '/orders', { replace: true })
  }

  return <main className="min-h-screen bg-paper px-5 py-8 sm:px-8"><div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl border border-slate-200 bg-white lg:grid-cols-2"><aside className="hidden bg-ink p-10 text-paper lg:block"><p className="font-mono text-xs uppercase tracking-widest text-amber">ParcelPilot</p><h1 className="mt-24 font-display text-4xl font-bold leading-tight">Every parcel, on the right route.</h1><p className="mt-5 max-w-sm text-sm leading-6 text-slate-300">A practical workspace for dispatching deliveries and keeping every hand-off visible.</p></aside><section className="flex items-center p-6 sm:p-12"><div className="mx-auto w-full max-w-sm"><p className="font-mono text-xs uppercase tracking-widest text-amber">{isSignup ? 'Start dispatching' : 'Welcome back'}</p><h2 className="mt-3 font-display text-3xl font-bold text-ink">{isSignup ? 'Create your account' : 'Log in to ParcelPilot'}</h2><form className="mt-8 space-y-4" onSubmit={submit}>{isSignup && <label className="block text-sm font-medium">Full name<input className="mt-1.5 block w-full border border-slate-300 bg-paper px-3 py-2.5" name="name" value={form.name} onChange={update} required /></label>}<label className="block text-sm font-medium">Email address<input className="mt-1.5 block w-full border border-slate-300 bg-paper px-3 py-2.5" name="email" type="email" value={form.email} onChange={update} required /></label><label className="block text-sm font-medium">Password<input className="mt-1.5 block w-full border border-slate-300 bg-paper px-3 py-2.5" name="password" type="password" value={form.password} onChange={update} required /></label>{isSignup && <label className="block text-sm font-medium">Confirm password<input className="mt-1.5 block w-full border border-slate-300 bg-paper px-3 py-2.5" name="confirmPassword" type="password" value={form.confirmPassword} onChange={update} required /></label>}{(validationError || (status === 'failed' && error)) && <p className="text-sm text-caution">{validationError || error}</p>}<button className="w-full bg-ink px-4 py-3 text-sm font-semibold text-paper disabled:opacity-60" disabled={status === 'loading'}>{status === 'loading' ? 'Please wait...' : isSignup ? 'Create account' : 'Log in'}</button></form><p className="mt-6 text-sm text-fog">{isSignup ? 'Already have an account?' : 'Need an account?'} <Link className="font-semibold text-ink underline" to={isSignup ? '/login' : '/signup'}>{isSignup ? 'Log in' : 'Sign up'}</Link></p></div></section></div></main>
}