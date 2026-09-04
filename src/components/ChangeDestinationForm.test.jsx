import { configureStore } from '@reduxjs/toolkit'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import parcelsReducer from '../features/parcels/parcelsSlice'
import { updateParcelDestination } from '../features/parcels/parcelsAPI'
import ChangeDestinationForm from './ChangeDestinationForm'

jest.mock('../features/parcels/parcelsAPI', () => ({
  cancelParcel: jest.fn(),
  createParcel: jest.fn(),
  fetchMyParcels: jest.fn(),
  updateParcelDestination: jest.fn(),
}))

const parcel = {
  id: 'p-1002',
  createdBy: 'user-1',
  destination: 'Nairobi CBD',
  status: 'pending',
  distanceKm: 5,
  estimatedTravelTime: 10,
  price: 300,
}

function renderForm(parcelOverride = {}) {
  const store = configureStore({
    reducer: { parcels: parcelsReducer },
    preloadedState: { parcels: { byId: { [parcel.id]: { ...parcel, ...parcelOverride } } } },
  })
  render(<Provider store={store}><ChangeDestinationForm parcel={{ ...parcel, ...parcelOverride }} currentUserId="user-1" /></Provider>)
  return store
}

describe('ChangeDestinationForm', () => {
  it('updates the parcel from the backend response', async () => {
    updateParcelDestination.mockResolvedValue({ ...parcel, destination: 'Kitengela, Kajiado', distanceKm: 25, estimatedTravelTime: 42, price: 900 })
    const store = renderForm()

    fireEvent.click(screen.getByRole('button', { name: 'Change destination' }))
    fireEvent.change(screen.getByLabelText('New destination'), { target: { value: 'Kitengela, Kajiado' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save destination' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'Change destination' })).toBeInTheDocument())
    expect(updateParcelDestination).toHaveBeenCalledWith('p-1002', 'Kitengela, Kajiado')
    expect(store.getState().parcels.byId['p-1002']).toMatchObject({ distanceKm: 25, estimatedTravelTime: 42, price: 900 })
  })

  it('keeps the form open and shows an error when the update fails', async () => {
    updateParcelDestination.mockRejectedValue(new Error('Could not update the destination.'))
    renderForm()

    fireEvent.click(screen.getByRole('button', { name: 'Change destination' }))
    fireEvent.change(screen.getByLabelText('New destination'), { target: { value: 'Invalid place' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save destination' }))

    expect(await screen.findByText('Could not update the destination.')).toBeInTheDocument()
    expect(screen.getByLabelText('New destination')).toBeInTheDocument()
  })

  it('disables destination editing for delivered parcels', () => {
    renderForm({ status: 'delivered' })
    expect(screen.getByRole('button', { name: 'Change destination' })).toBeDisabled()
  })
})