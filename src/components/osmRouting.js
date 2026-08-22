// Free, key-free geocoding and routing using OpenStreetMap public services.
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving'
const USER_AGENT = 'Deliveroo-School-Project'

export async function geocodeAddress(address) {
  const url = `${NOMINATIM_URL}?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=ke`
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!response.ok) throw new Error('Geocoding request failed.')
  const results = await response.json()
  if (!results.length) return null
  return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) }
}

export async function getRoute(origin, destination) {
  const url = `${OSRM_URL}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=false`
  const response = await fetch(url)
  if (!response.ok) throw new Error('Routing request failed.')
  const data = await response.json()
  if (data.code !== 'Ok' || !data.routes?.length) return null
  const route = data.routes[0]
  return { distanceKm: route.distance / 1000, durationMinutes: Math.round(route.duration / 60) }
}

export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`
}
