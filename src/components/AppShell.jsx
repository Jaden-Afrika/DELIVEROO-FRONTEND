import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../features/auth/authSlice'

export default function AppShell() {
  const user = useSelector((state) => state.auth.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const signOut = () => { dispatch(logoutUser()); navigate('/login', { replace: true }) }
  const linkClass = ({ isActive }) => isActive ? 'font-semibold text-ink' : 'text-fog hover:text-ink'

  return <div className="min-h-screen bg-paper text-ink"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8"><Link to="/orders" className="font-display text-lg font-bold">ParcelPilot</Link><nav className="flex flex-wrap items-center gap-4 text-sm"><NavLink to="/orders" className={linkClass}>Orders</NavLink><NavLink to="/parcels" className={linkClass}>My parcels</NavLink><NavLink to="/parcels/new" className={linkClass}>Make a parcel</NavLink>{user?.role === 'admin' && <NavLink to="/admin" className={linkClass}>Admin</NavLink>}<button onClick={signOut} className="border border-slate-300 px-3 py-1.5 font-medium hover:border-ink">Log out</button></nav></div></header><main><Outlet /></main></div>
}
