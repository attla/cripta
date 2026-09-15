import { config, encode as $encode, decode as $decode } from '@/cripta'
import type { Options } from '@/cripta'
import { string, opt } from './dataset'
import { types } from './testcase'

const encode = async (opts: Options, val: any) => $encode(val, await config(opts))
const decode = async <T = any>(opts: Options, val: any) => $decode(val, await config(opts)) as T
const encodeAndDecode = async<T = any>(opts: Options, val: any) => decode(opts, await encode(opts, val))

const optWrong = { ...opt, key: 'wrong-key' }
const optSame = { ...opt, entropy: 0 }
const optSameWrong = { ...opt, key: 'wrong-key', entropy: 0 }
const optSeeded = { ...opt, entropy: 0, seed: 42 }
const optSeededWrong = { ...opt, key: 'wrong-key', entropy: 0, seed: 42 }

describe('Cripta', () => {
  it('throws on invalid config', () => {
    expect(async () => await encode({}, string)).toThrow()
  })

  describe('Entropy', () => {
    describe('Deterministic output (entropy = 0)', () => {
      it.each(types)('%s should encode/decode correctly', async (_, value) => {
        expect(await encodeAndDecode(optSame, value)).toStrictEqual(value)
      })

      it.each(types)('%s should always produce the same encoded string', async (_, value) => {
        const results = await Promise.all(Array.from({ length: 6 }, async () => await encode(optSame, value)))
        expect(new Set(results).size).toBe(1)
      })

      it.each(types)('%s should not decode with wrong key', async (_, value) => {
        const encoded = await encode(optSame, value)
        expect(await decode(optSameWrong, encoded)).not.toStrictEqual(value)
      })
    })

    describe('Randomness (entropy > 0)', () => {
      it.each(types)('%s should always encode differently', async (_, value) => {
        const results = await Promise.all(Array.from({ length: 6 }, async () => await encode(opt, value)))
        expect(new Set(results).size).toBe(6)
      })

      it.each(types)('%s should not decode with wrong key', async (_, value) => {
        const encoded = await encode(opt, value)
        expect(await decode(optWrong, encoded)).not.toStrictEqual(value)
      })
    })
  })

  describe('Seed', () => {
    it.each(types)('%s should encode/decode correctly with seed', async (_, value) => {
      expect(await encodeAndDecode(optSeeded, value)).toStrictEqual(value)
    })

    it.each(types)('%s should produce always the same encoded string', async (_, value) => {
      const results = await Promise.all(Array.from({ length: 6 }, async () => await encode(optSeeded, value)))
      expect(new Set(results).size).toBe(1)
    })

    it.each(types)('%s should not decode with wrong key', async (_, value) => {
      const encoded = await encode(optSeeded, value)
      expect(await decode(optSeededWrong, encoded)).not.toStrictEqual(value)
    })
  })

  describe('Seeded != Non-seeded', () => {
    it.each(types)('%s should differ between seeded and non-seeded configs', async (_, value) => {
      const encodedSeeded = await encode(optSeeded, value)
      const encodedNonSeeded = await encode(optSame, value)

      expect(encodedSeeded).not.toBe(encodedNonSeeded)
    })
  })
})
