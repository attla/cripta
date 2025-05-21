import { createHash } from 'crypto'

type HashAlgorithm = 'md5' | 'sha1' | 'sha256' | 'sha512'
type BinaryToTextEncoding = 'base64' | 'base64url' | 'hex' | 'binary' | null
type Encoding = BinaryToTextEncoding | 'buffer'

function hash(
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
  return hash(str, 'md5', encoding)
}

export function sha1(str: string): string
export function sha1(str: Buffer): Buffer
export function sha1(str: Buffer, encoding: 'buffer'): Buffer
export function sha1(str: string, encoding: 'buffer' | null | undefined): Buffer
export function sha1(str: string, encoding: Encoding): string
export function sha1(str: string | Buffer, encoding: Encoding = 'hex') {
  return hash(str, 'sha1', encoding)
}

export function sha256(str: string): string
export function sha256(str: Buffer): Buffer
export function sha256(str: Buffer, encoding: 'buffer'): Buffer
export function sha256(str: string, encoding: 'buffer' | null | undefined): Buffer
export function sha256(str: string, encoding: Encoding): string
export function sha256(str: string | Buffer, encoding: Encoding = 'hex') {
  return hash(str, 'sha256', encoding)
}

export function sha512(str: string): string
export function sha512(str: Buffer): Buffer
export function sha512(str: Buffer, encoding: 'buffer'): Buffer
export function sha512(str: string, encoding: 'buffer' | null | undefined): Buffer
export function sha512(str: string, encoding: Encoding): string
export function sha512(str: string | Buffer, encoding: Encoding = 'hex') {
  return hash(str, 'sha512', encoding)
}
