import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { changeDestination, PARCEL_STATUS } from '../features/parcels/parcelsSlice'

export default function ChangeDestinationForm({ parcel, currentUserId }) {
  const dispatch = useDispatch()
  const updateDestStatus = useSelector((state) => state.parcels.updateDestStatus)
  const updateDestError = useSelector((state) => state.parcels.updateDestError)
  const [isEditing, setIsEditing] = useState(false)
  const [draftDestination, setDraftDestination] = useState(parcel.destination)
  const [blockedMessage, setBlockedMessage] = useState('')
  const [validationError, setValidationError] = useState('')

  const isOwner = String(parcel.createdBy) === String(currentUserId)
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
      {updateDestStatus === 'failed' && updateDestError && <p className="text-sm text-caution">{updateDestError}</p>}
      <div className="mt-1 flex gap-2">
        <button type="button" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-ink hover:border-amber disabled:cursor-not-allowed disabled:opacity-50" onClick={() => setIsEditing(false)} disabled={updateDestStatus === 'loading'}>
          Cancel
        </button>
        <button type="submit" className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper hover:ring-2 hover:ring-amber disabled:cursor-not-allowed disabled:opacity-50" disabled={updateDestStatus === 'loading'}>
          {updateDestStatus === 'loading' ? 'Saving...' : 'Save destination'}
        </button>
      </div>
    </form>
  )
}
