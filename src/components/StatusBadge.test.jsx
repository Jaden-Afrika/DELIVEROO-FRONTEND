import { render, screen } from '@testing-library/react'
import StatusBadge from './StatusBadge'

describe('StatusBadge', () => {
  it.each([
    ['pending', 'Pending', 'text-amber-600'],
    ['in_transit', 'In transit', 'text-route'],
    ['delivered', 'Delivered', 'text-depot'],
    ['cancelled', 'Cancelled', 'text-caution'],
  ])('renders %s with the %s label', (status, label, className) => {
    render(<StatusBadge status={status} />)
    const badge = screen.getByText(label)
    expect(badge.className).toContain(className)
  })
})
