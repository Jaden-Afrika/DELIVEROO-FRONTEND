import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { changeDestination, PARCEL_STATUS } from '../../features/parcels/parcelsSlice'

export default function ChangeDestinationForm({ parcel, currentUserId }) {
  const dispatch = useDispatch()
  const [isEditing, setIsEditing] = useState(false)
  const [draftDestination, setDraftDestination] = useState(parcel.destination)
  const [blockedMessage, setBlockedMessage] = useState('')
  const [validationError, setValidationError] = useState('')
  const updateDestStatus = useSelector((state) => state.parcels.updateDestStatus)

  const isOwner = parcel.ownerId === currentUserId
  const isDelivered = parcel.status === PARCEL_STATUS.DELIVERED
  const isCancelled = parcel.status === PARCEL_STATUS.CANCELLED

  if (!isOwner) return null

  function openForm() {
    if (isDelivered) {
      setBlockedMessage('This parcel has already been delivered, so the destination can no longer be changed.')
      return
    }
    if (isCancelled) {
      setBlockedMessage('This parcel has been cancelled, so the destination can no longer be changed.')
      return
    }
    setBlockedMessage('')
    setDraftDestination(parcel.destination)
    setIsEditing(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = draftDestination.trim()
    if (!trimmed) {
      setValidationError('Enter a destination first.')
      return
    }
    setValidationError('')
    const result = await dispatch(changeDestination({ id: parcel.id, destination: trimmed }))
    if (changeDestination.fulfilled.match(result)) {
      setIsEditing(false)
    } else {
      setValidationError(result.payload || 'Failed to update destination.')
    }
  }

  if (!isEditing) {
    return (
      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          className="rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          onClick={openForm}
          disabled={isDelivered || isCancelled}
        >
          Change destination
        </button>
        {blockedMessage && <p className="text-sm text-caution">{blockedMessage}</p>}
      </div>
    )
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
      <label className="text-sm text-fog" htmlFor="new-destination">
        New destination
      </label>
      <input
        id="new-destination"
        type="text"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-ink focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
        value={draftDestination}
        onChange={(e) => {
          setDraftDestination(e.target.value)
          if (validationError) setValidationError('')
        }}
        placeholder="e.g. Kilimani, Nairobi"
      />
      {validationError && <p className="text-sm text-caution">{validationError}</p>}
      {updateDestStatus === 'loading' && <p className="text-sm text-fog">Updating...</p>}
      <div className="mt-1 flex gap-2">
        <button
          type="button"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-slate-50"
          onClick={() => setIsEditing(false)}
          disabled={updateDestStatus === 'loading'}
        >
          Cancel
        </button>
        <button type="submit" className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white" disabled={updateDestStatus === 'loading'}>
          {updateDestStatus === 'loading' ? 'Saving...' : 'Save destination'}
        </button>
      </div>
    </form>
  )
}
