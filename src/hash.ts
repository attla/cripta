import { createHash, randomBytes } from 'node:crypto'

type HashAlgorithm = 'md5' | 'sha1' | 'sha256' | 'sha512'
type BinaryToTextEncoding = 'base64' | 'base64url' | 'hex' | 'binary' | null
type Encoding = BinaryToTextEncoding | 'buffer'

function create(
  data: string | Buffer,
  algorithm: HashAlgorithm,
  encoding?: Encoding | 'buffer'
): string | Buffer {
  const hash = createHash(algorithm)
  typeof data === 'string' ? hash.update(data, 'utf8') : hash.update(data)
  return !encoding || encoding === 'buffer' ? hash.digest() : hash.digest(encoding)
}

export function md5(str: string): string
export function md5(str: Buffer): Buffer
export function md5(str: Buffer, encoding: 'buffer'): Buffer
export function md5(str: string, encoding: 'buffer' | null | undefined): Buffer
export function md5(str: string, encoding: Encoding): string
export function md5(str: string | Buffer, encoding: Encoding = 'hex') {
  return create(str, 'md5', encoding)
}

export function sha1(str: string): string
export function sha1(str: Buffer): Buffer
export function sha1(str: Buffer, encoding: 'buffer'): Buffer
export function sha1(str: string, encoding: 'buffer' | null | undefined): Buffer
export function sha1(str: string, encoding: Encoding): string
export function sha1(str: string | Buffer, encoding: Encoding = 'hex') {
  return create(str, 'sha1', encoding)
}

export function sha256(str: string): string
export function sha256(str: Buffer): Buffer
export function sha256(str: Buffer, encoding: 'buffer'): Buffer
export function sha256(str: string, encoding: 'buffer' | null | undefined): Buffer
export function sha256(str: string, encoding: Encoding): string
export function sha256(str: string | Buffer, encoding: Encoding = 'hex') {
  return create(str, 'sha256', encoding)
}

export function sha512(str: string): string
export function sha512(str: Buffer): Buffer
export function sha512(str: Buffer, encoding: 'buffer'): Buffer
export function sha512(str: string, encoding: 'buffer' | null | undefined): Buffer
export function sha512(str: string, encoding: Encoding): string
export function sha512(str: string | Buffer, encoding: Encoding = 'hex') {
  return create(str, 'sha512', encoding)
}

export const SALT_MAX_LEN = 16
export const SALT_MIN_LEN = 5
export const HASH_LEN = 40 // max 43

export function hash(plain: string, salt: string = '') {
  if (!plain || typeof plain !== 'string' || typeof salt !== 'string') return ''

  const length = plain.length

  if (!salt)
    salt = base(randBytes((SALT_MAX_LEN % length) || randBetween(SALT_MIN_LEN, SALT_MAX_LEN)).toString('base64'))

  const r = salt.length % 2
  const prefix = r ? salt : ''
  const suffix = r ? '' : salt

  return prefix + base(createHash('sha256').update(Buffer.from(salt + plain)).digest('base64').substring(0, HASH_LEN)) + suffix
}

export function compare(plain: string, encoded: string): boolean {
  if (!plain || !encoded || typeof plain !== 'string' || typeof encoded !== 'string')
    return false

  const salt = getSalt(encoded)
  return salt ? hash(plain, salt) === encoded : false
}

export function getSalt(str: string) {
  if (!str || typeof str !== 'string') return ''

  const r = str.length % HASH_LEN
  return r && r % 2 ? str.slice(0, r) : str.slice(-r)
}

function randBytes(len: number): Buffer {
  return typeof randomBytes === 'function' ? randomBytes(len) : randBytesFallback(len)
}
function randBytesFallback(len: number): Buffer {
  const bytes = Buffer.alloc(len)
  for (let i = 0; i < len; i++)
    bytes[i] = Math.floor(Math.random() * 256) & 0xFF

  return bytes
}

function randBetween(min: number, max: number) {
  min = Math.ceil(min)
  return Math.floor(Math.random() * (Math.floor(max) - min + 1)) + min
}

function base(data: string): string {
  return data.replace(/[=+]/g, char => {
    switch (char) {
      case '=': return ''
      case '+': return '.'
      default: return char
    }
  })
}
