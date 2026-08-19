import { configureStore } from '@reduxjs/toolkit'
import parcelsReducer, {
  cancelParcel,
  changeDestination,
  selectAllParcels,
  selectParcelById,
} from './parcelsSlice'
import mockParcels from '../../mocks/parcels'

function setupStore() {
  return configureStore({ reducer: { parcels: parcelsReducer } })
}

describe('parcelsSlice', () => {
  it('loads all mock parcels into initial state', () => {
    const state = setupStore().getState()
    expect(selectAllParcels(state)).toHaveLength(mockParcels.length)
    expect(selectParcelById(state, 'p-1001').destination).toBe('Kilimani, Nairobi')
  })

  it('selectAllParcels returns an array copy in insertion order', () => {
    const state = setupStore().getState()
    const ids = selectAllParcels(state).map((p) => p.id)
    expect(ids).toEqual(mockParcels.map((p) => p.id))
  })

  it('cancelParcel sets status to cancelled for a non-delivered parcel', () => {
    const store = setupStore()
    store.dispatch(cancelParcel('p-1002'))
    expect(store.getState().parcels.byId['p-1002'].status).toBe('cancelled')
    expect(store.getState().parcels.byId['p-1004'].status).toBe('in_transit')
  })

  it('cancelParcel does nothing once status is delivered', () => {
    const store = setupStore()
    store.dispatch(cancelParcel('p-1003'))
    expect(store.getState().parcels.byId['p-1003'].status).toBe('delivered')
  })

  it('changeDestination updates the destination for a non-delivered parcel', () => {
    const store = setupStore()
    store.dispatch(changeDestination('p-1002', 'Kitengela, Kajiado'))
    expect(store.getState().parcels.byId['p-1002'].destination).toBe('Kitengela, Kajiado')
  })

  it('changeDestination does nothing once status is delivered', () => {
    const store = setupStore()
    store.dispatch(changeDestination('p-1006', 'Langata, Nairobi'))
    expect(store.getState().parcels.byId['p-1006'].destination).toBe('Westlands, Nairobi')
  })
})