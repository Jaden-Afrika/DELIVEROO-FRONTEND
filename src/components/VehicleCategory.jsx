import { getVehicleCategory, getVehicleCategoryByValue } from '../utils/vehicleCategory'

export default function VehicleCategory({ category, weight, className = '' }) {
  const vehicle = getVehicleCategoryByValue(category) ?? getVehicleCategory(weight)
  if (!vehicle) return null

  return (
    <span className={`inline-flex items-center gap-1 ${className}`.trim()}>
      <span aria-hidden="true">{vehicle.icon}</span>
      <span>{vehicle.label}</span>
    </span>
  )
}
