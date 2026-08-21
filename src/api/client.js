import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const client = axios.create({
  baseURL: API_URL,
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('parcelpilot-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Simulates network latency for mock endpoints so loading states
// behave like they will against the real API.
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default client
