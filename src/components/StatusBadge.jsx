const STATUS_LABEL = {
  pending: 'Pending',
  in_transit: 'In transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export default function StatusBadge({ status }) {
  const label = STATUS_LABEL[status] ?? status
  const style = {
    pending: 'bg-amber/15 text-amber-600',
    in_transit: 'bg-route/10 text-route',
    delivered: 'bg-depot/10 text-depot',
    cancelled: 'bg-caution/10 text-caution',
  }[status] || 'bg-paper text-fog'
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${style}`}>{label}</span>
}
