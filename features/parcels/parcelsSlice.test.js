import { configureStore } from '@reduxjs/toolkit'
import parcelsReducer, {
  cancelOrder,
  changeDestination,
  selectAllParcels,
  selectParcelById,
} from './parcelsSlice'

jest.mock('../../src/api/client', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
  delay: jest.fn(),
}))

jest.mock('./parcelsAPI', () => ({
  createParcel: jest.fn(),
  fetchMyParcels: jest.fn(),
  fetchParcelById: jest.fn(),
  updateDestination: jest.fn(),
  fetchStatusHistory: jest.fn(),
  cancelParcel: jest.fn(),
}))

function setupStore(items = []) {
  return configureStore({
    reducer: { parcels: parcelsReducer },
    preloadedState: {
      parcels: {
        items,
        listStatus: 'succeeded',
        listError: null,
        createStatus: 'idle',
        createError: null,
        lastCreatedId: null,
        detailStatus: 'idle',
        detailError: null,
        cancellingId: null,
        updateDestStatus: 'idle',
        updateDestError: null,
      },
    },
  })
}

function parcel(id, status) {
  return {
    id,
    pickupLocation: 'Kilimani, Nairobi',
    destination: 'Westlands, Nairobi',
    weightCategory: 'medium',
    price: 500,
    status,
    currentLocation: 'Nairobi',
    createdAt: '2026-08-20T09:00:00Z',
    ownerId: 'user-1',
  }
}

describe('parcelsSlice', () => {
  it('cancelOrder thunk updates status via API', async () => {
    const { cancelParcel } = require('./parcelsAPI')
    const updated = { ...parcel('p-1', 'pending'), status: 'cancelled', cancelledAt: new Date().toISOString() }
    cancelParcel.mockResolvedValueOnce(updated)

    const store = setupStore([parcel('p-1', 'pending')])
    const result = await store.dispatch(cancelOrder('p-1'))

    expect(result.type).toBe(cancelOrder.fulfilled.type)
    expect(store.getState().parcels.items[0].status).toBe('cancelled')
  })

  it('cancelOrder thunk rejects on API error', async () => {
    const { cancelParcel } = require('./parcelsAPI')
    cancelParcel.mockRejectedValueOnce({ response: { data: { message: 'Cannot cancel a delivered parcel.' } } })

    const store = setupStore([parcel('p-2', 'delivered')])
    const result = await store.dispatch(cancelOrder('p-2'))

    expect(result.type).toBe(cancelOrder.rejected.type)
    expect(store.getState().parcels.items[0].status).toBe('delivered')
  })

  it('changeDestination thunk updates destination via API', async () => {
    const { updateDestination } = require('./parcelsAPI')
    const updated = { ...parcel('p-1', 'in_transit'), destination: 'Kitengela, Kajiado' }
    updateDestination.mockResolvedValueOnce(updated)

    const store = setupStore([parcel('p-1', 'in_transit')])
    const result = await store.dispatch(changeDestination({ id: 'p-1', destination: 'Kitengela, Kajiado' }))

    expect(result.type).toBe(changeDestination.fulfilled.type)
    expect(store.getState().parcels.items[0].destination).toBe('Kitengela, Kajiado')
  })

  it('changeDestination thunk rejects on API error', async () => {
    const { updateDestination } = require('./parcelsAPI')
    updateDestination.mockRejectedValueOnce({ response: { data: { message: 'Cannot update destination for a delivered parcel.' } } })

    const store = setupStore([parcel('p-2', 'delivered')])
    const result = await store.dispatch(changeDestination({ id: 'p-2', destination: 'Langata, Nairobi' }))

    expect(result.type).toBe(changeDestination.rejected.type)
    expect(store.getState().parcels.items[0].destination).toBe('Westlands, Nairobi')
  })

  it('selectParcelById returns the parcel or null', () => {
    const state = setupStore([parcel('p-1', 'pending')]).getState()
    expect(selectParcelById(state, 'p-1').id).toBe('p-1')
    expect(selectParcelById(state, 'missing')).toBeNull()
  })

  it('selectAllParcels returns items in list order', () => {
    const state = setupStore([parcel('p-1', 'pending'), parcel('p-2', 'in_transit')]).getState()
    expect(selectAllParcels(state).map((p) => p.id)).toEqual(['p-1', 'p-2'])
  })
})
