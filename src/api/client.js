import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Axios instance for the real Flask API (next week). Mock endpoints
// (src/api/*) don't call it yet — they resolve against src/mocks/.
// Once the backend is up, add a request interceptor here that attaches
// the JWT from the auth slice (Authorization: Bearer <token>).
const client = axios.create({
  baseURL: API_URL,
})

// Simulates network latency for mock endpoints so loading states
// behave like they will against the real API.
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default client