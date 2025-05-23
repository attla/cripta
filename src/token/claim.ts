/**
 * Defines the list of claims that are registered in the IANA "JSON Web Token Claims" registry
 *
 * @see https://tools.ietf.org/html/rfc7519#section-4.1
 */
export class Claim {
  /**
   * Identifies the recipients that the JWT is intended for
   *
   * @see https://tools.ietf.org/html/rfc7519#section-4.1.3
   */
  static readonly AUDIENCE: string = 'aud'

  /**
   * Identifies the expiration time on or after which the JWT MUST NOT be accepted for processing
   *
   * @see https://tools.ietf.org/html/rfc7519#section-4.1.4
   */
  static readonly EXPIRATION_TIME: string = 'exp'

  /**
   * Provides a unique identifier for the JWT
   *
   * @see https://tools.ietf.org/html/rfc7519#section-4.1.7
   */
  static readonly ID: string = 'jti'

  /**
   * Identifies the time at which the JWT was issued
   *
   * @see https://tools.ietf.org/html/rfc7519#section-4.1.6
   */
  static readonly ISSUED_AT: string = 'iat'

  /**
   * Identifies the principal that issued the JWT
   *
   * @see https://tools.ietf.org/html/rfc7519#section-4.1.1
   */
  static readonly ISSUER: string = 'iss'

  /**
   * Identifies the time before which the JWT MUST NOT be accepted for processing
   *
   * @see https://tools.ietf.org/html/rfc7519#section-4.1.5
   */
  static readonly NOT_BEFORE: string = 'nbf'

  /**
   * Identifies the principal that is the subject of the JWT
   *
   * @see https://tools.ietf.org/html/rfc7519#section-4.1.2
   */
  static readonly SUBJECT: string = 'sub'

  // INTERNAL VALIDATIONS

  /**
   * Identifies the time to verifies the claims iat, nbf, and exp,
   * when present (supports leeway configuration)
   */
  static readonly NOW: string = 'now'

  // CUSTOM VALIDATIONS

  // Identifies the browser user agent
  static readonly BROWSER: string = 'bwr'

  // Identifies the address ipv6 or ipv4
  static readonly IP: string = 'ip'

  // Identifies the geographic location
  static readonly LOCATION: string = 'loc'

  // Constants
  static readonly ALL: string[] = [
    Claim.AUDIENCE,
    Claim.EXPIRATION_TIME,
    Claim.ID,
    Claim.ISSUED_AT,
    Claim.ISSUER,
    Claim.NOT_BEFORE,
    Claim.SUBJECT,
    Claim.NOW,
    Claim.IP,
    Claim.BROWSER,
    Claim.LOCATION,
  ]

  static readonly RFC7519: string[] = [
    Claim.AUDIENCE,
    Claim.EXPIRATION_TIME,
    Claim.ID,
    Claim.ISSUED_AT,
    Claim.ISSUER,
    Claim.NOT_BEFORE,
    Claim.SUBJECT,
  ]

  static readonly DATE_CLAIMS: string[] = [
    Claim.ISSUED_AT,
    Claim.NOT_BEFORE,
    Claim.EXPIRATION_TIME,
  ]

  static readonly CUSTOM: string[] = [
    Claim.IP,
    Claim.BROWSER,
    Claim.LOCATION,
  ]
}
