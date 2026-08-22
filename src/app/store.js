import { configureStore } from '@reduxjs/toolkit'
import parcelsReducer from '../features/parcels/parcelsSlice'
import adminReducer from '../features/admin/adminSlice'
import authReducer from '../features/auth/authSlice'

export const store = configureStore({
  reducer: {
    parcels: parcelsReducer,
    admin: adminReducer,
    auth: authReducer,
  },
})