import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { changeDestination, PARCEL_STATUS } from '../features/parcels/parcelsSlice'

export default function ChangeDestinationForm({ parcel, currentUserId }) {
  const dispatch = useDispatch()
  const [isEditing, setIsEditing] = useState(false)
  const [draftDestination, setDraftDestination] = useState(parcel.destination)
  const [blockedMessage, setBlockedMessage] = useState('')
  const [validationError, setValidationError] = useState('')

  const ownerId = parcel.createdBy ?? parcel.ownerId ?? parcel.owner_id
  const isOwner = String(ownerId) === String(currentUserId)
  const isDelivered = parcel.status === PARCEL_STATUS.DELIVERED

  if (!isOwner) return null

  function openForm() {
    if (isDelivered) {
      setBlockedMessage('This parcel has already been delivered, so the destination can no longer be changed.')
      return
    }
    setBlockedMessage('')
    setDraftDestination(parcel.destination)
    setIsEditing(true)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = draftDestination.trim()
    if (!trimmed) {
      setValidationError('Enter a destination first.')
      return
    }
    setValidationError('')
    dispatch(changeDestination(parcel.id, trimmed))
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <div>
        <button type="button" className="rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-paper hover:ring-2 hover:ring-amber disabled:cursor-not-allowed disabled:opacity-50" onClick={openForm} disabled={isDelivered}>
          Change destination
        </button>
        {blockedMessage && <p className="mt-2 text-sm text-caution">{blockedMessage}</p>}
      </div>
    )
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
      <label htmlFor="new-destination" className="text-sm font-medium text-ink">New destination</label>
      <input
        id="new-destination"
        type="text"
        value={draftDestination}
        onChange={(e) => {
          setDraftDestination(e.target.value)
          if (validationError) setValidationError('')
        }}
        placeholder="e.g. Kilimani, Nairobi"
        className="w-full rounded-lg border border-slate-300 bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-fog focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
      {validationError && <p className="text-sm text-caution">{validationError}</p>}
      <div className="mt-1 flex gap-2">
        <button type="button" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-ink hover:border-amber" onClick={() => setIsEditing(false)}>
          Cancel
        </button>
        <button type="submit" className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper hover:ring-2 hover:ring-amber">
          Save destination
        </button>
      </div>
    </form>
  )
}
