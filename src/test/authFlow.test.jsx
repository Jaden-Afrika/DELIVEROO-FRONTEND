import { configureStore } from '@reduxjs/toolkit'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import React from 'react'

import App from '../App'
import { signupUser } from '../features/auth/authSlice'
import authReducer from '../features/auth/authSlice'
import parcelsReducer from '../features/parcels/parcelsSlice'
import adminReducer from '../features/admin/adminSlice'
import { signup, login, logout } from '../api/auth'

// The real page components pull in leaflet / google maps, which jsdom
// cannot render; the auth flow under test only needs route stubs.
jest.mock('../pages/OrdersPage', () => () => <div>orders-page</div>)
jest.mock('../pages/ParcelDetailsPage', () => () => <div>parcel-details-page</div>)
jest.mock('../pages/AdminPanel', () => () => <div>admin-panel-page</div>)
jest.mock('../../pages/CreateDelivery', () => () => <div>create-delivery-page</div>)
jest.mock('../../pages/MyParcels', () => () => <div>my-parcels-page</div>)

jest.mock('../api/auth', () => ({
  login: jest.fn(),
  signup: jest.fn(),
  logout: jest.fn(),
}))

// client.js uses Vite's import.meta.env, which jest cannot parse; the auth
// tests mock ../api/auth above, so only the parcels/admin slices need this.
jest.mock('../api/client', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
  delay: jest.fn().mockResolvedValue(undefined),
}))

const testUser = { id: 1, name: 'Test User', email: 'test@example.com', role: 'user' }

function newStore() {
  return configureStore({
    reducer: { parcels: parcelsReducer, admin: adminReducer, auth: authReducer },
  })
}

function renderApp(route, store = newStore()) {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    </Provider>,
  )
}

async function fillAndSubmit(user, fields) {
  if (fields.name !== undefined) await user.type(screen.getByLabelText('Full name'), fields.name)
  await user.type(screen.getByLabelText('Email address'), fields.email)
  await user.type(screen.getByLabelText(/^Password$/), fields.password)
  if (fields.confirmPassword !== undefined) {
    await user.type(screen.getByLabelText('Confirm password'), fields.confirmPassword)
  }
  await user.click(screen.getByRole('button'))
}

beforeEach(() => {
  localStorage.clear()
  jest.clearAllMocks()
})

describe('signup', () => {
  it('creates a session and redirects into the app on success', async () => {
    const user = userEvent.setup()
    signup.mockResolvedValue({ access_token: 'header.payload.signature', user: testUser })
    renderApp('/signup')

    await fillAndSubmit(user, {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    })

    expect(await screen.findByText('orders-page')).toBeInTheDocument()
    expect(signup).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Test User', email: 'test@example.com' }),
      expect.anything(), // createAsyncThunk passes the thunkAPI as 2nd arg
    )
    expect(JSON.parse(localStorage.getItem('deliveroo-user'))).toMatchObject({ email: 'test@example.com' })
    expect(localStorage.getItem('deliveroo-token')).toBe('header.payload.signature')
  })

  it('shows the specific API error on duplicate email', async () => {
    const user = userEvent.setup()
    signup.mockRejectedValue(new Error('An account with this email already exists.'))
    renderApp('/signup')

    await fillAndSubmit(user, {
      name: 'Test User',
      email: 'taken@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    })

    expect(await screen.findByText('An account with this email already exists.')).toBeInTheDocument()
    expect(screen.queryByText('orders-page')).not.toBeInTheDocument()
  })
})

describe('login', () => {
  it('redirects into the app on success', async () => {
    const user = userEvent.setup()
    login.mockResolvedValue({ access_token: 'a.b.c', user: testUser })
    renderApp('/login')

    await fillAndSubmit(user, { email: 'test@example.com', password: 'password123' })

    expect(await screen.findByText('orders-page')).toBeInTheDocument()
  })

  it('shows a specific error for invalid credentials instead of the generic message', async () => {
    const user = userEvent.setup()
    login.mockRejectedValue(new Error('Invalid email or password.'))
    renderApp('/login')

    await fillAndSubmit(user, { email: 'test@example.com', password: 'wrong-password' })

    expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument()
    expect(screen.queryByText('Unable to complete this request.')).not.toBeInTheDocument()
    expect(screen.queryByText('orders-page')).not.toBeInTheDocument()
  })
})

describe('logout', () => {
  it('clears the stored session and returns to login', async () => {
    const user = userEvent.setup()
    // Establish a real session through the slice (also writes localStorage),
    // since initialState was captured at module load before any seeding.
    const store = newStore()
    store.dispatch(signupUser.fulfilled({ access_token: 'a.b.c', user: testUser }, 'reqId', {}))
    logout.mockResolvedValue(undefined)
    renderApp('/orders', store)
    expect(await screen.findByText('orders-page')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Log out' }))

    expect(await screen.findByText('Welcome back')).toBeInTheDocument()
    expect(localStorage.getItem('deliveroo-user')).toBeNull()
    expect(localStorage.getItem('deliveroo-token')).toBeNull()
    expect(logout).toHaveBeenCalled()
  })
})

describe('protected routes', () => {
  it.each(['/orders', '/admin', '/parcels/new'])('redirects anonymous users from %s to login', (route) => {
    renderApp(route)
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
  })

  it('keeps authenticated users on protected routes after a refresh', async () => {
    // Part 1 — hydration: simulate a refresh by seeding storage, then
    // re-importing ONLY the slice so its module-level localStorage read
    // runs against seeded values (no React involved).
    localStorage.setItem('deliveroo-user', JSON.stringify(testUser))
    localStorage.setItem('deliveroo-token', 'a.b.c')
    jest.resetModules()
    const freshAuth = require('../features/auth/authSlice')
    const store = configureStore({
      reducer: {
        parcels: parcelsReducer,
        admin: adminReducer,
        auth: freshAuth.default,
      },
    })
    expect(store.getState().auth.user).toMatchObject({ email: 'test@example.com' })
    expect(store.getState().auth.token).toBe('a.b.c')

    // Part 2 — routing: an authenticated store renders the protected page.
    renderApp('/orders', store)
    expect(await screen.findByText('orders-page')).toBeInTheDocument()
  })
})

describe('error state hygiene between auth pages', () => {
  function failedAuthStore() {
    const store = newStore()
    store.dispatch(signupUser.rejected(new Error('An account with this email already exists.'), 'reqId', {}))
    return store
  }

  it('does not carry a signup error over to the login page', async () => {
    const user = userEvent.setup()
    renderApp('/login', failedAuthStore())
    // Mounting the page clears stale state; submitting then shows only new errors.
    login.mockRejectedValue(new Error('Invalid email or password.'))
    await fillAndSubmit(user, { email: 'x@example.com', password: 'wrong-password' })
    expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument()
    expect(screen.queryByText('An account with this email already exists.')).not.toBeInTheDocument()
  })

  it('clears the previous page error when navigating between login and signup', async () => {
    const user = userEvent.setup()
    renderApp('/login', failedAuthStore())

    // Force an error onto the login page itself.
    login.mockRejectedValueOnce(new Error('Invalid email or password.'))
    await fillAndSubmit(user, { email: 'x@example.com', password: 'wrong-password' })
    expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument()

    await user.click(screen.getByText('Sign up'))
    await waitFor(() => expect(screen.getByLabelText('Full name')).toBeInTheDocument())
    expect(screen.queryByText('Invalid email or password.')).not.toBeInTheDocument()

    // And back again — no signup-era error lingers either.
    await user.click(screen.getByText('Log in'))
    expect(screen.queryByText('Invalid email or password.')).not.toBeInTheDocument()
  })
})
