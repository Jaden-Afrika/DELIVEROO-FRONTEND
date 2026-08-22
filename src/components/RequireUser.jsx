import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function RequireUser() {
  const user = useSelector((state) => state.auth.user)
  return user?.role === 'user' ? <Outlet /> : <Navigate to="/admin" replace />
}
