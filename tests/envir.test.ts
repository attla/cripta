import Envir from '@/utils/envir'
import DataBag from '@/utils/databag'

describe('Envir', () => {
  // Clear memory before each test
  beforeEach(() => {
    Envir['_memory'] = new DataBag()
    // Mock process.env
    process.env = {
      TEST_ENV_VAR: 'env_value',
      NUMBER_ENV_VAR: '42',
      BOOL_ENV_VAR: 'true',
    }
  })

  describe('memory operations', () => {
    it('should set and get values from memory', () => {
      Envir.set('memory_key', 'memory_value')
      expect(Envir.get<string>('memory_key')).toBe('memory_value')
    })

    it('should override env values with memory values', () => {
      Envir.set('TEST_ENV_VAR', 'overridden_value')
      expect(Envir.get<string>('TEST_ENV_VAR')).toBe('overridden_value')
    })

    it('should remove values from memory', () => {
      Envir.set('temp_key', 'temp_value')
      Envir.remove('temp_key')
      expect(Envir.get('temp_key')).toBeUndefined()
    })
  })

  describe('env operations', () => {
    it('should get values from process.env', () => {
      expect(Envir.get<string>('TEST_ENV_VAR')).toBe('env_value')
    })

    it('should return undefined for non-existent env vars', () => {
      expect(Envir.get('NON_EXISTENT_VAR')).toBeUndefined()
    })

    it('should return default value for non-existent env vars', () => {
      expect(Envir.get('NON_EXISTENT_VAR', 'default')).toBe('default')
    })
  })

  describe('type handling', () => {
    it('should preserve string type', () => {
      Envir.set('string_val', 'test')
      expect(typeof Envir.get('string_val')).toBe('string')
    })

    it('should handle number type', () => {
      Envir.set('number_val', 42)
      expect(typeof Envir.get('number_val')).toBe('number')
    })

    it('should handle boolean type', () => {
      Envir.set('bool_val', true)
      expect(typeof Envir.get('bool_val')).toBe('boolean')
    })

    it('should cast env string to desired type', () => {
      expect(Envir.get<string>('NUMBER_ENV_VAR')).toBe('42')
      expect(Envir.get<string>('BOOL_ENV_VAR')).toBe('true')
    })
  })

  describe('has() method', () => {
    it('should return true for existing keys', () => {
      Envir.set('existing_key', 'value')
      expect(Envir.has('existing_key')).toBe(true)
      expect(Envir.has('TEST_ENV_VAR')).toBe(true)
    })

    it('should return false for non-existent keys', () => {
      expect(Envir.has('non_existent_key')).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle null values', () => {
      Envir.set('null_val', null)
      expect(Envir.get('null_val')).toBeNull()
    })

    it('should handle undefined values', () => {
      Envir.set('undefined_val', undefined)
      expect(Envir.get('undefined_val')).toBeUndefined()
    })

    it('should handle empty string', () => {
      Envir.set('empty_str', '')
      expect(Envir.get<string>('empty_str')).toBe('')
    })
  })
})
