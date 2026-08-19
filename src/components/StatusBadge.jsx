import './StatusBadge.css'

const STATUS_LABEL = {
  pending: 'Pending',
  in_transit: 'In transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

// className suffix must match a .badge--{status} rule in StatusBadge.css
export default function StatusBadge({ status }) {
  const label = STATUS_LABEL[status] ?? status
  return <span className={`badge badge--${status}`}>{label}</span>
}
