export const VEHICLE_CATEGORIES = {
  BIKE: { value: 'bike', label: 'Bike', icon: '🚲' },
  CAR: { value: 'car', label: 'Car', icon: '🚗' },
  LORRY: { value: 'lorry', label: 'Lorry', icon: '🚚' },
}

/**
 * Returns the vehicle needed for a parcel weight in kilograms.
 * The upper boundary belongs to the lighter vehicle (5kg is a Bike; 50kg is a Car).
 */
export function getVehicleCategory(weightKg) {
  if (weightKg === '' || weightKg === null || weightKg === undefined) return null
  const weight = Number(weightKg)
  if (!Number.isFinite(weight) || weight < 0) return null
  if (weight <= 5) return VEHICLE_CATEGORIES.BIKE
  if (weight <= 50) return VEHICLE_CATEGORIES.CAR
  return VEHICLE_CATEGORIES.LORRY
}

export function getVehicleCategoryByValue(value) {
  return Object.values(VEHICLE_CATEGORIES).find((category) => category.value === String(value).toLowerCase()) ?? null
}
