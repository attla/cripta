import Attempt from '@/utils/attempt'

describe('Attempt', () => {
  describe('static constants and utils', () => {
    it('should recognize Attempt.UNDEFINED', () => {
      expect(Attempt.undefined(Attempt.UNDEFINED)).toBe(true)
      expect(Attempt.defined(Attempt.UNDEFINED)).toBe(false)
    })

    it('should recognize null/undefined as unset', () => {
      expect(Attempt.isUnset(null)).toBe(true)
      expect(Attempt.isUnset(undefined)).toBe(true)
      expect(Attempt.isUnset(0)).toBe(false)
      expect(Attempt.isUnset('')).toBe(false)
    })
  })

  describe('resolve', () => {
    it('should capture value from callback', () => {
      const result = Attempt.resolve(() => 42)
      expect(result.get()).toBe(42)
    })

    it('should return UNDEFINED if callback throws', () => {
      const attempt = Attempt.resolve(() => { throw new Error() })
      expect(attempt.get()).toBeUndefined()
    })

    it('should return default value if callback throws', () => {
      const result = Attempt.resolve(() => {
        throw new Error('fail')
      }, 'fallback')
      expect(result.get()).toBe('fallback')
    })

    it('should not override defined value with default', () => {
      const result = Attempt.resolve(() => 'hello', 'default')
      expect(result.get()).toBe('hello')
    })
  })

  describe('or', () => {
    it('should return the current Attempt if value is defined', () => {
      const a = Attempt.resolve(() => 'ok').or(() => 'fail')
      expect(a.get()).toBe('ok')
    })

    it('should fallback using or() if value is undefined', () => {
      const a = new Attempt<string>(null).or(() => 'fallback')
      expect(a.get()).toBe('fallback')
    })

    it('should keep defaultValue when using or()', () => {
      const attempt = new Attempt(null, 'default').or(() => 'fallback')
      expect(attempt.get()).toBe('fallback')
    })
  })

  describe('default', () => {
    it('should use the default value when value is null/undefined', () => {
      const a = new Attempt<string>(null).default('default')
      expect(a.get()).toBe('default')
    })

    it('should ignore default if value is defined', () => {
      const a = new Attempt('value').default('default')
      expect(a.get()).toBe('value')
    })

    it('should not return default if both value and default are unset', () => {
      const a = new Attempt(undefined, undefined)
      expect(a.get()).toBe(undefined)
    })

    it('should return the instance itself', () => {
      const attempt = new Attempt<string>(null)
      expect(attempt.default('default')).toBe(attempt)
    })
  })

  describe('tap', () => {
    it('should not fail when callback is not provided', () => {
      const attempt = new Attempt(42)
      expect(attempt.tap()).toBe(attempt)
      expect(() => attempt.tap()).not.toThrow()
    })
  })

  describe('getOrThrow()', () => {
    it('should return the value when set', () => {
      expect(new Attempt('value').getOrThrow()).toBe('value')
    })

    it('should throw error when value is not set', () => {
      expect(() => new Attempt(null).getOrThrow()).toThrow('Value is null or undefined')
    })

    it('should throw custom error when provided', () => {
      const error = new Error('Custom error')
      expect(() => new Attempt(undefined).getOrThrow(error)).toThrow(error)
    })
  })

  describe('Casos de Uso Complexos', () => {
    it('must chain operations correctly', () => {
      const result = new Attempt<string>(null, 'initial-default')
        .default('new-default')
        .or(() => 'fallback')
        .tap(val => console.log(val))
        .getOrThrow()

      expect(result).toBe('fallback')
    })

    it('should handle falsy values ​​correctly', () => {
      expect(new Attempt(0).get()).toBe(0)
      expect(new Attempt('').get()).toBe('')
      expect(new Attempt(false).get()).toBe(false)
    })
  })
})
