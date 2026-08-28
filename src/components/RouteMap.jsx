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

export default function RouteMap({
  pickup,
  destination,
  pickupLat,
  pickupLng,
  destinationLat,
  destinationLng,
  distanceKm,
  estimatedTravelTime,
  onRouteCalculated,
  onStatusChange,
}) {
  const [pickupCoord, setPickupCoord] = useState(null)
  const [destCoord, setDestCoord] = useState(null)
  const [routeGeometry, setRouteGeometry] = useState(null)
  const [durationText, setDurationText] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setPickupCoord(null)
    setDestCoord(null)
    setRouteGeometry(null)
    setDurationText(null)
    setError(null)
    setLoading(false)

    let cancelled = false
    const hasPickupCoordinates = pickupLat != null && pickupLng != null
    const hasDestinationCoordinates = destinationLat != null && destinationLng != null
    const pickupAddress = pickup?.trim()
    const destinationAddress = destination?.trim()
    const canResolvePickup = hasPickupCoordinates || pickupAddress
    const canResolveDestination = hasDestinationCoordinates || destinationAddress

    if (!canResolvePickup || !canResolveDestination) {
      onStatusChange?.('idle')
      return () => { cancelled = true }
    }

    ;(async () => {
      try {
        setLoading(true)
        onStatusChange?.('loading')
        // fallback: backend has no coordinates for this parcel yet
        const [pickupResult, destinationResult] = await Promise.all([
          hasPickupCoordinates ? { lat: pickupLat, lng: pickupLng } : (pickupAddress ? geocodeAddress(pickupAddress) : null),
          hasDestinationCoordinates ? { lat: destinationLat, lng: destinationLng } : (destinationAddress ? geocodeAddress(destinationAddress) : null),
        ])
        if (cancelled) return
        setPickupCoord(pickupResult)
        setDestCoord(destinationResult)

        if (!pickupResult || !destinationResult) {
          setError("Couldn't find one of those locations - try being more specific.")
          onStatusChange?.('error')
          return
        }

        const hasStoredRouteDetails = distanceKm != null || estimatedTravelTime != null
        if (hasStoredRouteDetails) {
          const duration = estimatedTravelTime != null ? formatDuration(estimatedTravelTime) : null
          setDurationText(duration)
        }

        const route = await getRoute(pickupResult, destinationResult)
        if (cancelled) return
        if (!route) {
          if (!hasStoredRouteDetails) setError('No driving route found between those locations.')
          onStatusChange?.('error')
          return
        }
        setRouteGeometry(route.geometry?.length ? route.geometry : null)
        if (!hasStoredRouteDetails) {
          const duration = formatDuration(route.durationMinutes)
          setDurationText(duration)
          onRouteCalculated?.({ distanceKm: route.distanceKm, durationText: duration })
        }
        onStatusChange?.('ready')
      } catch {
        if (!cancelled && distanceKm == null && estimatedTravelTime == null) {
          setError("Couldn't reach the map service. Try again in a moment.")
        }
        if (!cancelled) onStatusChange?.('error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [pickup, destination, pickupLat, pickupLng, destinationLat, destinationLng, distanceKm, estimatedTravelTime, onRouteCalculated, onStatusChange])

  const bothPointsReady = pickupCoord && destCoord
  const onePointReady = pickupCoord || destCoord
  const center = onePointReady || NAIROBI_CENTER
  const missingLocationMessage = pickupCoord && !destCoord
    ? 'Destination location not available for this parcel'
    : !pickupCoord && destCoord
      ? 'Pickup location not available for this parcel'
      : 'Map data not available for this parcel'

  return <div className="overflow-hidden rounded-xl border border-slate-200 bg-paper"><div className="h-56"><MapContainer center={[center.lat, center.lng]} zoom={bothPointsReady ? 12 : 11} style={{ width: '100%', height: '100%' }} scrollWheelZoom={false}><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />{pickupCoord && <Marker position={[pickupCoord.lat, pickupCoord.lng]} icon={pickupIcon} />}{destCoord && <Marker position={[destCoord.lat, destCoord.lng]} icon={pickupIcon} />}{bothPointsReady && <Polyline positions={routeGeometry && routeGeometry.length > 1 ? routeGeometry.map((point) => [point.lat, point.lng]) : [[pickupCoord.lat, pickupCoord.lng], [destCoord.lat, destCoord.lng]]} pathOptions={{ color: '#F5A524', weight: 4 }} />}<FitBounds pickupCoord={pickupCoord} destCoord={destCoord} /></MapContainer></div>{loading && <p className="border-t border-slate-200 px-3 py-2 text-xs text-fog">Calculating route...</p>}{error && <p className="border-t border-caution/30 bg-caution/10 px-3 py-2 text-xs text-caution">{error}</p>}{!loading && !error && !bothPointsReady && <p className="border-t border-slate-200 px-3 py-2 text-xs text-fog">{missingLocationMessage}</p>}{!loading && !error && bothPointsReady && (durationText || distanceKm != null) && <div className="flex items-center justify-between border-t border-slate-200 bg-paper px-3 py-2 text-xs"><span className="text-fog">{durationText ? 'Estimated travel time' : 'Route distance'}</span><span className="font-mono text-ink">{durationText || `${distanceKm} km`}</span></div>}</div>
}
