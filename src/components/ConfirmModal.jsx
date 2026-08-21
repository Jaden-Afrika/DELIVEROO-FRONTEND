export default function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Go back',
  onConfirm,
  onCancel,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4" role="presentation" onClick={onCancel}>
      <div
        className="w-full max-w-sm rounded-xl border border-slate-200 bg-paper p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-modal-title" className="font-display text-lg font-bold text-ink">{title}</h3>
        <p className="mt-2 text-sm text-fog">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-ink hover:border-amber" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="rounded-lg bg-caution px-4 py-2 text-sm font-medium text-paper hover:ring-2 hover:ring-amber" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
