import { Envir, toInt } from 't0n'
import { sha256 } from './hash'
import { baseDecode, baseEncode, randBytes, sortBySeed, toBytes, toString, toString2 } from './utils'

export type AcceptedValue = null | boolean | string | number | bigint | Array<any> | object | Symbol | undefined

export type Options = {
  key?: string,
  entropy?: number,
  seed?: number,
}

export type Config = {
  entropy: number,
  key: Uint8Array,
  alphabet?: string,
}

const sep = '\x1f'
const baseAlphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_'

const TYPE = {
  null: 0,
  boolean: 1,
  string: 2,
  int: 3,
  float: 4,
  bigint: 5,
  array: 6,
  object: 7,
  symbol: 8,
  undefined: 9,
  // function: 10,
  // number: 11,
}

export function isInvalid(id: unknown) {
  return typeof id !== 'string' || !id || /[^A-Za-z0-9._-]/.test(id)
}
export function isValid(id: unknown) {
  return !isInvalid(id)
}

const configCache = new WeakMap<object, Config>()
export async function config(opts: Options) {
  if (configCache.has(opts))
    return configCache.get(opts)!

  let key = opts?.key || Envir.get<string>('APP_KEY') || Envir.get<string>('KEY')
  if (typeof key !== 'string' || !key)
    throw new Error('Secret key is required for use cripta.')

  const conf = {
    key: await sha256(key),
    alphabet: opts?.seed ? sortBySeed(baseAlphabet, toInt(opts.seed)) : undefined,
    entropy: opts.entropy ? toInt(opts.entropy) : (opts.entropy === 0 ? 0 : 4),
  }
  configCache.set(opts, conf)
  return conf
}

export async function encode(data: AcceptedValue, config: Config): Promise<string> {
  const eLength = config.entropy
  const entropy = eLength ? randBytes(eLength) : undefined
  const payload = cipher(toBytes(toText(data)), await forgeKey(config.key, entropy))

  return maybeUseAlphabet(baseEncode(entropy ? new Uint8Array([
    ...payload,
    ...entropy
  ]) : payload), baseAlphabet, config.alphabet)
}

export async function decode<T = AcceptedValue>(data: string, config: Config): Promise<T> {
  const combined = baseDecode(maybeUseAlphabet(data, config.alphabet, baseAlphabet))
  const eLength = config.entropy

  return convert(toString2(cipher(
    eLength ? combined.subarray(0, -eLength) : combined,
    await forgeKey(config.key, eLength ? combined.subarray(-eLength) : undefined)
  ))) as T
}

function convert(value: string): AcceptedValue {
  const separatorIndex = value.indexOf(sep)
  if (separatorIndex !== -1) {
    const typeStr = value.substring(0, separatorIndex)
    const typeNum = parseInt(typeStr, 10)
    const data = value.substring(separatorIndex + 1)

    switch (typeNum) {
      case TYPE.null: return null
      case TYPE.boolean: return data === 'true' || data === '1'
      case TYPE.string: return data
      case TYPE.int: return parseInt(data, 10)
      case TYPE.float: return parseFloat(data)
      case TYPE.bigint: return BigInt(data)
      case TYPE.array:
      case TYPE.object:
        try {
          return JSON.parse(data)
        } catch {
          return null
        }
      case TYPE.symbol: return Symbol.for(data)
      case TYPE.undefined: return undefined
    }
  }

  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

function toText(value: AcceptedValue): string {
  if (value === null) return `${TYPE.null}${sep}`
  if (value === undefined) return `${TYPE.undefined}${sep}`

  const type = typeof value

  if (type === 'boolean')
    return `${TYPE.boolean}${sep}${value ? '1' : '0'}`

  if (type === 'string')
    return `${TYPE.string}${sep}${value}`

  if (type === 'number')
    return `${Number.isInteger(value) ? TYPE.int : TYPE.float}${sep}${value}`

  if (type === 'bigint')
    return `${TYPE.bigint}${sep}${value.toString()}`

  if (type === 'symbol')
    // @ts-ignore
    return `${TYPE.symbol}${sep}${Symbol.keyFor(value) ?? value.toString()}`

  if (Array.isArray(value))
    return `${TYPE.array}${sep}${JSON.stringify(value)}`

  if (type === 'object')
    return `${TYPE.object}${sep}${JSON.stringify(value)}`

  return ''
}

function cipher(data: Uint8Array, key: Uint8Array) {
  const result = new Uint8Array(data.length)
  const keyLength = key.length

  for (let i = 0; i < data.length; i++)
    result[i] = data[i] ^ key[i % keyLength]

  return result
}

function maybeUseAlphabet(data: string, from?: string, to?: string) {
  if (!data || !from || !to || from === to)
    return data

  return strtr(data, from, to)
}

function strtr(str: string, from: string, to: string) {
  let result = ''
  for (let i = 0; i < str.length; i++) {
    const char = str[i]
    const index = from.indexOf(char)
    result += index !== -1 && index < to.length ? to[index] : char
  }
  return result
}

async function forgeKey(key: Uint8Array, entropy?: Uint8Array) {
  return sha256(entropy ? new Uint8Array([...key, ...entropy]) : key)
}
