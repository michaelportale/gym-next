import { describe, expect, it } from 'vitest'
import { uuidv7 } from './ids.ts'

const bytes = (...values: number[]) => Uint8Array.from(values)
const ZERO = new Uint8Array(10)

describe('uuidv7', () => {
  it('matches a hand-derived vector', () => {
    // nowMs = 0x017F22E279B0           -> 48-bit timestamp "017f22e2-79b0"
    // random = 00 01 02 03 04 05 06 07 08 09
    // byte 6 = 0x70 | (0x00 & 0x0f)    = 0x70
    // byte 7 = 0x01                    -> third group "7001" (version 7, rand_a = 0x001)
    // byte 8 = 0x80 | (0x02 & 0x3f)    = 0x82 (variant 10)
    // byte 9 = 0x03                    -> fourth group "8203"
    // bytes 10..15 = 04 05 06 07 08 09 -> "040506070809"
    const id = uuidv7(0x017f22e279b0, bytes(0, 1, 2, 3, 4, 5, 6, 7, 8, 9))
    expect(id).toBe('017f22e2-79b0-7001-8203-040506070809')
  })

  it('sets version 7 and an RFC variant regardless of random bytes', () => {
    for (const fill of [0x00, 0xff, 0xa5]) {
      const id = uuidv7(1_700_000_000_000, new Uint8Array(10).fill(fill))
      expect(id[14]).toBe('7')
      expect('89ab').toContain(id[19] ?? '')
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    }
  })

  it('encodes the maximum timestamp', () => {
    expect(uuidv7(2 ** 48 - 1, ZERO).startsWith('ffffffff-ffff-7')).toBe(true)
    expect(uuidv7(0, ZERO).startsWith('00000000-0000-7')).toBe(true)
  })

  it('sorts lexicographically in time order', () => {
    const times = [0, 1, 255, 256, 65_536, 1_700_000_000_000, 1_700_000_000_001, 2 ** 48 - 1]
    const ids = times.map((t) => uuidv7(t, new Uint8Array(10).fill(0xff)))
    expect([...ids].sort()).toEqual(ids)
  })

  it('rejects a wrong random length', () => {
    expect(() => uuidv7(0, new Uint8Array(9))).toThrow(RangeError)
    expect(() => uuidv7(0, new Uint8Array(11))).toThrow(RangeError)
  })

  it('rejects invalid timestamps', () => {
    expect(() => uuidv7(-1, ZERO)).toThrow(RangeError)
    expect(() => uuidv7(1.5, ZERO)).toThrow(RangeError)
    expect(() => uuidv7(2 ** 48, ZERO)).toThrow(RangeError)
    expect(() => uuidv7(Number.NaN, ZERO)).toThrow(RangeError)
  })
})
