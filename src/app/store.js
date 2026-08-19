import { configureStore } from '@reduxjs/toolkit'
import parcelsReducer from '../features/parcels/parcelsSlice'

export const store = configureStore({
  reducer: {
    parcels: parcelsReducer,
    // teammates: add auth, admin slices here as they're built
  },
})