import DataBag from '@/utils/databag'

const testCases: [string, Record<string, any>][] = [
  ['Empty object', {}],
  ['Object with primitive values', { name: 'John', age: 30, active: true }],
  ['Object with arrays', { colors: ['blue', 'green'], numbers: [1, 2, 3] }],
  ['Nested object', { person: { name: 'Mary', age: 25 } }],
] as const

describe('DataBag: Basic Operations', () => {
  it.each(testCases)('%s', (_, value) => {
    const bag = new DataBag(value)

    expect(bag.all()).toEqual(value)

    // Test has() and get()
    for (const key in value) {
      expect(bag.has(key)).toBe(true)
      expect(bag.get(key)).toEqual(value[key])
    }

    // Test keys()
    expect(bag.keys()).toEqual(Object.keys(value))

    // Test values()
    expect(bag.values()).toEqual(Object.values(value))

    // Test toArray()
    expect(bag.toArray()).toEqual(Object.entries(value))
  })
})

describe('DataBag: Data Manipulation', () => {
  let bag: DataBag<any>

  beforeEach(() => {
    bag = new DataBag({ a: 1, b: 2 })
  })

  it('should add data correctly', () => {
    bag.add({ c: 3, d: 4 })
    expect(bag.all()).toEqual({ a: 1, b: 2, c: 3, d: 4 })
  })

  it('should replace all data', () => {
    bag.replace({ x: 10, y: 20 })
    expect(bag.all()).toEqual({ x: 10, y: 20 })
  })

  it('should remove an item correctly', () => {
    bag.remove('a')
    expect(bag.all()).toEqual({ b: 2 })
    expect(bag.has('a')).toBe(false)
  })

  it('should clear all data', () => {
    bag.clear()
    expect(bag.size).toBe(0)
    expect(bag.all()).toEqual({})
  })
})

describe('DataBag: Serialization', () => {
  const testData = { name: 'Carlos', age: 40 }

  it('should serialize to JSON correctly', () => {
    const bag = new DataBag(testData)
    const json = bag.toJson()
    expect(json).toBe(JSON.stringify(testData))
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('should iterate correctly', () => {
    const bag = new DataBag(testData)
    const entries = [...bag]
    expect(entries).toEqual(Object.entries(testData))
  })
})

describe('DataBag: Type Safety', () => {
  it('should maintain value types', () => {
    const stringBag = new DataBag<string>({ msg: 'hello' })
    // @ts-expect-error - Testing type safety
    expect(() => stringBag.set('msg', 123)).toThrowError()

    const numberBag = new DataBag<number>({ count: 10 })
    expect(numberBag.get('count')).toBe(10)
  })
})
