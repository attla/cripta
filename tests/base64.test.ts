import { Base64, UrlSafeBase64 } from '@/base64'
import { strings } from './testcase'

describe('Base64: Encode & Decode ', () => {
  it.each(strings)('%s', (_, value) => {
    const encoded = Base64.encode(value)
    expect(encoded).toBeString()
    expect(Base64.decode(encoded)).toBe(value)
  })
})

describe('UrlSafeBase64: Encode & Decode', () => {
  it.each(strings)('%s', (_, value) => {
    const encoded = UrlSafeBase64.encode(value)
    expect(encoded).toBeString()
    expect(UrlSafeBase64.decode(encoded)).toBe(value)
  })
})
