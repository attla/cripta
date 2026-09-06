import { toBytes, toString, randBetween, randBytes } from './utils'

export type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-512'

async function digest(
  data: string | Uint8Array,
  algorithm: HashAlgorithm
) {
  return crypto.subtle.digest(
    algorithm, // @ts-ignore
    typeof data === 'string' ? toBytes(data) : data
  ) as unknown as Promise<Uint8Array>
}

export async function sha1(str: string | Uint8Array) {
  return  new Uint8Array(await digest(str, 'SHA-1'))
}

export async function sha256(str: string | Uint8Array) {
  return new Uint8Array(await digest(str, 'SHA-256'))
}

export async function sha512(str: string | Uint8Array) {
  return  new Uint8Array(await digest(str, 'SHA-512'))
}

export const SALT_MAX_LEN = 16
export const SALT_MIN_LEN = 5
export const HASH_LEN = 40 // max 43

export async function hash(plain: string, salt: string = ''): Promise<string> {
  if (!plain || typeof plain !== 'string' || typeof salt !== 'string') return ''

  const length = plain.length

  if (!salt)
    salt = base(randBytes((SALT_MAX_LEN % length) || randBetween(SALT_MIN_LEN, SALT_MAX_LEN)))

  const r = salt.length % 2
  const prefix = r ? salt : ''
  const suffix = r ? '' : salt

  // @ts-ignore
  return prefix + base(await sha256(salt + plain)).substring(0, HASH_LEN) + suffix
}

export async function compare(plain: string, encoded: string): Promise<boolean> {
  if (!plain || !encoded || typeof plain !== 'string' || typeof encoded !== 'string')
    return false

  const salt = getSalt(encoded)
  return salt ? (await hash(plain, salt)) === encoded : false
}

export function getSalt(str: string) {
  if (!str || typeof str !== 'string') return ''

  const r = str.length % HASH_LEN
  return r && r % 2 ? str.slice(0, r) : str.slice(-r)
}

function base(data: Uint8Array): string {
  return btoa(toString(data)).replace(/[=+]/g, char => {
    switch (char) {
      case '=': return ''
      case '+': return '.'
      default: return char
    }
  })
}
