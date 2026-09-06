import { config, encode, decode } from './cripta'
import type { Config, AcceptedValue } from './cripta'
import { bytesToHex, randBytes, randObject } from './utils'
import { Timestamp } from 't0n'

export type Claims = Record<string, string | string[]> & { e?: string }
export type Token<H = Claims, B = any> = {
  valid: boolean,
  header: H,
  body: B,
  sign: string,
  // claims: Claims,
}

export { config } from './cripta'

const SEP = '.'

export async function create(opt: Config, body: AcceptedValue, claims: Claims = {}) {
  claims.e = opt.entropy ? bytesToHex(await randBytes(3)) : claims.e || bytesToHex(opt.key).substring(0, 6)
  // claims.e = bytesToHex(opt.entropy ? await randBytes(3) : opt.key).substring(0, 6)
  const header = await encode(opt.entropy ? randObject(claims) : claims, opt)
  const payload = await encode(body, opt)
  return [
    header,
    payload,
    await hash(header, payload, claims.e as string),
  ].join(SEP)
}

export async function parse(opt: Config, data: string, claims: Claims = {}): Promise<Token> {
  if (!data) return token()
  const parts = data.split(SEP)
  if (parts.length !== 3) return token()

  const header = await decode<Claims>(parts[0], opt)
  if (!header || !header.e) return token()

  return token(
    !!parts[2] && (await hash(parts[0], parts[1], header.e!)) === parts[2] && validateClaims(header, claims),
    header as Claims,
    await decode(parts[1], opt),
    parts[2]
  )
}

async function hash(header: string, payload: string, e: string) {
  return (await encode(header + payload, await config({ key: e, entropy: 0 }))).substring(0, 16)
}

function token(
  valid: boolean = false,
  header: Claims = {},
  body: any = undefined,
  sign: string = ''
): Token {
  return { valid, header, body, sign }
}

function after(claim: number, expected?: number) {
  expected ??= Math.floor(Date.now() / 1000)
  return Timestamp.timestamp(claim) >= Timestamp.timestamp(expected)
}

function before(claim: number, expected?: number) {
  expected ??= Math.floor(Date.now() / 1000)
  return Timestamp.timestamp(claim) <= Timestamp.timestamp(expected)
}

const internal = {
  exp: after,
  nbf: before,
  iat: before,
}
function validateClaims(header: Claims, claims: Claims) {
  const { e, ...rules } = header
  for (let key in rules) {
    const isInternal = key in internal
    if (!isInternal && !(key in claims)) return false

    let claim = rules[key]
    claim = isInternal || Array.isArray(claim) ? claim : [claim]
    const expected = claims[key] // || body?[key]

    const result = isInternal // @ts-ignore
      ? internal[key](claim, expected)
      : (Array.isArray(expected) ? expected.every(e => claim.includes(e)) : claim.includes(expected))

    if (!result) return false
  }

  return true
}
