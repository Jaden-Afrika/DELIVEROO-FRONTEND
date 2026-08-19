import { createSlice } from '@reduxjs/toolkit'
import mockParcels from '../../mocks/parcels'

// Status values are lowercase/snake so they're safe to use as CSS class
// suffixes (see StatusBadge). Display labels are handled separately.
export const PARCEL_STATUS = {
  PENDING: 'pending',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
}

// Initial data is loaded from the mock layer (src/mocks/parcels.js),
// which matches the shape the Flask API will return. Once the backend
// exists, replace this import with a fetchParcels thunk that calls
// src/api/parcels.js — the reducers below stay the same.
const initialState = {
  // Keyed by id so lookups/updates in reducers are O(1).
  byId: Object.fromEntries(mockParcels.map((parcel) => [parcel.id, parcel])),
}

const parcelsSlice = createSlice({
  name: 'parcels',
  initialState,
  reducers: {
    // Cancelling only makes sense before delivery. The guard lives here
    // (not just in the UI) so the rule holds no matter what triggers it.
    cancelParcel: {
      reducer(state, action) {
        const parcel = state.byId[action.payload.parcelId]
        if (!parcel) return
        if (parcel.status === PARCEL_STATUS.DELIVERED) return
        parcel.status = 'cancelled'
      },
      prepare(parcelId) {
        return { payload: { parcelId } }
      },
    },
    changeDestination: {
      reducer(state, action) {
        const { parcelId, newDestination } = action.payload
        const parcel = state.byId[parcelId]
        if (!parcel) return
        if (parcel.status === PARCEL_STATUS.DELIVERED) return
        parcel.destination = newDestination
      },
      prepare(parcelId, newDestination) {
        return { payload: { parcelId, newDestination } }
      },
    },
  },
})

export const { cancelParcel, changeDestination } = parcelsSlice.actions

export const selectParcelById = (state, parcelId) => state.parcels.byId[parcelId]
export const selectAllParcels = (state) => Object.values(state.parcels.byId)

export default parcelsSlice.reducer