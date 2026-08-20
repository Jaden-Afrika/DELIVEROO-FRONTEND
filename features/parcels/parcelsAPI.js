// parcelsAPI.js
// Thin wrapper around the backend endpoints for parcels.
// Assumes a shared axios instance from the project's shared api/client.js
// (attaches the auth token via an interceptor). Not included in this
// folder since it's shared scaffolding — see the full project repo.
import apiClient from "../../src/api/client";

/**
 * Weight category -> pricing.
 * baseFee: flat fee just for that weight bracket (covers handling, min charge).
 * perKmRate: added on top for every km of distance between pickup and destination.
 * This is only used for the live "estimated price" shown on the form
 * before submit. The backend should be the source of truth for the
 * final price returned on the created parcel.
 */
export const WEIGHT_CATEGORIES = [
  { value: "light", label: "Light (0 - 2kg)", baseFee: 150, perKmRate: 15 },
  { value: "medium", label: "Medium (2 - 10kg)", baseFee: 350, perKmRate: 25 },
  { value: "heavy", label: "Heavy (10kg+)", baseFee: 700, perKmRate: 40 },
];

/**
 * Estimate price from weight category + distance in km.
 * distanceKm defaults to 0 so the form can still show a base price
 * before the map has calculated a route.
 */
export function estimatePrice(weightCategory, distanceKm = 0) {
  const match = WEIGHT_CATEGORIES.find((w) => w.value === weightCategory);
  if (!match) return 0;
  const distancePortion = Math.max(distanceKm, 0) * match.perKmRate;
  return Math.round(match.baseFee + distancePortion);
}

/**
 * Create a new parcel delivery order.
 * payload: { pickupLocation, destination, weightCategory }
 */
export async function createParcel(payload) {
  const { data } = await apiClient.post("/parcels", payload);
  return data;
}

/**
 * Fetch all parcels belonging to the logged-in user.
 */
export async function fetchMyParcels() {
  const { data } = await apiClient.get("/parcels/me");
  return data;
}

/**
 * Fetch a single parcel by id (used by the details page).
 */
export async function fetchParcelById(id) {
  const { data } = await apiClient.get(`/parcels/${id}`);
  return data;
}
