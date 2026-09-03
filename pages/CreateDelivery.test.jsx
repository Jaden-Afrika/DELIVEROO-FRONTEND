import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreateDelivery from './CreateDelivery'

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}))

jest.mock('react-router-dom', () => ({ useNavigate: jest.fn() }))

jest.mock('../src/features/parcels/parcelsSlice', () => {
  const submitParcel = jest.fn((payload) => ({ type: 'parcels/submit', payload }))
  submitParcel.fulfilled = { match: () => false }
  return { submitParcel }
})

jest.mock('../src/components/RouteMap', () => ({ onStatusChange, onRouteCalculated }) => (
  <div data-testid="route-map">
    <button type="button" onClick={() => onStatusChange('loading')}>Set loading</button>
    <button type="button" onClick={() => {
      onRouteCalculated({ distanceKm: 12, durationText: '25 min' })
      onStatusChange('ready')
    }}>Set ready</button>
    <button type="button" onClick={() => onStatusChange('error')}>Set error</button>
  </div>
))

const { submitParcel: mockSubmitParcel } = jest.requireMock('../src/features/parcels/parcelsSlice')
const { useDispatch: mockUseDispatch, useSelector: mockUseSelector } = jest.requireMock('react-redux')
const { useNavigate: mockUseNavigate } = jest.requireMock('react-router-dom')
const mockDispatch = jest.fn()
const mockNavigate = jest.fn()

async function completeForm(user) {
  await user.type(screen.getByLabelText('Pickup location'), 'Westlands, Nairobi')
  await user.type(screen.getByLabelText('Destination'), 'Kilimani, Nairobi')
  await user.type(screen.getByLabelText('Parcel weight (kg)'), '4')
}

describe('CreateDelivery route submission state', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseDispatch.mockReturnValue(mockDispatch)
    mockUseSelector.mockImplementation((selector) => selector({ parcels: { createStatus: 'idle', createError: null } }))
    mockUseNavigate.mockReturnValue(mockNavigate)
  })

  it('disables submit and shows a calculation label while a valid route is loading', async () => {
    const user = userEvent.setup()
    render(<CreateDelivery />)
    await completeForm(user)

    await user.click(screen.getByRole('button', { name: 'Set loading' }))

    expect(screen.getByRole('button', { name: 'Calculating route...' })).toBeDisabled()
  })

  it('enables submit once a route is ready', async () => {
    const user = userEvent.setup()
    render(<CreateDelivery />)
    await completeForm(user)

    await user.click(screen.getByRole('button', { name: 'Set ready' }))

    expect(screen.getByRole('button', { name: 'Submit delivery' })).toBeEnabled()
  })

  it('enables the fallback submission with the minimum distance after a routing error', async () => {
    const user = userEvent.setup()
    render(<CreateDelivery />)
    await completeForm(user)

    await user.click(screen.getByRole('button', { name: 'Set error' }))
    expect(screen.getByText(/price estimate unavailable, but you can still submit/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Submit delivery' }))

    expect(mockSubmitParcel).toHaveBeenCalledWith(expect.objectContaining({ distanceKm: 0.1 }))
    expect(mockSubmitParcel).toHaveBeenCalledWith(expect.objectContaining({ weight: 4, vehicle_category: 'bike' }))
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('does not submit an incomplete form even when the route is ready', async () => {
    const user = userEvent.setup()
    render(<CreateDelivery />)

    await user.click(screen.getByRole('button', { name: 'Set ready' }))
    await user.click(screen.getByRole('button', { name: 'Submit delivery' }))

    expect(mockDispatch).not.toHaveBeenCalled()
    expect(await screen.findByText('Pickup location is required.')).toBeInTheDocument()
  })
})
