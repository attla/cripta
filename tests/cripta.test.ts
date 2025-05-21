import { Config } from '@/config'
import { Factory } from '@/factory'
import { string, config as options } from './dataset'
import { strings, types } from './testcase'

let instances = new WeakMap<object, Factory>()

function cripta(opts: Config): Factory {
  if (instances.has(opts))
    return instances.get(opts)!
  const instance = new Factory(opts)
  instances.set(opts, instance)
  return instance
}

const encode = (opts: Config, val: any): string => cripta(opts).encode(val)
const decode = <T = any>(opts: Config, val: any): T => cripta(opts).decode(val) as T
const encodeAndDecode = <T = any>(opts: Config, val: any): T => decode(opts, encode(opts, val))

const config = new Config(options)
const configWrong = new Config({ ...options, key: 'wrong-key' })
const configSame = new Config({ ...options, entropy: 0 })
const configSameWrong = new Config({ ...options, key: 'wrong-key', entropy: 0 })
const configSeeded = new Config({ ...options, entropy: 0, seed: 42 })
const configSeededWrong = new Config({ ...options, key: 'wrong-key', entropy: 0, seed: 42 })

describe('Cripta', () => {
  beforeEach(() => {
    instances = new WeakMap<object, Factory>()
  })

  it('throws on invalid config', () => {
    expect(() => encode(new Config(), string)).toThrow()
  })

  describe('Config chaining with setConfig()', () => {
    it.each(strings)('%s', (_, value) => {
      const factory = new Factory(config).setConfig(configSame)

      const encodedWithWrong = encode(configSameWrong, value)
      const encodedFromFactory = factory.encode(value)

      expect(encodedWithWrong).not.toBe(encodedFromFactory)
      expect(factory.decode(encodedFromFactory)).toStrictEqual(value)
    })
  })

  describe('Behavior with entropy', () => {
    it('produces deterministic output with entropy=0', () => {
      const encoded1 = encode(configSame, string)
      const encoded2 = encode(configSameWrong, string)

      expect(encoded1).not.toBe(encoded2)
      expect(decode<string>(configSame, encoded1)).toBe(string)
      expect(decode<string>(configSameWrong, encoded2)).toBe(string)
    })

    it('supports onceConfig() for temporary configs', () => {
      const factory = cripta(configSame)

      const onceEncoded = factory.onceConfig(configSameWrong).encode(string)
      const onceDecoded = factory.onceConfig(configSameWrong).decode(onceEncoded)

      expect(onceDecoded).toBe(string)

      const regularEncoded = factory.encode(string)
      expect(factory.decode(regularEncoded)).toBe(string)

      expect(onceEncoded).not.toBe(regularEncoded)

      const onceEncodedRepeat = encode(configSameWrong, string)
      expect(onceEncoded).toBe(onceEncodedRepeat)
    })
  })

  describe('Type round-trip validity', () => {
    it.each(types)('%s should encode/decode correctly', (_, value) => {
      expect(encodeAndDecode(config, value)).toStrictEqual(value)
    })
  })

  describe('Randomness (entropy > 0)', () => {
    it.each(types)('%s should always encode differently', (_, value) => {
      const results = Array.from({ length: 6 }, () => encode(config, value))
      expect(new Set(results).size).toBe(6)
    })

    it.each(types)('%s should not decode with wrong key', (_, value) => {
      const encoded = encode(config, value)
      expect(decode(configWrong, encoded)).not.toStrictEqual(value)
    })
  })

  describe('Deterministic encoding (entropy = 0)', () => {
    it.each(types)('%s should always produce the same encoded string', (_, value) => {
      const results = Array.from({ length: 6 }, () => encode(configSame, value))
      expect(new Set(results).size).toBe(1)
    })

    it.each(types)('%s should not decode with wrong key', (_, value) => {
      const encoded = encode(configSame, value)
      expect(decode(configSameWrong, encoded)).not.toStrictEqual(value)
    })
  })

  describe('Seeded deterministic encoding', () => {
    it.each(types)('%s should encode/decode correctly with seed', (_, value) => {
      expect(encodeAndDecode(configSeeded, value)).toStrictEqual(value)
    })

    it.each(types)('%s should produce always the same encoded string', (_, value) => {
      const results = Array.from({ length: 6 }, () => encode(configSeeded, value))
      expect(new Set(results).size).toBe(1)
    })

    it.each(types)('%s should not decode with wrong key', (_, value) => {
      const encoded = encode(configSeeded, value)
      expect(decode(configSeededWrong, encoded)).not.toStrictEqual(value)
    })
  })

  describe('Seeded != Non-seeded', () => {
    it.each(types)('%s should differ between seeded and non-seeded configs', (_, value) => {
      const encodedSeeded = encode(configSeeded, value)
      const encodedNonSeeded = encode(configSame, value)

      expect(encodedSeeded).not.toBe(encodedNonSeeded)
    })
  })
})
