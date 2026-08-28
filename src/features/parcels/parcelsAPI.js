import apiClient from '../../api/client'

export async function createParcel(payload) { const { data } = await apiClient.post('/parcels', payload); return data }
export async function fetchMyParcels() { const { data } = await apiClient.get('/parcels/me'); return data }
export async function cancelParcel(id) { const { data } = await apiClient.patch(`/parcels/${id}/cancel`); return data }
export async function updateDestination(id, destination) { const { data } = await apiClient.patch(`/parcels/${id}/destination`, { destination }); return data }
