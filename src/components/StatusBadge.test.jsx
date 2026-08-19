import { render, screen } from '@testing-library/react'
import StatusBadge from './StatusBadge'

describe('StatusBadge', () => {
  it.each([
    ['pending', 'Pending', 'badge--pending'],
    ['in_transit', 'In transit', 'badge--in_transit'],
    ['delivered', 'Delivered', 'badge--delivered'],
    ['cancelled', 'Cancelled', 'badge--cancelled'],
  ])('renders %s with the %s label', (status, label, className) => {
    render(<StatusBadge status={status} />)
    const badge = screen.getByText(label)
    expect(badge.className).toContain(className)
  })
})