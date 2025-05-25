import crypto from 'node:crypto'
import { Config } from './config'
import { TYPE, AcceptedValue, ConfigOptions } from './types'
import { sha256 } from 't0n'

export class Factory {
  private separator = '\x1f'
  public config: Config = new Config()
  public lastConfig: Config | null = null

  constructor(config?: ConfigOptions | Config) {
    if (config) this.setConfig(config)
  }

  public same(): this {
    this.config.entropy = 0
    return this.setConfig(this.config)
  }

  public unique(): this {
    this.config.entropy = 4
    return this.setConfig(this.config)
  }

  public setConfig(config: ConfigOptions | Config): this {
    this.config = config instanceof Config ? config : new Config(config)
    return this
  }

  public onceConfig(config: ConfigOptions | Config): this {
    if (!(config instanceof Config)) config = new Config(config)
    this.lastConfig = this.config
    this.config = Object.assign(new Config(), config)
    return this
  }

  public onceKey(secret: string): this {
    this.lastConfig = Object.assign(new Config(), this.config)
    this.config.setKey(secret)
    return this
  }

  private maybeRestoreConfig(): this {
    if (this.lastConfig !== null) {
      this.config = Object.assign(new Config(), this.lastConfig)
      this.lastConfig = null
    }
    return this
  }

  private validateConfig(): void {
    const key = this.config.key
    if (!key || !key?.byteLength || !key.length)
      throw new Error('Secret key is required for use cripta.')
  }

  public encode(data: AcceptedValue): string {
    this.validateConfig()

    const eLength = this.config.entropy
    const entropy = eLength ? crypto.randomBytes(eLength) : Buffer.alloc(0)

    const payload = Buffer.from(this.toText(data))

    const encoded = this.baseEncode(Buffer.concat([
      this.cipher(payload, this.forgeKey(entropy)),
      entropy
    ]))

    this.maybeRestoreConfig()
    return encoded
  }

  public decode(data: string): AcceptedValue {
    this.validateConfig()

    const combined = this.baseDecode(data)
    const eLength = this.config.entropy
    const entropy = eLength ? combined.subarray(-eLength) : Buffer.alloc(0)
    const ciphered = eLength ? combined.subarray(0, -eLength) : combined

    const result = this.convert(this.cipher(ciphered, this.forgeKey(entropy)).toString('utf8'))

    this.maybeRestoreConfig()
    return result
  }

  private convert(value: string): AcceptedValue {
    const separatorIndex = value.indexOf(this.separator)
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

  private toText(value: AcceptedValue): string {
    if (value === null) return `${TYPE.null}${this.separator}`
    if (value === undefined) return `${TYPE.undefined}${this.separator}`

    const type = typeof value

    if (type === 'boolean')
      return `${TYPE.boolean}${this.separator}${value ? '1' : '0'}`

    if (type === 'string')
      return `${TYPE.string}${this.separator}${value}`

    if (type === 'number')
      return `${Number.isInteger(value) ? TYPE.int : TYPE.float}${this.separator}${value}`

    if (type === 'bigint')
      return `${TYPE.bigint}${this.separator}${value.toString()}`

    if (type === 'symbol')
      // @ts-ignore
      return `${TYPE.symbol}${this.separator}${Symbol.keyFor(value) ?? value.toString()}`

    if (Array.isArray(value))
      return `${TYPE.array}${this.separator}${JSON.stringify(value)}`

    if (type === 'object')
      return `${TYPE.object}${this.separator}${JSON.stringify(value)}`

    return ''
  }

  private cipher(data: Buffer, key: Buffer): Buffer {
    const result = Buffer.allocUnsafe(data.length)
    const keyLength = key.length

    for (let i = 0; i < data.length; i++)
      result[i] = data[i] ^ key[i % keyLength]

    return result
  }

  private forgeKey(entropy: Buffer): Buffer {
    return sha256(Buffer.concat([this.config.key as Buffer, entropy]), 'buffer')
  }

  private maybeUseAlphabet(data: string, from?: string, to?: string): string {
    if (!data || typeof data !== 'string' || !from || !to || from === to)
      return data

    return this.strtr(data, from, to)
  }

  private strtr(str: string, from: string, to: string): string {
    let result = ''
    for (let i = 0; i < str.length; i++) {
      const char = str[i]
      const index = from.indexOf(char)
      result += index !== -1 && index < to.length ? to[index] : char
    }
    return result
  }

  baseEncode(data: Buffer): string {
    return this.maybeUseAlphabet(
      data.toString('base64').replace(/[=+/]/g, (char) => {
        switch (char) {
          case '=': return ''
          case '+': return '-'
          case '/': return '_'
          default: return char
        }
      }),
      // data.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_'),
      this.config.baseAlphabet,
      this.config.alphabet
    )
  }

  #PADDING_CACHE = ['', '===', '==', '=']
  baseDecode(data: string): Buffer {
    data = this.maybeUseAlphabet(data, this.config.alphabet, this.config.baseAlphabet)
    const remainder = data.length % 4
    if (remainder) data += this.#PADDING_CACHE[remainder]
    return Buffer.from(data.replace(/[-_]/g, (char) => char === '-' ? '+' : '/'), 'base64')
    // if (remainder) data += '='.repeat(4 - remainder)
    // return Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
  }
}
