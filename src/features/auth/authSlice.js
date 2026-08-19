import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { login, signup } from '../../api/auth'

// MOCK MODE — auth endpoints resolve against src/mocks/users.js via the
// api layer. Swapping to the real Flask API is a one-line change per
// function inside src/api/auth.js, nothing here changes.
export const loginUser = createAsyncThunk('auth/loginUser', async (credentials) =>
  login(credentials),
)
export const signupUser = createAsyncThunk('auth/signupUser', async (userData) =>
  signup(userData),
)

const initialState = {
  currentUser: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.currentUser = null
      state.token = null
      state.isAuthenticated = false
      state.loading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.currentUser = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Login failed'
      })
      .addCase(signupUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false
        state.currentUser = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Signup failed'
      })
  },
})

export const { logout } = authSlice.actions

export const selectCurrentUser = (state) => state.auth.currentUser
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectAuthLoading = (state) => state.auth.loading
export const selectAuthError = (state) => state.auth.error

export default authSlice.reducer