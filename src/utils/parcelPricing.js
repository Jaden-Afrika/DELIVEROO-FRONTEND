export const WEIGHT_CATEGORIES = [
  { value: 'light', label: 'Light (0 - 2kg)', baseFee: 150, perKmRate: 15 },
  { value: 'medium', label: 'Medium (2 - 10kg)', baseFee: 350, perKmRate: 25 },
  { value: 'heavy', label: 'Heavy (10kg+)', baseFee: 700, perKmRate: 40 },
]

export function getPricingWeightCategory(weightKg) {
  if (weightKg === '' || weightKg === null || weightKg === undefined) return null
  const weight = Number(weightKg)
  if (!Number.isFinite(weight) || weight < 0) return null
  if (weight <= 2) return 'light'
  if (weight <= 10) return 'medium'
  return 'heavy'
}

export function estimatePrice(weightKg, distanceKm = 0) {
  if (weightKg === '' || weightKg === null || weightKg === undefined) return 0
  const weight = Number(weightKg)
  if (!Number.isFinite(weight) || weight < 0) return 0
  return Math.round(150 + Math.max(Number(distanceKm), 0) * 15 * weight)
}
