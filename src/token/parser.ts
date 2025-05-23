import { Claim } from './claim'
import { Token } from './token'
import Util from '../utils/date'

export class Parser {
  protected token: Token = new Token()
  private tokenString: string = ''
  private parsed: boolean = false

  constructor(token: string) {
    this.tokenString = String(token)
  }

  same(): this {
    this.token.same()
    return this
  }
  unique(): this {
    this.token.unique()
    return this
  }

  leeway(time: number | Date): this {
    this.token.leeway(time)
    return this
  }

  secret(key: string): this {
    this.token.secret(key)
    return this
  }
  phrase(key: string): this {
    return this.secret(key)
  }
  passphrase(key: string): this {
    return this.secret(key)
  }

  validAt(date: number | Date): this {
    this.token.claims.set(Claim.NOW, Util.timestamp(date))
    return this
  }
  expiresAt(date: number | Date): this {
    return this.validAt(date)
  }
  expiration(date: number | Date): this {
    return this.validAt(date)
  }
  exp(date: number | Date): this {
    return this.validAt(date)
  }
  canOnlyBeUsedAfter(date: number | Date): this {
    return this.validAt(date)
  }
  notBefore(date: number | Date): this {
    return this.validAt(date)
  }
  nbf(date: number | Date): this {
    return this.validAt(date)
  }
  issuedAt(date: number | Date): this {
    return this.validAt(date)
  }
  issuedBefore(date: number | Date): this {
    return this.validAt(date)
  }
  iat(date: number | Date): this {
    return this.validAt(date)
  }

  identifiedBy(id: string): this {
    this.token.claims.set(Claim.ID, id)
    return this
  }
  jti(id: string): this {
    return this.identifiedBy(id)
  }

  relatedTo(subject: string): this {
    this.token.claims.set(Claim.SUBJECT, subject)
    return this
  }
  sub(subject: string): this {
    return this.relatedTo(subject)
  }

  permittedFor(...aud: string[]): this {
    this.token.claims.set(Claim.AUDIENCE, [
      ...this.token.claims.get(Claim.AUDIENCE, []),
      ...aud.flat().filter(val => typeof val !== 'object' && val !== null)
    ])

    return this
  }
  audience(...aud: string[]): this {
    return this.permittedFor(...aud)
  }
  aud(...aud: string[]): this {
    return this.permittedFor(...aud)
  }

  issuedBy(issuer: string): this {
    this.token.claims.set(Claim.ISSUER, issuer)
    return this
  }
  iss(issuer: string): this {
    return this.issuedBy(issuer)
  }

  // TODO: tipar keyof Claim....
  withClaim(claim: string, value: any): this {
    this.token.claims.set(claim, value)
    return this
  }
  with(claim: string, value: any): this {
    return this.withClaim(claim, value)
  }

  private parseToken(): void {
    if (this.parsed || !this.tokenString || typeof this.tokenString !== 'string') return

    const parts = this.token.getParts(this.tokenString)
    if (parts === false || parts.length !== 3) return

    const [header, payload, signature] = parts

    this.token
      .parseHeader(header)
      .parseBody(payload)
      .setSignature(signature)

    this.parsed = true
  }

  isValid(): boolean {
    this.parseToken()
    return this.token.isValid()
  }

  isInvalid(): boolean {
    return !this.isValid()
  }

  hasValue(prop: string, value: any = null): boolean {
    this.parseToken()
    return this.token.hasValue(prop, value)
  }

  has(prop: string, value: any = null): boolean {
    return this.hasValue(prop, value)
  }

  get<T = any>(): T {
    this.parseToken()
    return this.token.body as T
  }

  toString(): string {
    return this.tokenString
  }
}
