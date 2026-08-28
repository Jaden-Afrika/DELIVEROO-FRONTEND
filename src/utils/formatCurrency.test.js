import { formatCurrency } from './formatCurrency'

describe('formatCurrency', () => {
  it('uses the KSh prefix for Kenyan shillings', () => {
    expect(formatCurrency(450, 'KES')).toBe('KSh 450')
  })

  it('uses an unknown ISO currency code as the prefix', () => {
    expect(formatCurrency(10, 'USD')).toBe('USD 10')
  })

  it('handles missing amounts', () => {
    expect(formatCurrency(null, 'KES')).toBe('—')
    expect(formatCurrency(undefined, 'KES')).toBe('—')
  })
})
