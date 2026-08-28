import { render, screen, waitFor } from '@testing-library/react'
import RouteMap from './RouteMap'
import { geocodeAddress, getRoute } from './osmRouting'

jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map">{children}</div>,
  TileLayer: () => null,
  Marker: ({ position }) => <div data-testid="marker">{position.join(',')}</div>,
  Polyline: ({ positions }) => <div data-testid="polyline">{positions.map((point) => point.join(',')).join(';')}</div>,
  useMap: () => ({ fitBounds: jest.fn() }),
}))

jest.mock('./osmRouting', () => ({
  geocodeAddress: jest.fn(),
  getRoute: jest.fn(),
  formatDuration: (minutes) => `${minutes} min`,
}))

describe('RouteMap', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('uses backend coordinates to fetch road geometry without recalculating stored metrics', async () => {
    const onRouteCalculated = jest.fn()
    getRoute.mockResolvedValue({ distanceKm: 19, durationMinutes: 50, geometry: [{ lat: -1.2676, lng: 36.8108 }, { lat: -1.3, lng: 36.76 }, { lat: -1.3197, lng: 36.7074 }] })
    render(<RouteMap pickup="Westlands" destination="Karen" pickupLat={-1.2676} pickupLng={36.8108} destinationLat={-1.3197} destinationLng={36.7074} distanceKm={18.5} estimatedTravelTime={47} onRouteCalculated={onRouteCalculated} />)

    await waitFor(() => expect(screen.getAllByTestId('marker')).toHaveLength(2))
    await waitFor(() => expect(getRoute).toHaveBeenCalledWith({ lat: -1.2676, lng: 36.8108 }, { lat: -1.3197, lng: 36.7074 }))
    expect(screen.getByTestId('polyline')).toHaveTextContent('-1.2676,36.8108;-1.3,36.76;-1.3197,36.7074')
    expect(screen.getByText('47 min')).toBeInTheDocument()
    expect(geocodeAddress).not.toHaveBeenCalled()
    expect(onRouteCalculated).not.toHaveBeenCalled()
  })

  it('falls back to geocoding when backend coordinates are absent', async () => {
    geocodeAddress.mockImplementation((address) => Promise.resolve(address === 'Westlands' ? { lat: -1.2676, lng: 36.8108 } : { lat: -1.3197, lng: 36.7074 }))
    getRoute.mockResolvedValue({ distanceKm: 18.5, durationMinutes: 47, geometry: [{ lat: -1.2676, lng: 36.8108 }, { lat: -1.3, lng: 36.76 }, { lat: -1.3197, lng: 36.7074 }] })

    render(<RouteMap pickup="Westlands" destination="Karen" pickupLat={null} pickupLng={null} destinationLat={null} destinationLng={null} />)

    await waitFor(() => expect(geocodeAddress).toHaveBeenCalledTimes(2))
    expect(geocodeAddress).toHaveBeenCalledWith('Westlands')
    expect(geocodeAddress).toHaveBeenCalledWith('Karen')
    await waitFor(() => expect(screen.getByTestId('polyline')).toHaveTextContent('-1.2676,36.8108;-1.3,36.76;-1.3197,36.7074'))
  })

  it('keeps stored details visible when OSRM finds no route', async () => {
    getRoute.mockResolvedValue(null)

    render(<RouteMap pickup="Westlands" destination="Karen" pickupLat={-1.2676} pickupLng={36.8108} destinationLat={-1.3197} destinationLng={36.7074} distanceKm={18.5} estimatedTravelTime={47} />)

    expect(await screen.findByText('47 min')).toBeInTheDocument()
    await waitFor(() => expect(getRoute).toHaveBeenCalledTimes(1))
    expect(screen.queryByText('No driving route found between those locations.')).not.toBeInTheDocument()
  })

  it('shows a map-data message when no coordinates or addresses are available', async () => {
    render(<RouteMap pickup={null} destination={null} pickupLat={null} pickupLng={null} destinationLat={null} destinationLng={null} />)

    expect(await screen.findByText('Map data not available for this parcel')).toBeInTheDocument()
    expect(geocodeAddress).not.toHaveBeenCalled()
    expect(screen.queryByTestId('marker')).not.toBeInTheDocument()
  })
})
