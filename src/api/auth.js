import { delay } from './client'
import mockUsers from '../mocks/users'

// MOCK MODE — resolves against src/mocks/users.js.
// Real API (next week) — one-line swap per function:
//   const { data } = await client.post('/auth/login', credentials)
//   const { data } = await client.post('/auth/signup', userData)

function toSafeUser(user) {
  const safeUser = { ...user }
  delete safeUser.password
  return safeUser
}

export async function login(credentials) {
  await delay(400)
  const user = mockUsers.find(
    (u) => u.email === credentials.email && u.password === credentials.password,
  )
  if (!user) throw new Error('Invalid email or password')
  return { user: toSafeUser(user), token: `mock-token-${user.id}` }
}

export async function signup(userData) {
  await delay(400)
  if (mockUsers.some((u) => u.email === userData.email)) {
    throw new Error('An account with this email already exists')
  }
  const newUser = {
    id: `user-${mockUsers.length + 1}`,
    name: userData.name,
    email: userData.email,
    password: userData.password,
    role: 'user',
  }
  mockUsers.push(newUser)
  return { user: toSafeUser(newUser), token: `mock-token-${newUser.id}` }
}