import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectParcelById } from '../features/parcels/parcelsSlice'
import StatusBadge from '../components/StatusBadge'
import CancelDeliveryButton from '../components/CancelDeliveryButton'
import ChangeDestinationForm from '../components/ChangeDestinationForm'
import useAuth from '../hooks/useAuth'
import './ParcelDetailsPage.css'

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function ParcelDetailsPage() {
  const { id } = useParams()
  const parcel = useSelector((state) => selectParcelById(state, id))
  const { currentUser } = useAuth()

  if (!parcel) {
    return <p className="parcel-details__empty">Parcel not found.</p>
  }

  return (
    <div className="parcel-details">
      <header className="parcel-details__header">
        <h2>Parcel details</h2>
        <StatusBadge status={parcel.status} />
      </header>

      {/*
        MAP SLOT — Kesh's Google Map (markers + route line + distance/duration)
        goes here. Pass parcel.pickupLocation / parcel.destination /
        parcel.currentLocation as props once the map component exists.
      */}
      <div className="parcel-details__map-slot">
        <span>Map goes here (pickup + destination markers, route line)</span>
      </div>

      <dl className="parcel-details__info">
        <div>
          <dt>Pickup location</dt>
          <dd>{parcel.pickupLocation}</dd>
        </div>
        <div>
          <dt>Destination</dt>
          <dd>{parcel.destination}</dd>
        </div>
        <div>
          <dt>Current location</dt>
          <dd>{parcel.currentLocation}</dd>
        </div>
        <div>
          <dt>Weight</dt>
          <dd>{parcel.weight}</dd>
        </div>
        <div>
          <dt>Price</dt>
          <dd>Ksh {parcel.price}</dd>
        </div>
        <div>
          <dt>Date created</dt>
          <dd>{formatDate(parcel.dateCreated)}</dd>
        </div>
      </dl>

      <div className="parcel-details__actions">
        <ChangeDestinationForm parcel={parcel} currentUserId={currentUser.id} />
        <CancelDeliveryButton parcel={parcel} currentUserId={currentUser.id} />
      </div>
    </div>
  )
}
