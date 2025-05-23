export class Base64 {
  public static encode(data: any): string {
    const type = typeof data
    data = this.toString(data, type)

    const length = data?.byteLength || data.length
    return length < 1 ? '' : Buffer.from(data).toString('base64')
  }

    public static decode(data: string): string {
      if (typeof data !== 'string')
        throw new TypeError('Expected input to be a string')

      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(data))
        throw new Error('Invalid Base64 string')

      try {
        return Buffer.from(data, 'base64').toString('utf8')
      } catch (e) {
        throw new Error('Invalid base64 characters')
      }
    }

  // https://www.npmjs.com/package/crypt?activeTab=code
  // https://github.com/puleos/object-hash/blob/master/index.js
  // https://github.com/shuding/stable-hash/blob/main/src/index.ts
  public static toString(data: any, type?: string): string | Uint8Array | ArrayBuffer {
    type ??= typeof data
    if (Buffer.isBuffer(data)) {
      return data
    }
    if (type === 'string') return data
    // if (type === 'string' || Buffer.isBuffer(data)) return data

    if (Array.isArray(data) || ['function', 'symbol'].includes(type))
      return data.toString()
    else if (data === null || ['number', 'bigint', 'boolean', 'undefined'].includes(type))
      return String(data)
    else if (type === 'object' && !(data instanceof Uint8Array) && !(data instanceof ArrayBuffer))
      return JSON.stringify(data)

    return data
  }
}

export class UrlSafeBase64 {
  public static encode(data: any): string {
    return Base64.encode(data)?.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_') || ''
  }

  public static decode(data: string): string {
    const remainder = data.length % 4
    if (remainder)
        data += '='.repeat(4 - remainder)

    return Base64.decode(data.replace(/-/g, '+').replace(/_/g, '/'))
  }
}
