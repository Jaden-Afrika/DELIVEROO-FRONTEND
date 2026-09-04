import { estimatePrice } from './parcelPricing'

describe('estimatePrice', () => {
  it('scales continuously with parcel weight', () => {
    expect(estimatePrice(15, 9.3)).toBe(2243)
    expect(estimatePrice(150, 9.3)).toBe(21075)
  })

  it('returns zero for invalid weights', () => {
    expect(estimatePrice('', 9.3)).toBe(0)
    expect(estimatePrice(-1, 9.3)).toBe(0)
  })
})
