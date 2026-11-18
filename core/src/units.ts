export type Unit = 'kg' | 'lb'

export const KG_PER_LB = 0.45359237

export function toKg(value: number, unit: Unit): number {
  return unit === 'kg' ? value : value * KG_PER_LB
}

export function fromKg(kg: number, unit: Unit): number {
  return unit === 'kg' ? kg : kg / KG_PER_LB
}

export function convert(value: number, from: Unit, to: Unit): number {
  return from === to ? value : fromKg(toKg(value, from), to)
}

export function roundToIncrement(value: number, increment: number): number {
  if (!Number.isFinite(increment) || increment <= 0) {
    throw new RangeError(`increment must be a finite number > 0, got ${increment}`)
  }
  const steps = Math.sign(value) * Math.round(Math.abs(value) / increment)
  const decimals = Math.max(0, Math.ceil(-Math.log10(increment)) + 1)
  const result = Number((steps * increment).toFixed(Math.min(decimals + 6, 100)))
  return result === 0 ? 0 : result
}
