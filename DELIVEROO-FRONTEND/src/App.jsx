import { useEffect, useState } from 'react'
import Login from './pages/auth/Login'
import SignUp from './pages/auth/SignUp'

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('courier-user'))
  } catch {
    return null
  }
}

function Brand({ compact = false }) {
  return <div className="flex items-center gap-2.5">
    <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-paper">
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5"><path d="M5 17.5 10.2 6l3.6 8 2.2-4.2L19 17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="5" cy="17.5" r="1.5" fill="#F5A524" /><circle cx="19" cy="17.5" r="1.5" fill="#F5A524" /></svg>
    </span>
    {!compact && <span className="font-display text-lg font-bold tracking-tight text-ink">ParcelPilot</span>}
  </div>
}

function TopNav({ user, onNavigate, onLogout }) {
  const [open, setOpen] = useState(false)
  return <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8"><Brand /><nav className="hidden items-center gap-6 md:flex"><button onClick={() => onNavigate('/dashboard')} className="text-sm font-medium text-fog hover:text-ink">My Parcels</button><button onClick={() => onNavigate('/create-delivery')} className="text-sm font-medium text-fog hover:text-ink">Create Delivery</button>{user.isAdmin && <button onClick={() => onNavigate('/admin')} className="text-sm font-medium text-fog hover:text-ink">Admin Panel</button>}</nav><div className="relative"><button onClick={() => setOpen(!open)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-ink focus:outline-none focus:ring-2 focus:ring-amber-500" aria-label="Open user menu"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5"><circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.7" /><path d="M5.5 20c.7-3.1 3.1-4.7 6.5-4.7s5.8 1.6 6.5 4.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg></button>{open && <div className="absolute right-0 z-10 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5"><p className="truncate px-2.5 py-2 font-mono text-xs text-fog">{user.email}</p><button onClick={onLogout} className="w-full rounded-lg px-2.5 py-2 text-left text-sm font-medium text-ink hover:bg-paper">Log Out</button></div>}</div></div></header>
}

function Dashboard({ user, onNavigate }) { return <><TopNav user={user} onNavigate={onNavigate} onLogout={() => onNavigate('/login', true)} /><main className="mx-auto max-w-6xl px-5 py-12 sm:px-8"><p className="font-mono text-xs font-medium uppercase tracking-widest text-amber-500">My parcels</p><h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink">Good morning, {user.name.split(' ')[0]}.</h1><div className="mt-8 rounded-xl border border-slate-200 bg-white p-6"><p className="font-mono text-xs uppercase tracking-widest text-fog">No active deliveries</p><p className="mt-3 text-sm text-fog">Create a delivery to start tracking your first parcel.</p><button onClick={() => onNavigate('/create-delivery')} className="mt-5 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-paper focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">Create Delivery</button></div></main></> }

function ProtectedPage({ user, route, onNavigate }) { if (route === '/dashboard') return <Dashboard user={user} onNavigate={onNavigate} />; const title = route === '/admin' ? 'Admin Panel' : 'Create a delivery'; return <><TopNav user={user} onNavigate={onNavigate} onLogout={() => onNavigate('/login', true)} /><main className="mx-auto max-w-6xl px-5 py-12 sm:px-8"><p className="font-mono text-xs font-medium uppercase tracking-widest text-amber-500">{route === '/admin' ? 'Operations' : 'New parcel'}</p><h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink">{title}</h1><div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-sm text-fog">This protected workspace is ready for your delivery workflow.</div></main></> }

function App() {
  const [user, setUser] = useState(getStoredUser)
  const [route, setRoute] = useState(() => {
    const current = window.location.pathname
    const storedUser = getStoredUser()
    const isPublic = current === '/login' || current === '/signup'
    const next = !storedUser && !isPublic ? '/login' : storedUser && isPublic ? '/dashboard' : current
    if (next !== current) window.history.replaceState({}, '', next)
    return next
  })
  const navigate = (to, logout = false) => { if (logout) { localStorage.removeItem('courier-user'); setUser(null) } window.history.pushState({}, '', to); setRoute(to) }
  useEffect(() => { const onPop = () => { const current = window.location.pathname; const isPublic = current === '/login' || current === '/signup'; const next = !user && !isPublic ? '/login' : user && isPublic ? '/dashboard' : current; if (next !== current) window.history.replaceState({}, '', next); setRoute(next) }; window.addEventListener('popstate', onPop); return () => window.removeEventListener('popstate', onPop) }, [user])
  const authProps = { onNavigate: navigate, onAuthenticate: (nextUser) => { setUser(nextUser); navigate('/dashboard') } }
  if (!user) return route === '/signup' ? <SignUp {...authProps} /> : <Login {...authProps} />
  return <ProtectedPage user={user} route={route} onNavigate={navigate} />
}

export default App
