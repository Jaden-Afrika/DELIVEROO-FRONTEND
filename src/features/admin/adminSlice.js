import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchAllParcels, updateParcelStatus, updateParcelLocation } from './adminAPI'

export const loadAllParcels = createAsyncThunk('admin/loadAllParcels', async (_, { rejectWithValue }) => {
  try { return await fetchAllParcels() } catch (error) { return rejectWithValue(error.response?.data?.message || 'Could not load parcels.') }
})
export const changeParcelStatus = createAsyncThunk('admin/changeParcelStatus', async ({ id, status }, { rejectWithValue }) => {
  try { return await updateParcelStatus(id, status) } catch (error) { return rejectWithValue(error.response?.data?.message || 'Could not update status.') }
})
export const changeParcelLocation = createAsyncThunk('admin/changeParcelLocation', async ({ id, currentLocation }, { rejectWithValue }) => {
  try { return await updateParcelLocation(id, currentLocation) } catch (error) { return rejectWithValue(error.response?.data?.message || 'Could not update location.') }
})

const adminSlice = createSlice({
  name: 'admin',
  initialState: { items: [], listStatus: 'idle', listError: null, savingId: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadAllParcels.pending, (state) => { state.listStatus = 'loading'; state.listError = null })
      .addCase(loadAllParcels.fulfilled, (state, action) => { state.listStatus = 'succeeded'; state.items = action.payload })
      .addCase(loadAllParcels.rejected, (state, action) => { state.listStatus = 'failed'; state.listError = action.payload })
      .addCase(changeParcelStatus.pending, (state, action) => { state.savingId = action.meta.arg.id })
      .addCase(changeParcelStatus.fulfilled, updateItem)
      .addCase(changeParcelStatus.rejected, (state) => { state.savingId = null })
      .addCase(changeParcelLocation.pending, (state, action) => { state.savingId = action.meta.arg.id })
      .addCase(changeParcelLocation.fulfilled, updateItem)
      .addCase(changeParcelLocation.rejected, (state) => { state.savingId = null })
  },
})

function updateItem(state, action) {
  state.savingId = null
  const index = state.items.findIndex((parcel) => parcel.id === action.payload.id)
  if (index !== -1) state.items[index] = action.payload
}

export default adminSlice.reducer
