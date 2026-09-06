import crypto from 'node:crypto'

const encoder = new TextEncoder()
const dencoder = new TextDecoder()
// const encoder = new TextEncoder('utf-8')
// const dencoder = new TextDecoder('utf-8', { fatal: false })// new TextDecoder('utf-8', { ignoreBOM: true })

export function toBytes(val: string) {
  return encoder.encode(val) as Uint8Array
}
export function toString2(val: Uint8Array) {
  return dencoder.decode(val)
}
export function toString(val: Uint8Array) {
  // for (let i = 0; i < val.length; i++)
  //  val[i] = ''.charCodeAt.apply(null, val[i])
  // return new TextDecoder().decode(val)
  return String.fromCharCode.apply(null, val as unknown as number[])
  // return new TextDecoder('utf-8', { ignoreBOM: true }).decode(val)
}

export function randBytes(size: number) {
  return crypto.getRandomValues(new Uint8Array(size))
  // const bytes = new Uint8Array(size)
  // crypto.getRandomValues(bytes)
  // return bytes
}

export function randBetween(min: number, max: number) {
  min = Math.ceil(min)
  return Math.floor(Math.random() * (Math.floor(max) - min + 1)) + min
}

const HEX = '0123456789abcdef'
export function bytesToHex(buffer: Uint8Array): string {
  const bytes = new Uint8Array(buffer)
  const hex = new Array<string>(bytes.length * 2)

  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i]

    hex[i * 2] = HEX[byte >>> 4]
    hex[i * 2 + 1] = HEX[byte & 0x0f]
  }

  return hex.join('')
}

export function baseEncode(data: Uint8Array) {
  // const bytes = encoder.encode(data)
  let binary = ''
  for (const byte of data)
    binary += String.fromCharCode(byte)

  return btoa(binary).replace(/[=+/]/g, char => {
    switch (char) {
      case '=': return ''
      case '+': return '-'
      case '/': return '_'
      default: return char
    }
  })
}

const PADDING_CACHE = ['', '===', '==', '=']
export function baseDecode(data: string) {
  const remainder = data.length % 4
  if (remainder)
    data += PADDING_CACHE[remainder]

  const binary = atob(data.replace(/[-_]/g, (char) => char === '-' ? '+' : '/'))

  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++)
    bytes[i] = binary.charCodeAt(i)

  return bytes
}


const sortedCache: Record<string, any> = {}
export function sortBySeed<T extends string | string[]>(data: T, seed: number | string | null = null): T {
  if (!seed) return data

  const numericSeed = typeof seed === 'string' ? hashStringToNumber(seed) : seed

  const dataString = Array.isArray(data) ? JSON.stringify(data) : data as string
  const key = `${hashStringToNumber(dataString)}-${numericSeed}`

  if (sortedCache[key])
    return sortedCache[key] as T

  const isArray = Array.isArray(data)
  const items = isArray ? [...data] : splitUnicodeString(data)

  const rng = createSeededRNG(numericSeed)
  const randomized = items
      .map((item, index) => ({ item, sortKey: rng() }))
      .sort((a, b) => a.sortKey - b.sortKey)
      .map(x => x.item)

  const result = (isArray ? randomized : randomized.join('')) as T
  sortedCache[key] = result
  return result
}

export function splitUnicodeString(str: string): string[] {
  return str.split(/(?!^)(?=.)/u).filter(Boolean)
}

export function createSeededRNG(seed: number): () => number {
  return function() {
    seed |= 0
    seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

export function hashStringToNumber(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++)
    hash = (hash * 33) ^ str.charCodeAt(i)

  return hash >>> 0
}


export function randObject(obj: Record<string, any>): Record<string, any> {
  const keys = Object.keys(obj)

  for (let i = keys.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0
    ;[keys[i], keys[j]] = [keys[j], keys[i]]
  }

  const out: Record<string, any> = {}
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i]
    out[k] = obj[k]
  }

  return out
}

// function randBytes(len: number): Buffer {
//   return typeof randomBytes === 'function' ? randomBytes(len) : randBytesFallback(len)
// }
// function randBytesFallback(len: number): Buffer {
//   const bytes = Buffer.alloc(len)
//   for (let i = 0; i < len; i++)
//     bytes[i] = Math.floor(Math.random() * 256) & 0xFF

//   return bytes
// }

