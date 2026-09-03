import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../features/auth/authSlice'

export default function AppShell() {
  const user = useSelector((state) => state.auth.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const signOut = () => { dispatch(logoutUser()); navigate('/login', { replace: true }) }
  const linkClass = ({ isActive }) => isActive ? 'font-semibold text-amber' : 'text-paper hover:text-amber'

  return <div className="min-h-screen bg-gradient-to-br from-paper via-paper to-amber/10 text-ink"><header className="border-b-4 border-amber bg-ink shadow-lg shadow-ink/20"><div className="mx-auto flex min-h-16 max-w-3xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8"><Link to="/orders" className="font-display text-lg font-bold text-paper transition hover:text-amber">Deliveroo</Link><nav className="flex flex-wrap items-center gap-4 text-sm"><NavLink to="/orders" className={linkClass}>Orders</NavLink>{user?.role === 'user' && <><NavLink to="/parcels" className={linkClass}>My parcels</NavLink><NavLink to="/parcels/new" className={linkClass}>Make a parcel</NavLink></>}{user?.role === 'admin' && <NavLink to="/admin" className={linkClass}>Admin</NavLink>}<button onClick={signOut} className="rounded-lg border border-paper/70 px-3 py-1.5 font-medium text-paper transition hover:border-amber hover:bg-paper/10 hover:text-amber">Log out</button></nav></div></header><main><Outlet /></main></div>
}
