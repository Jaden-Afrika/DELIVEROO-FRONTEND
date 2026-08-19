import { Routes, Route, Navigate } from 'react-router-dom'
import OrdersPage from './pages/OrdersPage'
import ParcelDetailsPage from './pages/ParcelDetailsPage'
import AdminPage from './pages/AdminPage'

// Scoped to the "Parcel Details & Changes" feature only. Login/signup
// routes and route protection belong to the teammate building
// "Login & Accounts"; /admin access control belongs to theirs too.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<OrdersPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/orders/:id" element={<ParcelDetailsPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/orders" replace />} />
    </Routes>
  )
}