import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { login, logout as endSession, signup } from '../../api/auth'

const storedUser = JSON.parse(localStorage.getItem('parcelpilot-user') || 'null')

export const loginUser = createAsyncThunk('auth/login', login)
export const signupUser = createAsyncThunk('auth/signup', signup)
export const logoutUser = createAsyncThunk('auth/logout', endSession)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser,
    token: localStorage.getItem('parcelpilot-token'),
    status: 'idle',
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      state.status = 'idle'
      localStorage.removeItem('parcelpilot-user')
      localStorage.removeItem('parcelpilot-token')
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
  state.token = action.payload.token
  state.status = 'succeeded'
  localStorage.setItem('parcelpilot-user', JSON.stringify(state.user))
  localStorage.setItem('parcelpilot-token', state.token)
}

function setError(state, action) {
  state.status = 'failed'
  state.error = action.error.message
}

function clearSession(state) {
  state.user = null
  state.token = null
  state.status = 'idle'
  localStorage.removeItem('parcelpilot-user')
  localStorage.removeItem('parcelpilot-token')
}

export const { logout } = authSlice.actions
export default authSlice.reducer
