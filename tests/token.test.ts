import { randomBytes } from 'crypto'
import { Token } from '@/token'
import { string, key } from './dataset'
import { strings, types } from './testcase'

function apply(token: any, method: string, ...args: any[]) {
  return (token as any)[method](...args)
}

function parse(token: string, secret: string = string) {
  return Token.parse(token).secret(secret)
}

function create(body: any, secret: string = string) {
  return Token.create().secret(secret).body(body)
}

function compare(method: string, ...args: any[]) {
  const token = apply(create(args[0] ?? string), method, ...args).get()
  return apply(parse(token), method, ...args)
}

function compareWrong(method: string, ...args: any[]) {
  const rand = randomBytes(16).toString('hex')
  const token = apply(create(args[0] ?? string), method, ...args).get()
  return apply(parse(token), method, rand, rand, rand)
}

const dateLabels = ['10 sec', '30 min', '1 hour', '1 day', '1 week']
function parseTime(timeStr: string): number {
  const [num, unit] = timeStr.split(' ')
  const multiplier =
    unit === 'sec' ? 1000 :
    unit === 'min' ? 60000 :
    unit === 'hour' ? 3600000 :
    unit === 'day' ? 86400000 :
    unit === 'week' ? 604800000 : 0
  return parseInt(num) * multiplier
}

type TestDate = ([string, Date])[]
type TestTwoDate = ([string, [Date | number, Date]])[]
const beforeDates: TestDate = dateLabels.map(label => [label, new Date(Date.now() - parseTime(label))])
const afterDates: TestDate = dateLabels.map(label => [label, new Date(Date.now() + parseTime(label))])
const beforeAtDates: TestTwoDate = dateLabels.map((label, i) => [label, [afterDates[i][1], beforeDates[i][1]]])
const afterAtDates: TestTwoDate = dateLabels.map((label, i) => [label, [beforeDates[i][1], afterDates[i][1]]])
const beforeLeeways: TestTwoDate = dateLabels.map((label, i) => [label, [parseInt(label.split(' ')[0]) / 2, afterDates[i][1]]])
const afterLeeways: TestTwoDate = dateLabels.map((label, i) => [label, [parseInt(label.split(' ')[0]), beforeDates[i][1]]])

describe('Token', () => {
  describe('Creation', () => {
    it.each(strings)('is valid token type? [default secret] - %s', (_, value) => {
      expect(parse(create(value).get()).get<string>()).toEqual(value)
    })

    it.each(strings)('is valid token type? [secret] - %s', (_, value) => {
      strings.forEach(([_, secret]) => expect(parse(create(value, secret).get(), secret).get<string>()).toEqual(value))
    })

    it.each(strings)('each time generate a unique token? - %s', (_, value) => {
      const token = create(value)
      expect(token.get()).not.toBe(token.get())
    })

    it.each(types)('always generate a unique token? - %s', (_, value) => {
      const tokens = Array.from({ length: 6 }, () => create(value).get())
      expect(new Set(tokens).size).toBe(6)
    })

    it.each(types)('always generate a same token? - %s', (_, value) => {
      const tokens = Array.from({ length: 6 }, () => create(value).same().get())
      expect(new Set(tokens).size).toBe(1)
    })

    it.each(types)('have the correct value type? - %s', (_, value) => {
      const decoder = parse(create(value).get())
      const decoded = decoder.get()
      const type = typeof value

      expect(decoder.isValid()).toBeTrue()
      expect(typeof decoded).toBe(type)
      expect(decoded).toEqual(value)
    })

    it.each(types)('invalid if decoded with wrong secret? - %s', (_, value) => {
      const decoder = parse(create(value).get(), key)
      const decoded = decoder.get()
      const type = typeof value

      expect(decoder.isInvalid()).toBeTrue()
      expect(typeof decoded).not.toBe(type)
      expect(decoded).not.toEqual(value)
    })
  })

  describe('Expiration Validation', () => {
    const exp = (date: Date | number) => create(string).exp(date).get()
    const validAt = (date: Date | number, now: Date) => parse(exp(date)).validAt(now)
    const leeway = (leewayTime: Date | number, date: Date) => parse(exp(date)).leeway(leewayTime)

    it.each(afterDates)('"exp" is valid? - %s', (_, date) => {
      expect(parse(exp(date)).isValid()).toBeTrue()
    })

    it.each(beforeAtDates)('"exp" "at date" is valid? - %s', (_, [date, now]) => {
      expect(validAt(date, now).isValid()).toBeTrue()
    })

    it.each(beforeLeeways)('"exp" with leeway is valid? - %s', (_, [leewayTime, date]) => {
      expect(leeway(leewayTime, date).isValid()).toBeTrue()
    })

    it.each(beforeDates)('invalid "exp"? - %s', (_, date) => {
      expect(parse(exp(date)).isInvalid()).toBeTrue()
    })

    it.each(afterAtDates)('invalid "exp" "at date"? - %s', (_, [date, now]) => {
      expect(validAt(date, now).isInvalid()).toBeTrue()
    })

    it.each(afterLeeways)('invalid "exp" leeway? - %s', (_, [leewayTime, date]) => {
      expect(leeway(leewayTime, date).isInvalid()).toBeTrue()
    })
  })

  describe('Issued Before Validation', () => {
    const iat = (date: Date | number) => create(string).iat(date).get()
    const validAt = (date: Date | number, now: Date) => parse(iat(date)).validAt(now)
    const leeway = (leewayTime: Date | number, date: Date) => parse(iat(date)).leeway(leewayTime)

    it.each(beforeDates)('"iat" date is valid? - %s', (_, date) => {
      expect(parse(iat(date)).isValid()).toBeTrue()
    })

    it.each(afterAtDates)('"iat" at date is valid? - %s', (_, [date, now]) => {
      expect(validAt(date, now).isValid()).toBeTrue()
    })

    it.each(afterLeeways)('"iat" with leeway is valid? - %s', (_, [leewayTime, date]) => {
      expect(leeway(leewayTime, date).isValid()).toBeTrue()
    })

    it.each(afterDates)('invalid "iat"? - %s', (_, date) => {
      expect(parse(iat(date)).isInvalid()).toBeTrue()
    })

    it.each(beforeAtDates)('invalid "iat" at date? - %s', (_, [date, now]) => {
      expect(validAt(date, now).isInvalid()).toBeTrue()
    })

    it.each(beforeLeeways)('invalid "iat" leeway? - %s', (_, [leewayTime, date]) => {
      expect(leeway(leewayTime, date).isInvalid()).toBeTrue()
    })
  })

  describe('Not Before Validation', () => {
    const nbf = (date: Date | number) => create(string).nbf(date).get()
    const validAt = (date: Date | number, now: Date) => parse(nbf(date)).validAt(now)
    const leeway = (leewayTime: Date | number, date: Date) => parse(nbf(date)).leeway(leewayTime)

    it.each(beforeDates)('"nbf" date is valid? - %s', (_, date) => {
      expect(parse(nbf(date)).isValid()).toBeTrue()
    })

    it.each(afterAtDates)('"nbf" at date is valid? - %s', (_, [date, now]) => {
      expect(validAt(date, now).isValid()).toBeTrue()
    })

    it.each(afterLeeways)('"nbf" with leeway is valid? - %s', (_, [leewayTime, date]) => {
      expect(leeway(leewayTime, date).isValid()).toBeTrue()
    })

    it.each(afterDates)('invalid "nbf"? - %s', (_, date) => {
      expect(parse(nbf(date)).isInvalid()).toBeTrue()
    })

    it.each(beforeAtDates)('invalid "nbf" at date? - %s', (_, [date, now]) => {
      expect(validAt(date, now).isInvalid()).toBeTrue()
    })

    it.each(beforeLeeways)('invalid "nbf" leeway? - %s', (_, [leewayTime, date]) => {
      expect(leeway(leewayTime, date).isInvalid()).toBeTrue()
    })
  })

  describe('Audience Validation', () => {
    const aud = (value: string) => compare('aud', value)
    const audWrong = (value: string) => compareWrong('aud', value)

    it.each(types)('"aud" is valid? - %s', (_, value) => {
      expect(aud(value).isValid()).toBeTrue()
    })

    it.each(strings)('invalid "aud"? - %s', (_, value) => {
      expect(audWrong(value).isInvalid()).toBeTrue()
    })
  })

  describe('Custom Claim Validation', () => {
    const claim = (value: string) => compare('with', 'uid', value)
    const claimWrong = (value: string) => compareWrong('with', 'uid', value)

    it.each(strings)('custom claim is valid? - %s', (_, value) => {
      expect(claim(value).isValid()).toBeTrue()
    })

    it.each(strings)('invalid custom claim?', (_, value) => {
      expect(claimWrong(value).isInvalid()).toBeTrue()
    })
  })

  describe('Issuer Validation', () => {
    const iss = (value: string) => compare('iss', value)
    const issWrong = (value: string) => compareWrong('iss', value)

    it.each(strings)('"iss" is valid? - %s', (_, value) => {
      expect(iss(value).isValid()).toBeTrue()
    })

    it.each(strings)('invalid "iss"? - %s', (_, value) => {
      expect(issWrong(value).isInvalid()).toBeTrue()
    })
  })

  describe('JWT Identifier Validation', () => {
    const jti = (value: string) => compare('jti', value)
    const jtiWrong = (value: string) => compareWrong('jti', value)

    it.each(strings)('"jti" is valid? - %s', (_, value) => {
      expect(jti(value).isValid()).toBeTrue()
    })

    it.each(strings)('invalid "jti"? - %s', (_, value) => {
      expect(jtiWrong(value).isInvalid()).toBeTrue()
    })
  })

  describe('Subject Validation', () => {
    const sub = (value: string) => compare('sub', value)
    const subWrong = (value: string) => compareWrong('sub', value)

    it.each(strings)('"sub" is valid? - %s', (_, value) => {
      expect(sub(value).isValid()).toBeTrue()
    })

    it.each(strings)('invalid "sub"? - %s', (_, value) => {
      expect(subWrong(value).isInvalid()).toBeTrue()
    })
  })

  describe('Has Property Validation', () => {
    const decoder = parse(create({ email: 'email@example.com' }).with('uid', 42).get())

    it('has prop "uid"?', () => {
      expect(decoder.has('uid')).toBeTrue()
      expect(decoder.has('uid', 42)).toBeTrue()
    })

    it('has prop "email"?', () => {
      expect(decoder.has('email')).toBeTrue()
      expect(decoder.has('email', 'email@example.com')).toBeTrue()
    })

    it('there is no prop "name"?', () => {
      expect(decoder.has('name')).toBeFalse()
      expect(decoder.has('name', 'email@example.com')).toBeFalse()
    })

    it('no has prop "email" with other value?', () => {
      expect(decoder.has('email', 42)).toBeFalse()
    })
  })
})
