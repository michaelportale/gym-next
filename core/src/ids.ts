const MAX_MS = 2 ** 48 - 1

export function uuidv7(nowMs: number, random: Uint8Array): string {
  if (random.length !== 10) {
    throw new RangeError(`random must be exactly 10 bytes, got ${random.length}`)
  }
  if (!Number.isInteger(nowMs) || nowMs < 0 || nowMs > MAX_MS) {
    throw new RangeError(`nowMs must be an integer in 0..2^48-1, got ${nowMs}`)
  }
  const bytes = new Uint8Array(16)
  let ms = nowMs
  for (let i = 5; i >= 0; i--) {
    bytes[i] = ms % 256
    ms = Math.floor(ms / 256)
  }
  bytes.set(random, 6)
  bytes[6] = 0x70 | ((bytes[6] ?? 0) & 0x0f)
  bytes[8] = 0x80 | ((bytes[8] ?? 0) & 0x3f)
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}
