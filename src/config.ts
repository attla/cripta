import { Envir, toInt } from 't0n'
import { sha256 } from './hash'
import type { ConfigOptions } from './types'

export class Config {
  entropy: number = 4
  baseAlphabet: string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_'

  key?: Buffer
  seed?: number
  alphabet?: string

  static #sortedCache: Record<string, any> = {}

  constructor(opts?: ConfigOptions) {
    this.setKey(opts?.key || Envir.get<string>('APP_KEY', Envir.get<string>('KEY')))
      .setSeed(opts?.seed)
      .setEntropy(opts?.entropy)
  }

  setKey(key?: string): this {
    if (typeof key !== 'string') return this
    key = key?.trim()
    if (!key) return this

    if (key.indexOf('base64:') > -1) {
      this.key = sha256(Buffer.from(key.substring(7), 'base64'), 'buffer')
      return this
    }

    this.key = sha256(key, 'buffer')
    return this
  }

  setSeed(value: any): this {
    if (!value) return this

    const numValue = typeof value === 'number' ? Math.abs(value) : toInt(value)

    if (!this.seed || this.seed !== numValue)
      this.alphabet = this.sortSeed(this.baseAlphabet, numValue)

    this.seed = numValue
    return this
  }

  setEntropy(value: any): this {
    if (value === null || value === undefined)
      return this

    this.entropy = typeof value === 'number' ? Math.abs(value) : toInt(value)
    return this
  }

  getInt(key: string): number {
    const value = (this as any)[key]
    return typeof value === 'number' ? value : toInt(value)
  }

  sortSeed<T extends string | string[]>(data: T, seed: number | string | null = null): T {
    if (!seed) return data

    const numericSeed = typeof seed === 'string' ? this.hashStringToNumber(seed) : seed

    const dataString = Array.isArray(data) ? JSON.stringify(data) : data as string
    const key = `${this.hashStringToNumber(dataString)}-${numericSeed}`

    if (Config.#sortedCache[key])
      return Config.#sortedCache[key] as T

    const isArray = Array.isArray(data)
    const items = isArray ? [...data] : this.#splitUnicodeString(data)

    const rng = this.createSeededRNG(numericSeed)
    const randomized = items
        .map((item, index) => ({ item, sortKey: rng() }))
        .sort((a, b) => a.sortKey - b.sortKey)
        .map(x => x.item)

    const result = (isArray ? randomized : randomized.join('')) as T
    Config.#sortedCache[key] = result
    return result
  }

  #splitUnicodeString(str: string): string[] {
    return str.split(/(?!^)(?=.)/u).filter(Boolean)
  }

  createSeededRNG(seed: number): () => number {
    return function() {
      seed |= 0
      seed = seed + 0x6D2B79F5 | 0
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
      return ((t ^ t >>> 14) >>> 0) / 4294967296
    }
  }

  hashStringToNumber(str: string): number {
    let hash = 5381
    for (let i = 0; i < str.length; i++)
      hash = (hash * 33) ^ str.charCodeAt(i)

    return hash >>> 0
  }
}
