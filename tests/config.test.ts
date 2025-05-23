import { Config } from '@/config'
import { Base64 } from '@/utils/base64'
import { key, config, secret } from './dataset'

describe('Config', () => {
  let originalEnv: Record<string, any>

  beforeAll(() => {
    originalEnv = { ...process.env }
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  describe('constructor', () => {
    it('should initialize with default values when no options provided', () => {
      const obj = new Config()
      expect(obj.entropy).toBe(4)
      expect(obj.baseAlphabet).toBe('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_')
      expect(obj.key).toBeUndefined()
      expect(obj.seed).toBeUndefined()
      expect(obj.alphabet).toBeUndefined()
    })

    it('should use provided options', () => {
      const obj = new Config(config)
      expect(obj.entropy).toBe(config.entropy)
      expect(obj.key).toEqual(secret)
      expect(obj.seed).toBeUndefined()
      expect(obj.alphabet).toBeUndefined()
    })

    it('should get APP_KEY from environment if not provided', () => {
      process.env.APP_KEY = key
      const obj = new Config()
      expect(obj.key).toEqual(secret)
    })

    it('should handle base64 encoded key', () => {
      const obj = new Config({ key: 'base64:' + Base64.encode(key) })
      expect(obj.key).toEqual(secret)
    })
  })

  describe('setKey', () => {
    it('should set key when valid string provided', () => {
      const obj = new Config()
      const oldKey = config.key
      obj.setKey(key)
      expect(obj.key).toEqual(secret)
      expect(obj.key).not.toBe(oldKey)
    })

    it('should not set key when empty string provided', () => {
      const obj = new Config({ key })
      obj.setKey('')
      expect(obj.key).toEqual(secret)
    })
  })

  describe('setSeed', () => {
    it('should set seed and alphabet when number provided', () => {
      const obj = new Config()
      obj.setSeed(123)
      expect(obj.seed).toBe(123)
      expect(obj.alphabet).toBeDefined()
      expect(obj.alphabet).not.toBe(obj.baseAlphabet)
    })

    it('should set seed and alphabet when string number provided', () => {
      const obj = new Config()
      obj.setSeed('456')
      expect(obj.seed).toBe(456)
      expect(obj.alphabet).toBeDefined()
    })

    it('should not change alphabet if same seed provided', () => {
      const obj = new Config({ seed: 789 })
      const firstAlphabet = obj.alphabet as string
      obj.setSeed(789)
      expect(obj.alphabet).toBe(firstAlphabet)
    })

    it('should update alphabet if different seed provided', () => {
      const obj = new Config({ seed: 100 })
      const firstAlphabet = obj.alphabet
      obj.setSeed(101)
      expect(obj.alphabet).not.toBe(firstAlphabet)
    })
  })

  describe('setEntropy', () => {
    it('should set entropy when number provided', () => {
      const obj = new Config()
      obj.setEntropy(6)
      expect(obj.entropy).toBe(6)
    })

    it('should set entropy when string number provided', () => {
      const obj = new Config()
      obj.setEntropy('10')
      expect(obj.entropy).toBe(10)
    })
  })

  describe('getInt', () => {
    it('should return number property as is', () => {
      const obj = new Config({ entropy: 7 })
      expect(obj.getInt('entropy')).toBe(7)
    })

    it('should convert string property to number', () => {
      const obj = new Config() as any
      obj.testProp = '42'
      expect(obj.getInt('testProp')).toBe(42)
    })
  })

  describe('sortSeed', () => {
    it('should return same data when seed is null', () => {
      const obj = new Config()
      const data = 'test-string'
      const result = (obj as any).sortSeed(data, null)
      expect(result).toBe(data)
    })

    it('should shuffle string based on seed', () => {
      const obj = new Config()
      const data = 'abcdef'
      const seed = 123
      const result1 = (obj as any).sortSeed(data, seed)
      const result2 = (obj as any).sortSeed(data, seed)

      // Should be shuffled
      expect(result1).not.toBe(data)
      expect(result1).not.toEqual(data)
      // Should be deterministic
      expect(result1).toBe(result2)
      // Should contain same characters
      expect([...result1].sort().join('')).toBe([...data].sort().join(''))
    })

    it('should shuffle array based on seed', () => {
      const obj = new Config()
      const data = ['a', 'b', 'c', 'd', 'e', 'f']
      const seed = 456
      const result1 = (obj as any).sortSeed(data, seed)
      const result2 = (obj as any).sortSeed(data, seed)

      // Should be shuffled
      expect(result1).not.toBe(data)
      expect(result1).not.toEqual(data)
      // Should be deterministic
      expect(result1).toEqual(result2)
      // Should contain same elements
      expect([...result1].sort()).toEqual([...data].sort())
    })

    it('should use cache for same input and seed', () => {
      const obj = new Config()
      const data = 'cache-test'
      const seed = 789

      // @ts-ignore
      // First call - not in cache
      const spy = jest.spyOn(obj as any, 'createSeededRNG')
      const result1 = (obj as any).sortSeed(data, seed)
      expect(spy).toHaveBeenCalledTimes(1)

      // Second call - should use cache
      const result2 = (obj as any).sortSeed(data, seed)
      expect(spy).toHaveBeenCalledTimes(1) // No additional call
      expect(result1).toBe(result2)

      spy.mockRestore()
    })

    it('should handle unicode characters correctly', () => {
      const obj = new Config()
      const data = 'áéíóúñ'
      const seed = 999
      const result = (obj as any).sortSeed(data, seed)

      expect(result.length).toBe(data.length)
      expect([...result].sort().join('')).toBe([...data].sort().join(''))
    })
  })

  describe('createSeededRNG', () => {
    it('should generate deterministic sequence for same seed', () => {
      const obj = new Config()
      const seed = 123
      const rng = (obj as any).createSeededRNG(seed)

      const sequence1 = [rng(), rng(), rng(), rng()]
      const sequence2 = [rng(), rng(), rng(), rng()]

      // Reset RNG with same seed
      const rng2 = (obj as any).createSeededRNG(seed)
      const sequence3 = [rng2(), rng2(), rng2(), rng2()]

      expect(sequence1).toEqual(sequence3)
      expect(sequence1).not.toEqual(sequence2)
    })
  })

  describe('hashStringToNumber', () => {
    it('should produce same hash for same string', () => {
      const obj = new Config()
      const hash1 = (obj as any).hashStringToNumber('test-string')
      const hash2 = (obj as any).hashStringToNumber('test-string')
      expect(hash1).toBe(hash2)
    })

    it('should produce different hashes for different strings', () => {
      const obj = new Config()
      const hash1 = (obj as any).hashStringToNumber('string1')
      const hash2 = (obj as any).hashStringToNumber('string2')
      expect(hash1).not.toBe(hash2)
    })
  })
})
