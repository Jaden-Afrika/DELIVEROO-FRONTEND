import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectParcelById } from '../../features/parcels/parcelsSlice'
import { WEIGHT_CATEGORIES } from '../../features/parcels/parcelsAPI'
import StatusBadge from '../components/StatusBadge'
import CancelDeliveryButton from '../components/CancelDeliveryButton'
import ChangeDestinationForm from '../components/ChangeDestinationForm'
import useAuth from '../hooks/useAuth'

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function weightLabel(weightCategory) {
  const match = WEIGHT_CATEGORIES.find((w) => w.value === weightCategory)
  return match ? match.label : weightCategory
}

export default function ParcelDetailsPage() {
  const { id } = useParams()
  const parcel = useSelector((state) => selectParcelById(state, id))
  const { currentUser } = useAuth()

  if (!parcel) {
    return <p className="mx-auto max-w-xl p-5 text-left text-ink">Parcel not found.</p>
  }

  return (
    <div className="mx-auto max-w-xl p-5 text-left">
      <header className="mb-4">
        <p className="font-mono text-xs font-medium uppercase tracking-widest text-amber-500">
          Parcel Details
        </p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-bold text-ink">{parcel.id}</h1>
          <StatusBadge status={parcel.status} />
        </div>
      </header>

      {/*
        MAP SLOT — Kesh's Google Map (markers + route line + distance/duration)
        goes here. Pass parcel.pickupLocation / parcel.destination /
        parcel.currentLocation as props once the map component exists.
      */}
      <div className="mb-5 flex h-44 items-center justify-center rounded-xl border border-slate-200 bg-white p-4 text-center text-sm text-fog">
        <span>Map goes here (pickup + destination markers, route line)</span>
      </div>

      <dl className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <dt className="font-mono text-xs uppercase tracking-wider text-fog">Pickup location</dt>
          <dd className="mt-0.5 text-sm font-medium text-ink">{parcel.pickupLocation}</dd>
        </div>
        <div>
          <dt className="font-mono text-xs uppercase tracking-wider text-fog">Destination</dt>
          <dd className="mt-0.5 text-sm font-medium text-ink">{parcel.destination}</dd>
        </div>
        <div>
          <dt className="font-mono text-xs uppercase tracking-wider text-fog">Current location</dt>
          <dd className="mt-0.5 text-sm font-medium text-ink">{parcel.currentLocation}</dd>
        </div>
        <div>
          <dt className="font-mono text-xs uppercase tracking-wider text-fog">Weight</dt>
          <dd className="mt-0.5 text-sm font-medium text-ink">{weightLabel(parcel.weightCategory)}</dd>
        </div>
        <div>
          <dt className="font-mono text-xs uppercase tracking-wider text-fog">Price</dt>
          <dd className="mt-0.5 text-sm font-medium text-ink">Ksh {parcel.price}</dd>
        </div>
        <div>
          <dt className="font-mono text-xs uppercase tracking-wider text-fog">Date created</dt>
          <dd className="mt-0.5 text-sm font-medium text-ink">{formatDate(parcel.createdAt)}</dd>
        </div>
      </dl>

      <div className="flex flex-col gap-4 border-t border-slate-200 pt-5">
        <ChangeDestinationForm parcel={parcel} currentUserId={currentUser.id} />
        <CancelDeliveryButton parcel={parcel} currentUserId={currentUser.id} />
      </div>
    </div>
  )
}