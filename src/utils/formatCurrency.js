export function formatCurrency(amount, currencyCode) {
  if (amount == null) return '—'

  const currency = currencyCode || 'KES'
  const prefix = currency === 'KES' ? 'KSh' : currency
  return `${prefix} ${amount}`
}
