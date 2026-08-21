import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { selectParcelsForUser } from '../features/parcels/parcelsSlice'
import StatusBadge from '../components/StatusBadge'

// Placeholder for the full Order List page — already reads real data
// from the parcels slice so the route is testable today.
export default function OrdersPage() {
  const user = useSelector((state) => state.auth.user)
  const parcels = useSelector((state) => selectParcelsForUser(state, user))

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-amber">Dispatch overview</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-ink">{user?.role === 'admin' ? 'All orders' : 'Your orders'}</h1>
          <p className="mt-2 text-sm text-fog">Track every hand-off from pickup to delivery.</p>
        </div>
        {user?.role === 'user' && <Link to="/parcels/new" className="inline-flex w-fit rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-paper hover:ring-2 hover:ring-amber">Make a parcel</Link>}
      </div>
      {parcels.length === 0 && <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-paper px-6 py-16 text-center"><p className="font-display text-lg font-semibold text-ink">No orders yet</p><p className="mt-2 text-sm text-fog">{user?.role === 'admin' ? 'Completed and active orders will appear in the admin workspace.' : 'Create your first parcel to start tracking a delivery.'}</p></div>}
      <ul className="mt-8 grid gap-3 lg:grid-cols-2">
        {parcels.map((parcel) => (
          <li key={parcel.id}>
            <Link to={`/orders/${parcel.id}`} className="block rounded-xl border border-slate-200 bg-paper p-5 transition hover:border-ink hover:shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-fog">{parcel.id}</p>
                  <p className="mt-3 font-display text-base font-semibold text-ink">{parcel.pickupLocation}</p>
                  <p className="mt-1 text-sm text-fog">To {parcel.destination}</p>
                </div>
              <StatusBadge status={parcel.status} />
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-3 text-xs text-fog"><span>{parcel.currentLocation}</span><span className="font-display text-base text-ink">KSh {parcel.price.toLocaleString()}</span></div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
