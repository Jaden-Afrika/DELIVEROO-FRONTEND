import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectParcelsForUser } from '../src/features/parcels/parcelsSlice'
import StatusBadge from '../src/components/StatusBadge'

function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function MyParcels() {
  const user = useSelector((state) => state.auth.user)
  const parcels = useSelector((state) => selectParcelsForUser(state, user))

  return <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="font-mono text-xs uppercase tracking-widest text-amber">Personal dispatch</p><h1 className="mt-3 font-display text-3xl font-bold text-ink">My parcels</h1><p className="mt-2 text-sm text-fog">Every delivery you have sent or received.</p></div><Link to="/parcels/new" className="inline-flex w-fit bg-ink px-4 py-2.5 text-sm font-semibold text-paper hover:bg-slate-800">Make a parcel</Link></div>{parcels.length === 0 ? <div className="mt-10 border border-dashed border-slate-300 bg-white px-6 py-20 text-center"><div className="mx-auto grid h-14 w-14 place-items-center border border-amber/40 bg-amber/10 font-display text-2xl text-amber">+</div><h2 className="mt-5 font-display text-xl font-semibold text-ink">Your dispatch board is empty</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-fog">You have not sent or received a parcel yet. Create your first delivery and it will appear here with its route and status.</p><Link to="/parcels/new" className="mt-6 inline-flex bg-amber px-4 py-2.5 text-sm font-semibold text-ink hover:bg-amber/90">Create your first parcel</Link></div> : <div className="mt-8 grid gap-3 lg:grid-cols-2">{parcels.map((parcel) => <Link key={parcel.id} to={`/parcels/${parcel.id}`} className="border border-slate-200 bg-white p-5 hover:border-ink hover:shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-xs uppercase tracking-widest text-fog">{parcel.id}</p><p className="mt-3 font-display font-semibold text-ink">{parcel.destination}</p><p className="mt-1 text-sm text-fog">From {parcel.pickupLocation}</p></div><StatusBadge status={parcel.status} /></div><div className="mt-5 flex justify-between border-t border-slate-100 pt-3 text-xs text-fog"><span>{formatDate(parcel.dateCreated)}</span><span>{parcel.currentLocation}</span></div></Link>)}</div>}</div>
}
