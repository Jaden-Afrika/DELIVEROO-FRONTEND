import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function RequireAdmin() {
  const user = useSelector((state) => state.auth.user)
  return user?.role === 'admin' ? <Outlet /> : <Navigate to="/parcels" replace />
}
