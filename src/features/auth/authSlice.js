import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { login, logout as endSession, signup } from '../../api/auth'

const storedUser = JSON.parse(localStorage.getItem('deliveroo-user') || 'null')

export const loginUser = createAsyncThunk('auth/login', login)
export const signupUser = createAsyncThunk('auth/signup', signup)
export const logoutUser = createAsyncThunk('auth/logout', endSession)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser,
    token: localStorage.getItem('deliveroo-token'),
    status: 'idle',
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      state.status = 'idle'
      localStorage.removeItem('deliveroo-user')
      localStorage.removeItem('deliveroo-token')
    },
    // Clears a stale failed status/error so /login and /signup each
    // start fresh instead of showing the previous page's error.
    clearAuthError(state) {
      state.status = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, setLoading)
      .addCase(signupUser.pending, setLoading)
      .addCase(loginUser.fulfilled, setSession)
      .addCase(signupUser.fulfilled, setSession)
      .addCase(loginUser.rejected, setError)
      .addCase(signupUser.rejected, setError)
      .addCase(logoutUser.fulfilled, clearSession)
      .addCase(logoutUser.rejected, clearSession)
  },
})

function setLoading(state) {
  state.status = 'loading'
  state.error = null
}

function setSession(state, action) {
  state.user = action.payload.user
  // The live API returns the JWT as `access_token` (not `token`); accept both
  // so the session token is no longer stored as undefined.
  state.token = action.payload.token ?? action.payload.access_token
  state.status = 'succeeded'
  localStorage.setItem('deliveroo-user', JSON.stringify(state.user))
  localStorage.setItem('deliveroo-token', state.token)
}

function setError(state, action) {
  state.status = 'failed'
  state.error = action.error.message
}

function clearSession(state) {
  state.user = null
  state.token = null
  state.status = 'idle'
  localStorage.removeItem('deliveroo-user')
  localStorage.removeItem('deliveroo-token')
}

export const { logout, clearAuthError } = authSlice.actions
export default authSlice.reducer
