const STATUS_LABEL = {
  pending: 'Pending',
  in_transit: 'In transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

// Tailwind tints per the team guide — status colors, neutral gray for
// cancelled (not a guide status).
const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-700',
  in_transit: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-slate-100 text-slate-600',
}

export default function StatusBadge({ status }) {
  const label = STATUS_LABEL[status] ?? status
  const styles = STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-600'
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${styles}`}>
      {label}
    </span>
  )
}