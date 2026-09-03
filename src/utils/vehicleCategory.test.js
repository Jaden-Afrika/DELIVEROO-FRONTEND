import { getVehicleCategory } from './vehicleCategory'

describe('getVehicleCategory', () => {
  it.each([
    [0, 'bike'],
    [5, 'bike'],
    [5.1, 'car'],
    [50, 'car'],
    [50.1, 'lorry'],
  ])('maps %s kg to %s', (weight, category) => {
    expect(getVehicleCategory(weight)?.value).toBe(category)
  })

  it('returns null for an invalid weight', () => {
    expect(getVehicleCategory(-1)).toBeNull()
    expect(getVehicleCategory('')).toBeNull()
  })
})
