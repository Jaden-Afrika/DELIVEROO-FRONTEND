import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { selectAllParcels } from '../features/parcels/parcelsSlice'
import StatusBadge from '../components/StatusBadge'

// Placeholder for the full Order List page — already reads real data
// from the parcels slice so the route is testable today.
export default function OrdersPage() {
  const parcels = useSelector(selectAllParcels)

  return (
    <div className="orders-page">
      <h2>Your orders</h2>
      <ul className="orders-list">
        {parcels.map((parcel) => (
          <li key={parcel.id}>
            <Link to={`/orders/${parcel.id}`}>
              <span className="orders-list__route">
                {parcel.pickupLocation} → {parcel.destination}
              </span>
              <StatusBadge status={parcel.status} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}