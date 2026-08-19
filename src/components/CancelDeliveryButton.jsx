import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { cancelParcel, PARCEL_STATUS } from '../features/parcels/parcelsSlice'
import ConfirmModal from './ConfirmModal'

export default function CancelDeliveryButton({ parcel, currentUserId }) {
  const dispatch = useDispatch()
  const [showConfirm, setShowConfirm] = useState(false)
  const [blockedMessage, setBlockedMessage] = useState('')

  const isOwner = parcel.createdBy === currentUserId
  const isDelivered = parcel.status === PARCEL_STATUS.DELIVERED

  // Not the creator: don't show the control at all — it's not their
  // parcel to cancel, so there's nothing to explain.
  if (!isOwner) return null

  function handleClick() {
    if (isDelivered) {
      setBlockedMessage('This parcel has already been delivered and can no longer be cancelled.')
      return
    }
    setBlockedMessage('')
    setShowConfirm(true)
  }

  function handleConfirm() {
    dispatch(cancelParcel(parcel.id))
    setShowConfirm(false)
  }

  return (
    <div className="cancel-delivery">
      <button
        type="button"
        className="btn btn--danger-outline"
        onClick={handleClick}
        disabled={isDelivered}
        aria-disabled={isDelivered}
      >
        Cancel delivery
      </button>

      {blockedMessage && <p className="field-message field-message--error">{blockedMessage}</p>}

      {showConfirm && (
        <ConfirmModal
          title="Cancel this delivery?"
          message="Are you sure you want to cancel? This can't be undone."
          confirmLabel="Yes, cancel it"
          cancelLabel="Keep delivery"
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  )
}
