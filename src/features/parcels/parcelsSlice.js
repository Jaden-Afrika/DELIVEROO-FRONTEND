import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { cancelParcel as cancelParcelRequest, createParcel as createParcelRequest, fetchMyParcels, fetchParcel, updateParcelDestination } from './parcelsAPI'
import { getVehicleCategory } from '../../utils/vehicleCategory'

export const PARCEL_STATUS = { PENDING: 'pending', IN_TRANSIT: 'in_transit', DELIVERED: 'delivered', CANCELLED: 'cancelled' }
const initialState = { byId: {}, listStatus: 'idle', listError: null, createStatus: 'idle', createError: null, cancellingId: null, destinationUpdateStatus: 'idle', destinationUpdateError: null, destinationUpdatingId: null, detailStatus: 'idle', detailError: null }

export const loadMyParcels = createAsyncThunk('parcels/loadMyParcels', async (_, { rejectWithValue }) => {
  try { return await fetchMyParcels() } catch (error) { return rejectWithValue(error.response?.data?.message || 'Could not load your orders.') }
})
export const loadParcel = createAsyncThunk('parcels/loadParcel', async (id, { rejectWithValue }) => {
  try { return await fetchParcel(id) } catch (error) { return rejectWithValue(error.response?.data?.message || error.response?.data?.error?.message || error.message || 'Could not load this parcel.') }
})

export const submitParcel = createAsyncThunk('parcels/submitParcel', async (payload, { rejectWithValue }) => {
  const vehicle = getVehicleCategory(payload.weight)
  if (!vehicle) return rejectWithValue('A valid parcel weight is required.')
  const weight = Number(payload.weight)
  try { return await createParcelRequest({ ...payload, weight, vehicle_category: vehicle.value }) } catch (error) { return rejectWithValue(error.response?.data?.message || 'Could not create this order.') }
})
export const cancelOrder = createAsyncThunk('parcels/cancelOrder', async (id, { rejectWithValue }) => {
  try { return await cancelParcelRequest(id) } catch (error) { return rejectWithValue(error.response?.data?.message || 'Could not cancel this order.') }
})
export const updateDestination = createAsyncThunk('parcels/updateDestination', async ({ id, destination }, { rejectWithValue }) => {
  try { return await updateParcelDestination(id, destination) } catch (error) { return rejectWithValue(error.response?.data?.message || error.response?.data?.error || error.message || 'Could not update the destination.') }
})

const parcelsSlice = createSlice({
  name: 'parcels',
  initialState,
  reducers: {
    createParcel: {
      reducer(state, action) { state.byId[action.payload.id] = action.payload },
      prepare({ pickupLocation, destination, weight, price, createdBy }) {
        const numericWeight = Number(weight)
        return { payload: { id: `local-${Date.now()}`, pickupLocation, destination, weight: numericWeight, vehicle_category: getVehicleCategory(numericWeight)?.value, price, status: PARCEL_STATUS.PENDING, currentLocation: pickupLocation, dateCreated: new Date().toISOString(), createdBy } }
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
  extraReducers: (builder) => {
    builder
      .addCase(loadMyParcels.pending, (state) => { state.listStatus = 'loading'; state.listError = null })
      .addCase(loadMyParcels.fulfilled, (state, action) => { state.listStatus = 'succeeded'; state.byId = Object.fromEntries(action.payload.map((parcel) => [parcel.id, parcel])) })
      .addCase(loadMyParcels.rejected, (state, action) => { state.listStatus = 'failed'; state.listError = action.payload })
      .addCase(loadParcel.pending, (state) => { state.detailStatus = 'loading'; state.detailError = null })
      .addCase(loadParcel.fulfilled, (state, action) => { state.detailStatus = 'succeeded'; state.detailError = null; state.byId[action.payload.id] = action.payload })
      .addCase(loadParcel.rejected, (state, action) => { state.detailStatus = 'failed'; state.detailError = action.payload })
      .addCase(submitParcel.pending, (state) => { state.createStatus = 'loading'; state.createError = null })
      .addCase(submitParcel.fulfilled, (state, action) => { state.createStatus = 'succeeded'; state.byId[action.payload.id] = action.payload })
      .addCase(submitParcel.rejected, (state, action) => { state.createStatus = 'failed'; state.createError = action.payload })
      .addCase(cancelOrder.pending, (state, action) => { state.cancellingId = action.meta.arg })
      .addCase(cancelOrder.fulfilled, (state, action) => { state.cancellingId = null; state.byId[action.payload.id] = action.payload })
      .addCase(cancelOrder.rejected, (state) => { state.cancellingId = null })
      .addCase(updateDestination.pending, (state, action) => { state.destinationUpdateStatus = 'loading'; state.destinationUpdateError = null; state.destinationUpdatingId = action.meta.arg.id })
      .addCase(updateDestination.fulfilled, (state, action) => { state.destinationUpdateStatus = 'succeeded'; state.destinationUpdateError = null; state.destinationUpdatingId = null; state.byId[action.payload.id] = action.payload })
      .addCase(updateDestination.rejected, (state, action) => { state.destinationUpdateStatus = 'failed'; state.destinationUpdateError = action.payload; state.destinationUpdatingId = null })
  },
})

export const { cancelParcel, changeDestination, createParcel } = parcelsSlice.actions
export const selectParcelById = (state, parcelId) => state.parcels.byId[parcelId]
export const selectAllParcels = (state) => Object.values(state.parcels.byId)
export const selectParcelsForUser = (state) => selectAllParcels(state)
export const selectParcelForUser = (state, parcelId) => {
  const parcel = selectParcelById(state, parcelId)
  return parcel
}

export default parcelsSlice.reducer
