import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loadAllParcels, changeParcelStatus, changeParcelLocation } from '../features/admin/adminSlice'

const STATUS_OPTIONS = [['pending', 'Pending'], ['in_transit', 'In transit'], ['delivered', 'Delivered']]
const STATUS_STYLES = { pending: 'bg-amber/15 text-amber-600', in_transit: 'bg-route/10 text-route', delivered: 'bg-depot/10 text-depot' }

function LocationEditor({ parcel, onSave, saving }) {
  const [value, setValue] = useState(parcel.currentLocation || '')
  const dirty = value !== (parcel.currentLocation || '')
  return <div className="flex items-center gap-2"><input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Current location" className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-paper px-2.5 py-1.5 text-xs text-ink placeholder:text-fog focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500" /><button type="button" disabled={!dirty || saving} onClick={() => onSave(value)} className="rounded-lg bg-ink px-2.5 py-1.5 text-xs font-medium text-paper hover:ring-2 hover:ring-amber disabled:opacity-40">{saving ? 'Saving...' : 'Save'}</button></div>
}

export default function AdminPanel() {
  const dispatch = useDispatch()
  const { items, listStatus, listError, savingId } = useSelector((state) => state.admin)
  useEffect(() => { dispatch(loadAllParcels()) }, [dispatch])

  return <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8"><p className="font-mono text-xs uppercase tracking-widest text-amber">Admin</p><h1 className="mt-3 font-display text-3xl font-bold text-ink">All parcels</h1><p className="mt-3 text-sm text-fog">Update delivery status and current location.</p>{listStatus === 'loading' && <p className="py-10 text-sm text-fog">Loading parcels...</p>}{listStatus === 'failed' && <p className="mt-6 rounded-lg border border-caution/30 bg-caution/10 px-3 py-2 text-sm text-caution">{listError}</p>}{listStatus === 'succeeded' && items.length === 0 && <p className="mt-8 rounded-xl border border-dashed border-slate-300 px-4 py-12 text-center text-sm text-fog">No parcels in the system yet.</p>}{listStatus === 'succeeded' && items.length > 0 && <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200 bg-paper"><table className="w-full text-sm"><thead className="border-b border-slate-200"><tr>{['Parcel', 'Sender', 'Status', 'Current location'].map((heading) => <th key={heading} className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wide text-fog">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-200">{items.map((parcel) => { const saving = savingId === parcel.id; return <tr key={parcel.id}><td className="px-4 py-3 align-top"><p className="font-medium text-ink">{parcel.destination}</p><p className="text-xs text-fog">From {parcel.pickupLocation}</p></td><td className="px-4 py-3 align-top text-fog">{parcel.ownerName || parcel.ownerId || parcel.createdBy}</td><td className="px-4 py-3 align-top"><select value={parcel.status} disabled={saving} onChange={(event) => dispatch(changeParcelStatus({ id: parcel.id, status: event.target.value }))} className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[parcel.status] || 'bg-paper text-fog'}`}>{STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td><td className="w-64 px-4 py-3 align-top"><LocationEditor parcel={parcel} saving={saving} onSave={(currentLocation) => dispatch(changeParcelLocation({ id: parcel.id, currentLocation }))} /></td></tr> })}</tbody></table></div>}</div>
}
