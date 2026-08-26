import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { loadMyParcels, selectAllParcels } from '../../features/parcels/parcelsSlice'
import StatusBadge from '../components/StatusBadge'

export default function OrdersPage() {
  const dispatch = useDispatch()
  const parcels = useSelector(selectAllParcels)
  const listStatus = useSelector((state) => state.parcels.listStatus)
  const listError = useSelector((state) => state.parcels.listError)

  useEffect(() => {
    dispatch(loadMyParcels())
  }, [dispatch])

  if (listStatus === 'loading') {
    return <div className="orders-page"><p>Loading your orders...</p></div>
  }

  if (listError) {
    return <div className="orders-page"><p className="text-caution">{listError}</p></div>
  }

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
