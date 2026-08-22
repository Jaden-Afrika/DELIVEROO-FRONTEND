import { Routes, Route, Navigate } from 'react-router-dom'
import OrdersPage from './pages/OrdersPage'
import ParcelDetailsPage from './pages/ParcelDetailsPage'
import AdminPanel from './pages/AdminPanel'
import CreateDelivery from '../pages/CreateDelivery'
import MyParcels from '../pages/MyParcels'
import Login from './pages/auth/Login'
import SignUp from './pages/auth/SignUp'
import AppShell from './components/AppShell'
import RequireAuth from './components/RequireAuth'
import RequireAdmin from './components/RequireAdmin'
import RequireUser from './components/RequireUser'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/orders" replace />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<ParcelDetailsPage />} />
          <Route element={<RequireUser />}>
            <Route path="/parcels" element={<MyParcels />} />
            <Route path="/parcels/new" element={<CreateDelivery />} />
            <Route path="/parcels/:id" element={<ParcelDetailsPage />} />
          </Route>
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/orders" replace />} />
    </Routes>
  )
}
