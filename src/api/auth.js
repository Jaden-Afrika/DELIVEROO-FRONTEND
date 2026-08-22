import client from './client'

function apiError(error) {
  // The live API returns error bodies as { "error": "..." } (not { "message": "..." }),
  // so read both keys; otherwise every failure shows the generic fallback message.
  throw new Error(error.response?.data?.message || error.response?.data?.error || 'Unable to complete this request.')
}

export async function login(credentials) {
  try {
    const { data } = await client.post('/auth/login', credentials)
    return data
  } catch (error) {
    return apiError(error)
  }
}

export async function signup(userData) {
  try {
    const { data } = await client.post('/auth/signup', userData)
    return data
  } catch (error) {
    return apiError(error)
  }
}

export async function logout() {
  try {
    await client.post('/auth/logout')
  } catch {
    // The local token must still be removed if the server is unreachable.
  }
}
