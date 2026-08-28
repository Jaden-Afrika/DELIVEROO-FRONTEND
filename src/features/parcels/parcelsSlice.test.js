import { configureStore } from '@reduxjs/toolkit'
import parcelsReducer, {
  cancelParcel,
  changeDestination,
  loadMyParcels,
  selectAllParcels,
  selectParcelById,
} from './parcelsSlice'
import mockParcels from '../../mocks/parcels'

jest.mock('./parcelsAPI', () => ({
  fetchMyParcels: jest.fn(),
  createParcel: jest.fn(),
  cancelParcel: jest.fn(),
  updateDestination: jest.fn(),
}))

async function setupLoadedStore() {
  const store = configureStore({ reducer: { parcels: parcelsReducer } })
  const { fetchMyParcels } = require('./parcelsAPI')
  fetchMyParcels.mockResolvedValue(mockParcels)
  await store.dispatch(loadMyParcels())
  return store
}

describe('parcelsSlice', () => {
  it('loads all mock parcels into the store', async () => {
    const { fetchMyParcels } = require('./parcelsAPI')
    fetchMyParcels.mockResolvedValue(mockParcels)
    const store = configureStore({ reducer: { parcels: parcelsReducer } })
    await store.dispatch(loadMyParcels())
    const state = store.getState()
    expect(selectAllParcels(state)).toHaveLength(mockParcels.length)
    expect(selectParcelById(state, 'p-1001').destination).toBe('Kilimani, Nairobi')
  })

  it('selectAllParcels returns an array copy in insertion order', async () => {
    const state = (await setupLoadedStore()).getState()
    const ids = selectAllParcels(state).map((p) => p.id)
    expect(ids).toEqual(mockParcels.map((p) => p.id))
  })

  it('cancelParcel sets status to cancelled for a non-delivered parcel', async () => {
    const store = await setupLoadedStore()
    store.dispatch(cancelParcel('p-1002'))
    expect(store.getState().parcels.byId['p-1002'].status).toBe('cancelled')
    expect(store.getState().parcels.byId['p-1004'].status).toBe('in_transit')
  })

  it('cancelParcel does nothing once status is delivered', async () => {
    const store = await setupLoadedStore()
    store.dispatch(cancelParcel('p-1003'))
    expect(store.getState().parcels.byId['p-1003'].status).toBe('delivered')
  })

  it('changeDestination persists via the API and updates the parcel on success', async () => {
    const store = await setupLoadedStore()
    const { updateDestination } = require('./parcelsAPI')
    updateDestination.mockResolvedValue({ id: 'p-1002', destination: 'Kitengela, Kajiado', status: 'in_transit', currentLocation: 'Westlands, Nairobi' })
    await store.dispatch(changeDestination({ id: 'p-1002', destination: 'Kitengela, Kajiado' }))
    expect(updateDestination).toHaveBeenCalledWith('p-1002', 'Kitengela, Kajiado')
    expect(store.getState().parcels.byId['p-1002'].destination).toBe('Kitengela, Kajiado')
    expect(store.getState().parcels.updateDestStatus).toBe('succeeded')
  })

  it('changeDestination does not update the parcel when the API rejects', async () => {
    const store = await setupLoadedStore()
    const { updateDestination } = require('./parcelsAPI')
    updateDestination.mockRejectedValue({ response: { data: { message: 'Cannot update' } } })
    const original = store.getState().parcels.byId['p-1006'].destination
    await store.dispatch(changeDestination({ id: 'p-1006', destination: 'Langata, Nairobi' }))
    expect(store.getState().parcels.byId['p-1006'].destination).toBe(original)
    expect(store.getState().parcels.updateDestStatus).toBe('failed')
  })
})
