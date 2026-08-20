// parcelsAPI.js
// Thin wrapper around the backend endpoints for parcels.
// Assumes a shared axios instance from the project's shared api/client.js
// (attaches the auth token via an interceptor). Not included in this
// folder since it's shared scaffolding — see the full project repo.
import apiClient from "../../api/client";

/**
 * Weight category -> flat quote pricing.
 * This is only used for the live "estimated price" shown on the form
 * before submit. The backend should be the source of truth for the
 * final price returned on the created parcel.
 */
export const WEIGHT_CATEGORIES = [
  { value: "light", label: "Light (0 - 2kg)", basePrice: 300 },
  { value: "medium", label: "Medium (2 - 10kg)", basePrice: 700 },
  { value: "heavy", label: "Heavy (10kg+)", basePrice: 1500 },
];

export function estimatePrice(weightCategory) {
  const match = WEIGHT_CATEGORIES.find((w) => w.value === weightCategory);
  return match ? match.basePrice : 0;
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
