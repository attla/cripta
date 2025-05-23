import { Claim } from './claim'
import { Token } from './token'
import { Timestamp } from 't0n'

export class Creator {
  protected token: Token = new Token()

  same(): this {
    this.token.same()
    return this
  }
  unique(): this {
    this.token.unique()
    return this
  }

  body(body: any): this {
    this.token.body = body
    return this
  }
  payload(body: any): this {
    return this.body(body)
  }
  content(body: any): this {
    return this.body(body)
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

  expiresAt(date: number | Date): this {
    this.token.header.set(Claim.EXPIRATION_TIME, Timestamp.timestamp(date))
    return this
  }
  expiration(date: number | Date): this {
    return this.expiresAt(date)
  }
  exp(date: number | Date): this {
    return this.expiresAt(date)
  }

  canOnlyBeUsedAfter(date: number | Date): this {
    this.token.header.set(Claim.NOT_BEFORE, Timestamp.timestamp(date))
    return this
  }
  notBefore(date: number | Date): this {
    return this.canOnlyBeUsedAfter(date)
  }
  nbf(date: number | Date): this {
    return this.canOnlyBeUsedAfter(date)
  }

  issuedAt(date: number | Date): this {
    this.token.header.set(Claim.ISSUED_AT, Timestamp.timestamp(date))
    return this
  }
  issuedBefore(date: number | Date): this {
    return this.issuedAt(date)
  }
  iat(date: number | Date): this {
    return this.issuedAt(date)
  }

  identifiedBy(id: string): this {
    this.token.header.set(Claim.ID, id)
    return this
  }
  jti(id: string): this {
    return this.identifiedBy(id)
  }

  relatedTo(subject: string): this {
    this.token.header.set(Claim.SUBJECT, subject)
    return this
  }
  sub(subject: string): this {
    return this.relatedTo(subject)
  }

  permittedFor(...aud: string[]): this {
    this.token.header.set(Claim.AUDIENCE, [
      ...this.token.header.get(Claim.AUDIENCE, []),
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
    this.token.header.set(Claim.ISSUER, issuer)
    return this
  }
  iss(issuer: string): this {
    return this.issuedBy(issuer)
  }

  withClaim(claim: string, value: any): this {
    this.token.header.set(claim, value)
    return this
  }
  with(claim: string, value: any): this {
    return this.withClaim(claim, value)
  }

  get(): string {
    this.token.headerString = ''
    this.token.bodyString = ''
    return this.token.toString()
  }

  toString(): string {
    return this.get()
  }
}
