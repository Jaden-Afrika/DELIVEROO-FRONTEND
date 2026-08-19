import { configureStore } from '@reduxjs/toolkit'
import parcelsReducer from '../features/parcels/parcelsSlice'
import authReducer from '../features/auth/authSlice'

export const store = configureStore({
  reducer: {
    parcels: parcelsReducer,
    auth: authReducer,
    // teammates: add admin slice here as it's built
  },
})