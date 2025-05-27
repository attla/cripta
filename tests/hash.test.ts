import * as hash from '@/hash'
import { strings } from './testcase'

const plain = '今、私はH&wNàáâãäÀÁÂÃÄ çÇ èéêëÈÉÊË ìíîïÌÍÎÏ ñÑ òóôõöÒÓÔÕÖ ùúûüÙÚÛÜ ýÿÝowIambecomDea*()\\][+={}/|:;"\'<>,.?-_th,th0e123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZdestroyerofworlds.अब मैं मृत्यु बन गया हूँ, संसारों का नाश करने वाला।`~!@#$%^&现在我变成了死神，世界的毁灭者。àáâãäÀÁÂÃÄ çÇ èéêëÈÉÊË �ìíîïÌÍÎÏ ñÑ òóôõöÒÓÔÕÖ ùúûüÙÚÛÜ ýÿÝ'
const dataset = {
  md5: '589194773f13933187e8cc11acc34f4f',
  sha1: 'b324253dcd2bbef451dc66edf53c0b0e723f31e6',
  sha256: 'c0b9520b919cc507dcbccbff9657495286df2e3e3933dbfd603ff397a6e10947',
  sha512: 'cb3e6edcceb6d6cb9ed3d8d6b9351adf9e9db3c9511781b7d45f7a589c92d880deb938a4438a7b3b4a5ed27c74388383b29879f6c03e1d0bebf95224a744b7fa',
}

describe('Hash', () => {
  it.each(Object.keys(dataset) as (keyof typeof dataset)[])('%s', (alg) => {
    expect(hash[alg](plain)).toBe(dataset[alg])
  })

  describe('Hash generation', () => {
    it.each(strings)('%s', (_, value) => {
      // Test without salt
      const hash1 = hash.hash(value)
      expect(hash1).toBeString()
      expect(hash1.length).toBeGreaterThanOrEqual(hash.HASH_LEN)

      // Test with salt
      const salt = 'testsalt'
      const hash2 = hash.hash(value, salt)
      expect(hash2).toBeString()
      expect(hash2.length).toBeGreaterThanOrEqual(hash.HASH_LEN + salt.length)
    })

    it('should return empty string for invalid input', () => {
      expect(hash.hash('')).toBe('')
      expect(hash.hash(null as any)).toBe('')
      expect(hash.hash(undefined as any)).toBe('')
      expect(hash.hash(123 as any)).toBe('')
    })
  })

  describe('Hash comparison', () => {
    it.each(strings)('%s', (_, value) => {
      const val = hash.hash(value)
      expect(hash.compare(value, val)).toBeTrue()
      expect(hash.compare(value + 'x', val)).toBeFalse()
      expect(hash.compare(value, val + 'x')).toBeFalse()
    })

    it('should return false for invalid input', () => {
      expect(hash.compare('', 'hash')).toBeFalse()
      expect(hash.compare('value', '')).toBeFalse()
      expect(hash.compare(null as any, 'hash')).toBeFalse()
      expect(hash.compare('value', null as any)).toBeFalse()
    })
  })

  describe('Salt extraction', () => {
    it.each(strings)('%s', (_, value) => {
      const salt = 'testsalt'
      const val = hash.hash(value, salt)
      const extractedSalt = hash.getSalt(val)

      expect(extractedSalt).toBeString()
      expect(extractedSalt).toBe(salt)
    })

    it('should return empty string for invalid input', () => {
      expect(hash.getSalt('')).toBe('')
      expect(hash.getSalt(null as any)).toBe('')
      expect(hash.getSalt(undefined as any)).toBe('')
    })
  })
})
