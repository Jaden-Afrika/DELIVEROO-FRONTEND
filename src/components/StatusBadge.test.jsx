import { render, screen } from '@testing-library/react'
import StatusBadge from './StatusBadge'

describe('StatusBadge', () => {
  it.each([
    ['pending', 'Pending', 'bg-amber-100'],
    ['in_transit', 'In transit', 'bg-blue-100'],
    ['delivered', 'Delivered', 'bg-green-100'],
    ['cancelled', 'Cancelled', 'bg-slate-100'],
  ])('renders %s with the %s label and tint', (status, label, tintClass) => {
    render(<StatusBadge status={status} />)
    const badge = screen.getByText(label)
    expect(badge.className).toContain('rounded-full')
    expect(badge.className).toContain(tintClass)
  })
})