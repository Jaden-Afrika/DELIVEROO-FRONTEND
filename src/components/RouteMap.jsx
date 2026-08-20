import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { geocodeAddress, getRoute, formatDuration } from './osmRouting'

const pickupIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})
const NAIROBI_CENTER = { lat: -1.286389, lng: 36.817223 }

function FitBounds({ pickupCoord, destCoord }) {
  const map = useMap()
  useEffect(() => {
    if (pickupCoord && destCoord) {
      map.fitBounds([[pickupCoord.lat, pickupCoord.lng], [destCoord.lat, destCoord.lng]], { padding: [30, 30] })
    }
  }, [pickupCoord, destCoord, map])
  return null
}

export default function RouteMap({ pickup, destination, onRouteCalculated }) {
  const [pickupCoord, setPickupCoord] = useState(null)
  const [destCoord, setDestCoord] = useState(null)
  const [durationText, setDurationText] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setPickupCoord(null)
    setDestCoord(null)
    setDurationText(null)
    setError(null)
    if (!pickup?.trim() || !destination?.trim()) return undefined

    let cancelled = false
    setLoading(true)
    ;(async () => {
      try {
        const [pickupResult, destinationResult] = await Promise.all([geocodeAddress(pickup), geocodeAddress(destination)])
        if (cancelled) return
        if (!pickupResult || !destinationResult) {
          setError("Couldn't find one of those locations - try being more specific.")
          return
        }
        setPickupCoord(pickupResult)
        setDestCoord(destinationResult)
        const route = await getRoute(pickupResult, destinationResult)
        if (cancelled) return
        if (!route) {
          setError('No driving route found between those locations.')
          return
        }
        const duration = formatDuration(route.durationMinutes)
        setDurationText(duration)
        onRouteCalculated?.({ distanceKm: route.distanceKm, durationText: duration })
      } catch {
        if (!cancelled) setError("Couldn't reach the map service. Try again in a moment.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [pickup, destination, onRouteCalculated])

  const bothPointsReady = pickupCoord && destCoord
  const center = bothPointsReady ? pickupCoord : NAIROBI_CENTER

  return <div className="overflow-hidden border border-slate-200"><div className="h-56"><MapContainer center={[center.lat, center.lng]} zoom={bothPointsReady ? 12 : 11} style={{ width: '100%', height: '100%' }} scrollWheelZoom={false}><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />{pickupCoord && <Marker position={[pickupCoord.lat, pickupCoord.lng]} icon={pickupIcon} />}{destCoord && <Marker position={[destCoord.lat, destCoord.lng]} icon={pickupIcon} />}{bothPointsReady && <Polyline positions={[[pickupCoord.lat, pickupCoord.lng], [destCoord.lat, destCoord.lng]]} pathOptions={{ color: '#F5A524', weight: 4 }} />}<FitBounds pickupCoord={pickupCoord} destCoord={destCoord} /></MapContainer></div>{loading && <p className="border-t border-slate-200 px-3 py-2 text-xs text-fog">Calculating route...</p>}{error && <p className="border-t border-red-100 bg-red-50 px-3 py-2 text-xs text-caution">{error}</p>}{!loading && !error && durationText && <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs"><span className="text-fog">Estimated travel time</span><span className="font-medium text-ink">{durationText}</span></div>}</div>
}
