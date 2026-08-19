import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { changeDestination, PARCEL_STATUS } from '../features/parcels/parcelsSlice'

export default function ChangeDestinationForm({ parcel, currentUserId }) {
  const dispatch = useDispatch()
  const [isEditing, setIsEditing] = useState(false)
  const [draftDestination, setDraftDestination] = useState(parcel.destination)
  const [blockedMessage, setBlockedMessage] = useState('')
  const [validationError, setValidationError] = useState('')

  const isOwner = parcel.createdBy === currentUserId
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
      <div className="change-destination">
        <button type="button" className="btn btn--secondary" onClick={openForm} disabled={isDelivered}>
          Change destination
        </button>
        {blockedMessage && <p className="field-message field-message--error">{blockedMessage}</p>}
      </div>
    )
  }

  return (
    <form className="change-destination-form" onSubmit={handleSubmit}>
      <label htmlFor="new-destination">New destination</label>
      <input
        id="new-destination"
        type="text"
        value={draftDestination}
        onChange={(e) => {
          setDraftDestination(e.target.value)
          if (validationError) setValidationError('')
        }}
        placeholder="e.g. Kilimani, Nairobi"
      />
      {validationError && <p className="field-message field-message--error">{validationError}</p>}
      <div className="change-destination-form__actions">
        <button type="button" className="btn btn--ghost" onClick={() => setIsEditing(false)}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary">
          Save destination
        </button>
      </div>
    </form>
  )
}
