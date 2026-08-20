import { configureStore } from '@reduxjs/toolkit'
import parcelsReducer, {
  cancelParcel,
  changeDestination,
  selectAllParcels,
  selectParcelById,
} from './parcelsSlice'

jest.mock('../../src/api/client', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
  delay: jest.fn(),
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
  it('cancelParcel sets status to cancelled for a non-delivered parcel', () => {
    const store = setupStore([parcel('p-1', 'pending')])
    store.dispatch(cancelParcel('p-1'))
    expect(store.getState().parcels.items[0].status).toBe('cancelled')
  })

  it('cancelParcel does nothing once status is delivered', () => {
    const store = setupStore([parcel('p-2', 'delivered')])
    store.dispatch(cancelParcel('p-2'))
    expect(store.getState().parcels.items[0].status).toBe('delivered')
  })

  it('cancelParcel does nothing for a missing parcel', () => {
    const store = setupStore([parcel('p-1', 'pending')])
    store.dispatch(cancelParcel('nope'))
    expect(store.getState().parcels.items[0].status).toBe('pending')
  })

  it('changeDestination updates the destination for a non-delivered parcel', () => {
    const store = setupStore([parcel('p-1', 'in_transit')])
    store.dispatch(changeDestination('p-1', 'Kitengela, Kajiado'))
    expect(store.getState().parcels.items[0].destination).toBe('Kitengela, Kajiado')
  })

  it('changeDestination does nothing once status is delivered', () => {
    const store = setupStore([parcel('p-2', 'delivered')])
    store.dispatch(changeDestination('p-2', 'Langata, Nairobi'))
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