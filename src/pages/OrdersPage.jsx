import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { loadMyParcels, selectParcelsForUser } from '../features/parcels/parcelsSlice'
import StatusBadge from '../components/StatusBadge'
import RouteMap from '../components/RouteMap'
import { formatCurrency } from '../utils/formatCurrency'
import { getVehicleCategory, getVehicleCategoryByValue } from '../utils/vehicleCategory'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'delivered', label: 'Delivered' },
]

function formatDate(value) {
  const date = value ? new Date(value) : null
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Date unavailable'
}

function routeDetails(parcel) {
  const details = []
  if (parcel.distanceKm != null) details.push(`${Number(parcel.distanceKm).toFixed(1)} km`)
  if (parcel.estimatedTravelTime != null) details.push(`${Math.round(Number(parcel.estimatedTravelTime))} min`)
  return details.length ? details.join(' · ') : 'Route details unavailable'
}

export default function OrdersPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const parcels = useSelector((state) => selectParcelsForUser(state, user))
  const { listStatus, listError } = useSelector((state) => state.parcels)

  useEffect(() => {
    if (listStatus === 'idle') dispatch(loadMyParcels())
  }, [dispatch, listStatus])

  const summary = useMemo(() => ({
    total: parcels.length,
    pending: parcels.filter((parcel) => parcel.status === 'pending').length,
    inTransit: parcels.filter((parcel) => parcel.status === 'in_transit').length,
    delivered: parcels.filter((parcel) => parcel.status === 'delivered').length,
  }), [parcels])

  const filteredParcels = useMemo(
    () => activeFilter === 'all' ? parcels : parcels.filter((parcel) => parcel.status === activeFilter),
    [activeFilter, parcels],
  )

  const stats = [
    ['Total orders', summary.total, 'border-ink/15 bg-ink text-paper', 'text-paper/70'],
    ['Pending', summary.pending, 'border-amber/30 bg-amber/15 text-amber-600', 'text-amber-600'],
    ['In transit', summary.inTransit, 'border-route/20 bg-route/10 text-route', 'text-route'],
    ['Delivered', summary.delivered, 'border-depot/20 bg-depot/10 text-depot', 'text-depot'],
  ]
  const activeFilterLabel = FILTERS.find((filter) => filter.value === activeFilter)?.label.toLowerCase()

  return <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div><p className="font-mono text-xs uppercase tracking-widest text-amber">Dispatch overview</p><h1 className="mt-3 font-display text-3xl font-bold text-ink">{user?.role === 'admin' ? 'All orders' : 'Your orders'}</h1><p className="mt-2 text-sm text-fog">Track every hand-off from pickup to delivery.</p></div>
      {user?.role === 'user' && <Link to="/parcels/new" className="inline-flex w-fit rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-paper hover:ring-2 hover:ring-amber">Make a parcel</Link>}
    </div>

    <section aria-label="Order summary" className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map(([label, value, cardStyle, labelStyle]) => <div key={label} className={`rounded-xl border p-4 shadow-sm ${cardStyle}`}><p className={`font-mono text-[11px] uppercase tracking-wide ${labelStyle}`}>{label}</p><p className="mt-2 font-display text-2xl font-bold">{value}</p></div>)}
    </section>

    <div className="mt-8 flex gap-2 overflow-x-auto border-b border-slate-200" role="tablist" aria-label="Filter orders by status">
      {FILTERS.map((filter) => <button key={filter.value} type="button" role="tab" aria-selected={activeFilter === filter.value} onClick={() => setActiveFilter(filter.value)} className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition ${activeFilter === filter.value ? 'border-amber text-ink' : 'border-transparent text-fog hover:text-ink'}`}>{filter.label}</button>)}
    </div>

    {listStatus === 'loading' ? <p className="mt-8 text-sm text-fog">Loading your orders...</p> : listStatus === 'failed' ? <p className="mt-8 text-sm text-caution">{listError || 'Could not load your orders.'}</p> : parcels.length === 0 ? <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-paper px-6 py-16 text-center"><p className="font-display text-lg font-semibold text-ink">No orders yet</p><p className="mt-2 text-sm text-fog">{user?.role === 'admin' ? 'Completed and active orders will appear in the admin workspace.' : "You haven't sent any parcels yet. Create your first parcel to start tracking a delivery."}</p></div> : filteredParcels.length === 0 ? <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-paper px-6 py-16 text-center"><p className="font-display text-lg font-semibold text-ink">No {activeFilterLabel} parcels yet</p><p className="mt-2 text-sm text-fog">Try another status to see the rest of your deliveries.</p></div> : <ul className="mt-6 grid gap-4 lg:grid-cols-2">
      {filteredParcels.map((parcel) => {
        const weightKg = parcel.weight_kg ?? parcel.weightKg ?? parcel.weight
        const vehicle = getVehicleCategoryByValue(parcel.vehicle_category ?? parcel.vehicleCategory) ?? getVehicleCategory(weightKg)
        return <li key={parcel.id}><Link to={`/orders/${parcel.id}`} className="block overflow-hidden rounded-xl border border-slate-200 bg-paper transition hover:border-ink hover:shadow-sm">
          <RouteMap pickup={parcel.pickupLocation} destination={parcel.destination} pickupLat={parcel.pickupLatitude} pickupLng={parcel.pickupLongitude} destinationLat={parcel.destinationLatitude} destinationLng={parcel.destinationLongitude} distanceKm={parcel.distanceKm} estimatedTravelTime={parcel.estimatedTravelTime} compact />
          <div className="p-5"><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-xs uppercase tracking-widest text-fog">{parcel.id}</p><p className="mt-3 font-display text-base font-semibold text-ink">{parcel.pickupLocation}</p><p className="mt-1 text-sm text-fog">To {parcel.destination}</p></div><StatusBadge status={parcel.status} /></div><div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200 pt-3"><div className="text-xs text-fog"><p>{formatDate(parcel.created_at ?? parcel.createdAt ?? parcel.dateCreated)}</p><p className="mt-1">{routeDetails(parcel)}</p></div><div className="text-right"><p className="font-display text-base text-ink">{formatCurrency(parcel.price, parcel.currency)}</p>{vehicle && <p className="mt-1 text-xs font-medium text-fog"><span aria-hidden="true">{vehicle.icon}</span> {vehicle.label}</p>}</div></div></div>
        </Link></li>
      })}
    </ul>}
  </div>
}
