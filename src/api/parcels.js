import { delay } from './client'
import mockParcels from '../mocks/parcels'

// MOCK MODE — resolves against src/mocks/parcels.js.
// Real API (next week) — one-line swap per function:
//   const { data } = await client.get('/parcels')
//   const { data } = await client.get(`/parcels/${id}`)

export async function getParcels() {
  await delay(300)
  return [...mockParcels]
}

export async function getParcelById(id) {
  await delay(300)
  const parcel = mockParcels.find((p) => p.id === id)
  if (!parcel) throw new Error(`Parcel ${id} not found`)
  return parcel
}