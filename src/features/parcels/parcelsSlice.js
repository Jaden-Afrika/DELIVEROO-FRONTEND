import { createSlice } from '@reduxjs/toolkit'
import mockParcels from '../../mocks/parcels'

export const PARCEL_STATUS = { PENDING: 'pending', IN_TRANSIT: 'in_transit', DELIVERED: 'delivered' }
const initialState = { byId: Object.fromEntries(mockParcels.map((parcel) => [parcel.id, parcel])) }

const parcelsSlice = createSlice({
  name: 'parcels',
  initialState,
  reducers: {
    createParcel: {
      reducer(state, action) { state.byId[action.payload.id] = action.payload },
      prepare({ pickupLocation, destination, weight, price, createdBy }) {
        return { payload: { id: `local-${Date.now()}`, pickupLocation, destination, weight, price, status: PARCEL_STATUS.PENDING, currentLocation: pickupLocation, dateCreated: new Date().toISOString(), createdBy } }
      },
    },
    cancelParcel: {
      reducer(state, action) {
        const parcel = state.byId[action.payload.parcelId]
        if (!parcel || parcel.status === PARCEL_STATUS.DELIVERED) return
        parcel.status = 'cancelled'
      },
      prepare(parcelId) { return { payload: { parcelId } } },
    },
    changeDestination: {
      reducer(state, action) {
        const { parcelId, newDestination } = action.payload
        const parcel = state.byId[parcelId]
        if (!parcel || parcel.status === PARCEL_STATUS.DELIVERED) return
        parcel.destination = newDestination
      },
      prepare(parcelId, newDestination) { return { payload: { parcelId, newDestination } } },
    },
  },
})

export const { cancelParcel, changeDestination, createParcel } = parcelsSlice.actions
export const selectParcelById = (state, parcelId) => state.parcels.byId[parcelId]
export const selectAllParcels = (state) => Object.values(state.parcels.byId)
export const selectParcelsForUser = (state, user) => {
  const parcels = selectAllParcels(state)
  return user?.role === 'admin' ? parcels : parcels.filter((parcel) => parcel.createdBy === user?.id)
}
export const selectParcelForUser = (state, parcelId, user) => {
  const parcel = selectParcelById(state, parcelId)
  return user?.role === 'admin' || parcel?.createdBy === user?.id ? parcel : undefined
}

export default parcelsSlice.reducer
