import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { cancelOrder, PARCEL_STATUS } from '../features/parcels/parcelsSlice'
import ConfirmModal from './ConfirmModal'

export default function CancelDeliveryButton({ parcel, currentUserId, userRole }) {
  const dispatch = useDispatch()
  const [showConfirm, setShowConfirm] = useState(false)
  const [blockedMessage, setBlockedMessage] = useState('')

  const isOwner = String(parcel.ownerId) === String(currentUserId)
  const isDelivered = parcel.status === PARCEL_STATUS.DELIVERED
  const cancellingId = useSelector((state) => state.parcels.cancellingId)

  // Not the creator: don't show the control at all — it's not their
  // parcel to cancel, so there's nothing to explain.
  if (userRole !== 'user' || !isOwner) return null

  function handleClick() {
    if (isDelivered) {
      setBlockedMessage('This parcel has already been delivered and can no longer be cancelled.')
      return
    }
    setBlockedMessage('')
    setShowConfirm(true)
  }

  function handleConfirm() {
    dispatch(cancelOrder(parcel.id))
    setShowConfirm(false)
  }

  return (
    <div>
      <button
        type="button"
        className="rounded-lg border border-caution bg-paper px-4 py-2.5 text-sm font-semibold text-caution disabled:cursor-not-allowed disabled:opacity-50"
        onClick={handleClick}
        disabled={isDelivered || parcel.status === PARCEL_STATUS.CANCELLED || String(cancellingId) === String(parcel.id)}
        aria-disabled={isDelivered}
      >
        {String(cancellingId) === String(parcel.id) ? 'Cancelling...' : 'Cancel order'}
      </button>

      {blockedMessage && <p className="mt-2 text-sm text-caution">{blockedMessage}</p>}

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
