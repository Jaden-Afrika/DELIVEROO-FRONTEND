import { configureStore } from '@reduxjs/toolkit'
import authReducer, {
  loginUser,
  signupUser,
  logout,
} from './authSlice'

// Mock the api layer so tests never touch import.meta/VITE_ env vars.
jest.mock('../../api/auth', () => ({
  login: jest.fn(),
  signup: jest.fn(),
}))

import { login, signup } from '../../api/auth'

function setupStore() {
  return configureStore({ reducer: { auth: authReducer } })
}

describe('authSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    login.mockResolvedValue({
      user: { id: 'user-1', name: 'Nesh', email: 'nesh@sendit.com', role: 'user' },
      token: 'mock-token-user-1',
    })
    signup.mockResolvedValue({
      user: { id: 'user-4', name: 'New', email: 'new@sendit.com', role: 'user' },
      token: 'mock-token-user-4',
    })
  })

  it('starts logged out', () => {
    const state = setupStore().getState().auth
    expect(state.isAuthenticated).toBe(false)
    expect(state.currentUser).toBeNull()
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('sets the user and token on successful login', async () => {
    const store = setupStore()
    await store.dispatch(loginUser({ email: 'nesh@sendit.com', password: 'password123' }))
    const { auth } = store.getState()
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.currentUser.id).toBe('user-1')
    expect(auth.token).toBe('mock-token-user-1')
    expect(auth.loading).toBe(false)
  })

  it('stores the error and stays logged out on failed login', async () => {
    login.mockRejectedValue(new Error('Invalid email or password'))
    const store = setupStore()
    await store.dispatch(loginUser({ email: 'wrong@sendit.com', password: 'nope' }))
    const { auth } = store.getState()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.error).toBe('Invalid email or password')
    expect(auth.loading).toBe(false)
  })

  it('sets the user on successful signup', async () => {
    const store = setupStore()
    await store.dispatch(
      signupUser({ name: 'New', email: 'new@sendit.com', password: 'password123' }),
    )
    const { auth } = store.getState()
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.currentUser.email).toBe('new@sendit.com')
    expect(auth.error).toBeNull()
  })

  it('clears everything on logout', async () => {
    const store = setupStore()
    await store.dispatch(loginUser({ email: 'nesh@sendit.com', password: 'password123' }))
    store.dispatch(logout())
    const { auth } = store.getState()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.currentUser).toBeNull()
    expect(auth.token).toBeNull()
  })
})