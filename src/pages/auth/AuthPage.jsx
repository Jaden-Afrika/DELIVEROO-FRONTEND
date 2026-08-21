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

  const inputClass = 'mt-1.5 block w-full rounded-lg border border-slate-300 bg-paper px-3 py-2.5 text-ink placeholder:text-fog focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500'
  return <main className="min-h-screen bg-paper px-5 py-8 sm:px-8"><div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-paper lg:grid-cols-2"><aside className="hidden bg-ink p-10 text-paper lg:block"><p className="font-mono text-xs uppercase tracking-widest text-amber">ParcelPilot</p><h1 className="mt-24 font-display text-4xl font-bold leading-tight">Every parcel, on the right route.</h1><p className="mt-5 max-w-sm text-sm leading-6 text-paper">A practical workspace for dispatching deliveries and keeping every hand-off visible.</p></aside><section className="flex items-center p-6 sm:p-12"><div className="mx-auto w-full max-w-sm"><p className="font-mono text-xs uppercase tracking-widest text-amber">{isSignup ? 'Start dispatching' : 'Welcome back'}</p><h2 className="mt-3 font-display text-3xl font-bold text-ink">{isSignup ? 'Create your account' : 'Log in to ParcelPilot'}</h2><form className="mt-8 space-y-4" onSubmit={submit}>{isSignup && <label className="block text-sm font-medium text-ink">Full name<input className={inputClass} name="name" value={form.name} onChange={update} required /></label>}<label className="block text-sm font-medium text-ink">Email address<input className={inputClass} name="email" type="email" value={form.email} onChange={update} required /></label><label className="block text-sm font-medium text-ink">Password<input className={inputClass} name="password" type="password" value={form.password} onChange={update} required /></label>{isSignup && <label className="block text-sm font-medium text-ink">Confirm password<input className={inputClass} name="confirmPassword" type="password" value={form.confirmPassword} onChange={update} required /></label>}{(validationError || (status === 'failed' && error)) && <p className="rounded-lg border border-caution/30 bg-caution/10 px-3 py-2 text-sm text-caution">{validationError || error}</p>}<button className="w-full rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-paper hover:ring-2 hover:ring-amber disabled:opacity-60" disabled={status === 'loading'}>{status === 'loading' ? 'Please wait...' : isSignup ? 'Create account' : 'Log in'}</button></form><p className="mt-6 text-sm text-fog">{isSignup ? 'Already have an account?' : 'Need an account?'} <Link className="font-semibold text-amber underline" to={isSignup ? '/login' : '/signup'}>{isSignup ? 'Log in' : 'Sign up'}</Link></p></div></section></div></main>
}
