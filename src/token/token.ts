import crypto from 'node:crypto'
import { Claim } from './claim'
import Util from '../utils/date'
import DataBag from '../utils/databag'
import { Config, Cripta } from '../'
import { md5 } from '@/hash'

export class Token {
  claims: DataBag = new DataBag()

  header: DataBag = new DataBag()
  headerString: string = ''

  body: any = Symbol('UNDEFINED')
  bodyString: string = ''

  signature: string = ''

  #same: boolean = false
  #sameConfig: Config = new Config({entropy: 0})
  #leeway: number = 0

  #cripta: Cripta = new Cripta()
  #separator: string = '.'

  secret(key: string) {
    this.#cripta.config.setKey(key)
    this.#sameConfig.setKey(key)
  }

  parseHeader(header: string | null | undefined = ''): this {
    if (header) {
      try {
        const decoded = this.#cripta.decode(header)
        if (typeof decoded === 'object') {
          this.header.replace(decoded as any)
          this.headerString = header
        }
      } catch (e) {}
    }

    return this
  }

  encodedHeader(): string {
    this.newEntropy()

    return this.headerString = this.#cripta.encode(
      this.#same ? this.header.all() : this.randomizeObject(this.header.all())
    )
  }

  parseBody(body: string | null | undefined = ''): this {
    if (body && this.header.has('e')) {
      try {
        const decoded = this.#cripta.onceKey(this.header.get('e')).decode(body)

        this.body = decoded
        this.bodyString = body
      } catch (e) {}
    }

    return this
  }

  encodedBody(): string {
    return this.bodyString = this.#cripta.onceKey(this.entropy()).encode(this.body)
  }

  setSignature(signature: string): this {
    this.signature = signature
    return this
  }

  sign(): string {
    return this.hash(
      this.headerString + this.bodyString,
      this.secret + this.entropy()
    )
  }

  signed(): boolean {
    return this.signature ? this.signature === this.sign() : false
  }

  isValid(): boolean {
    return this.body !== Symbol('UNDEFINED') && this.signed() ? this.validateClaims() : false
  }
  isInvalid(): boolean {
    return !this.isValid()
  }

  hasValue(prop: string, value: any = null): boolean {
    if (this.header.has(prop))
      return value === null ? true : this.header.get(prop) === value

    if (this.body && typeof this.body === 'object' && Object.keys(this.body).length > 0 && prop in this.body)
      return value === null ? true : this.body[prop] === value

    return false
  }

  validateClaims(): boolean {
    const now = this.claims.get(Claim.NOW, Math.floor(Date.now() / 1000))

    if (
      this.isExpired(now)
      || !this.notBefore(now)
      || !this.issuedBefore(now)
      || !this.validate(Claim.AUDIENCE)
      || !this.validate(Claim.ISSUER)
      || !this.validate(Claim.ID)
      || !this.validate(Claim.SUBJECT)
      || !this.validateCustomClaims()
      // TODO: validate ip, bwr, loc
    ) {
        return false
    }

    return true
  }

  public isExpired(date: number | Date | null = null): boolean {
    const claim = Claim.EXPIRATION_TIME
    if (!this.header.has(claim)) return false

    return Util.timestamp(date) - this.#leeway >= this.header.get(claim)
  }

  private validAfter(claim: string, date: number | Date | null = null): boolean {
    if (!this.header.has(claim)) return true
    return Util.timestamp(date) + this.#leeway >= this.header.get(claim)
  }

  notBefore(date: number | Date | null = null): boolean {
    return this.validAfter(Claim.NOT_BEFORE, date)
  }

  issuedBefore(date: number | Date | null = null): boolean {
    return this.validAfter(Claim.ISSUED_AT, date)
  }

  validate(claim: string, expected: any = null): boolean {
    expected = expected || this.claims.get(claim, null)
    let value = this.getTokenValue(claim)
    value = Array.isArray(value) ? value : [value]

    return Array.isArray(expected)
      ? expected.every(exp => value.includes(exp))
      : value.includes(expected)
  }

  protected getTokenValue(claim: string): any {
    if (this.header.has(claim))
      return this.header.get(claim)

    if (this.body && typeof this.body === 'object' && Object.keys(this.body).length > 0 && claim in this.body)
      return this.body[claim]

    return null
  }

  protected validateCustomClaims(): boolean {
    const internal = ['e', ...Claim.ALL]
    const headers: Record<string, any> = {}
    this.header.toArray().forEach(([key, value]) => {
      if (!internal.includes(key)) headers[key] = value
    })

    const claims: Record<string, any> = {}
    this.claims.toArray().forEach(([key, value]) => {
      if (!internal.includes(key) && !(key in headers)) claims[key] = value
    })

    const all = { ...headers, ...claims }

    for (const claim in all) {
      if (!this.validate(claim, all[claim])) return false
    }

    return true
  }

  same(entropy: string | number = '') {
    this.#same = true
    this.header.set('e', this.hash(entropy || this.#cripta.config.key?.toString('hex')).substring(0, 6))
    this.#cripta.config.entropy = 0
  }

  unique() {
    this.#same = false
    this.newEntropy()
    this.#cripta.config.entropy = 4
  }

  leeway(time: number | Date | null = null) {
    // TODO: add suport to Date type
    this.#leeway = typeof time === 'number' ? Math.abs(time) : 0
  }

  private entropy(): string {
    return this.header.get('e') || this.newEntropy()
  }

  private newEntropy(): string {
    if (this.#same && this.header.has('e'))
      return this.header.get('e')

    const entropy = crypto.randomBytes(3).toString('hex')
    this.header.set('e', entropy)
    return entropy
  }

  private hash(data: any, secret: string | null = null): string {
    secret && this.#sameConfig.setKey(secret)
    return this.#cripta.onceConfig(this.#sameConfig).encode(md5(String(data)))
  }

  getParts(token: string): string[] | false {
    if (!token) return false
    const parts = token.split(this.#separator)
    return parts.length === 3 ? parts : false
  }

  toString(): string {
    return [
      this.headerString || this.encodedHeader(),
      this.bodyString || this.encodedBody(),
      this.sign(),
    ].join(this.#separator)
  }

  private randomizeObject(obj: Record<string, any>): Record<string, any> {
    const keys = Object.keys(obj)
    const randomized: Record<string, any> = {}

    for (let i = keys.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [keys[i], keys[j]] = [keys[j], keys[i]]
    }

    keys.forEach(key => {
      randomized[key] = obj[key]
    })

    return randomized
  }
}
