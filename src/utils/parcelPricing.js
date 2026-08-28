export const WEIGHT_CATEGORIES = [
  { value: 'light', label: 'Light (0 - 2kg)', baseFee: 150, perKmRate: 15 },
  { value: 'medium', label: 'Medium (2 - 10kg)', baseFee: 350, perKmRate: 25 },
  { value: 'heavy', label: 'Heavy (10kg+)', baseFee: 700, perKmRate: 40 },
]

export function estimatePrice(weightCategory, distanceKm = 0) {
  const match = WEIGHT_CATEGORIES.find((category) => category.value === weightCategory)
  if (!match) return 0
  return Math.round(match.baseFee + Math.max(distanceKm, 0) * match.perKmRate)
}
