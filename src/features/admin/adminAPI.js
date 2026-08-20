import apiClient from '../../api/client'

export async function fetchAllParcels() {
  const { data } = await apiClient.get('/admin/parcels')
  return data
}

export async function updateParcelStatus(id, status) {
  const { data } = await apiClient.patch(`/admin/parcels/${id}/status`, { status })
  return data
}

export async function updateParcelLocation(id, currentLocation) {
  const { data } = await apiClient.patch(`/admin/parcels/${id}/location`, { currentLocation })
  return data
}
