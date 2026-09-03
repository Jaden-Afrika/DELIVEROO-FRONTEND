import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectParcelForUser } from '../features/parcels/parcelsSlice'
import StatusBadge from '../components/StatusBadge'
import CancelDeliveryButton from '../components/CancelDeliveryButton'
import ChangeDestinationForm from '../components/ChangeDestinationForm'
import RouteMap from '../components/RouteMap'
import { formatCurrency } from '../utils/formatCurrency'
import VehicleCategory from '../components/VehicleCategory'

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function ParcelDetailsPage() {
  const { id } = useParams()
  const currentUser = useSelector((state) => state.auth.user)
  const parcel = useSelector((state) => selectParcelForUser(state, id, currentUser))

  if (!parcel) {
    return <p className="mx-auto max-w-3xl px-5 py-10 text-sm text-fog sm:px-8">Parcel not found.</p>
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <header className="flex items-end justify-between gap-4">
        <div><p className="font-mono text-xs uppercase tracking-widest text-amber">Delivery detail</p><h1 className="mt-3 font-display text-3xl font-bold text-ink">Parcel {parcel.id}</h1></div>
        <StatusBadge status={parcel.status} />
      </header>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <RouteMap
          pickup={parcel.pickupLocation}
          destination={parcel.destination}
          pickupLat={parcel.pickupLatitude}
          pickupLng={parcel.pickupLongitude}
          destinationLat={parcel.destinationLatitude}
          destinationLng={parcel.destinationLongitude}
          distanceKm={parcel.distanceKm}
          estimatedTravelTime={parcel.estimatedTravelTime}
        />
        <dl className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-paper p-5">
          {[['Pickup', parcel.pickupLocation], ['Destination', parcel.destination], ['Current location', parcel.currentLocation], ['Weight', typeof parcel.weight === 'number' ? `${parcel.weight} kg` : parcel.weight], ['Vehicle category', <VehicleCategory key="vehicle-category" category={parcel.vehicle_category ?? parcel.vehicleCategory} weight={parcel.weight} />], ['Price', formatCurrency(parcel.price, parcel.currency)], ['Created', formatDate(parcel.dateCreated)]].map(([label, value]) => <div key={label}><dt className="font-mono text-[11px] uppercase tracking-wide text-fog">{label}</dt><dd className={`mt-1 text-sm font-medium text-ink ${label === 'Price' ? 'font-display text-lg' : ''}`}>{value}</dd></div>)}
        </dl>
      </div>
      <div className="mt-6 flex flex-col gap-4 border-t border-slate-200 pt-6">
        <ChangeDestinationForm parcel={parcel} currentUserId={currentUser?.id} />
        <CancelDeliveryButton parcel={parcel} currentUserId={currentUser?.id} userRole={currentUser?.role} />
      </div>
    </div>
  )
}
