import { string, key } from './dataset'
import { strings, types } from './testcase'
import { config, parse as $parse, create as $create, Claims} from '@/token'
import type { Config } from '@/.'
import { Timestamp } from 't0n'

const opt = await config({key})
const optSame = await config({key, entropy: 0})

const parse = async (token: string, conf: Config = opt, claims: Claims = {}) => $parse(conf, token, claims)
const create = async (token: string, conf: Config = opt, claims: Claims = {}) => $create(conf, token, claims)
const parseCreate = async (token: string, conf: Config = opt, claims: Claims = {}, expect: Claims = {}) => parse(await create(token, conf, claims), conf, expect)
const compare = async (token: string, key: string, ...val: any[]) => parseCreate(token, undefined, { [key]: val[0] }, { [key]: val.length > 1 ? val[1] : val[0] })


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

type TestDate = ([string, number])[]
type TestTwoDate = ([string, [number, number]])[]
const beforeDates: TestDate = dateLabels.map(label => [label, Timestamp.timestamp(new Date(Date.now() - parseTime(label)))])
const afterDates: TestDate = dateLabels.map(label => [label, Timestamp.timestamp(new Date(Date.now() + parseTime(label)))])
const beforeAtDates: TestTwoDate = dateLabels.map((label, i) => [label, [afterDates[i][1], beforeDates[i][1]]])
const afterAtDates: TestTwoDate = dateLabels.map((label, i) => [label, [beforeDates[i][1], afterDates[i][1]]])

describe('Token', () => {

  describe('Creation', () => {
    it.each(strings)('is valid token type? [default secret] - %s', async (_, value) => {
      expect((await parseCreate(value)).body).toStrictEqual(value)
    })

    it.each(strings)('is valid token type? [secret] - %s', (_, value) => {
      strings.forEach(async ([_, secret]) => expect((await parseCreate(value, await config({key: secret}))).body).toStrictEqual(value))
    })

    it.each(strings)('each time generate a unique token? - %s', async (_, value) => {
      expect(await create(value)).not.toBe(await create(value))
    })

    it.each(types)('always generate a unique token? - %s', async (_, value) => {
      const tokens = await Promise.all(Array.from({ length: 6 }, async () => await create(value)))
      expect(new Set(tokens).size).toBe(6)
    })

    it.each(types)('always generate a same token? - %s', async (_, value) => {
      const tokens = await Promise.all(Array.from({ length: 6 }, async () => await create(value, optSame)))
      expect(new Set(tokens).size).toBe(1)
    })

    it.each(types)('have the correct value type? - %s', async (_, value) => {
      const parsed = await parseCreate(value)

      expect(parsed.valid).toBeTrue()
      expect(typeof parsed.body).toBe(typeof value)
      expect(parsed.body).toEqual(value)
    })

    it.each(types)('invalid if decoded with wrong secret? - %s', async (_, value) => {
      const token = await create(value)
      const parsed = await parse(token, optSame)

      expect(parsed.valid).toBeFalse()
      expect(typeof parsed.body).not.toBe(typeof value)
      expect(parsed.body).not.toEqual(value)
    })
  })

  describe('Expiration Validation', () => {
    it.each(afterDates)('"exp" is valid? - %s', async (_, date) => {
      expect((await compare(string, 'exp', date, undefined)).valid).toBeTrue()
    })

    it.each(beforeAtDates)('"exp" "at date" is valid? - %s', async (_, [date, now]) => {
      expect((await compare(string, 'exp', date, now)).valid).toBeTrue()
    })

    it.each(beforeDates)('invalid "exp"? - %s', async (_, date) => {
      expect((await compare(string, 'exp', date, undefined)).valid).toBeFalse()
    })

    it.each(afterAtDates)('invalid "exp" "at date"? - %s', async (_, [date, now]) => {
      expect((await compare(string, 'exp', date, now)).valid).toBeFalse()
    })
  })

  describe('Not Before Validation', () => {
    it.each(beforeDates)('"nbf" date is valid? - %s', async (_, date) => {
      expect((await compare(string, 'nbf', date, undefined)).valid).toBeTrue()
    })

    it.each(afterAtDates)('"nbf" at date is valid? - %s', async (_, [date, now]) => {
      expect((await compare(string, 'nbf', date, now)).valid).toBeTrue()
    })

    it.each(afterDates)('invalid "nbf"? - %s', async (_, date) => {
      expect((await compare(string, 'nbf', date, undefined)).valid).toBeFalse()
    })

    it.each(beforeAtDates)('invalid "nbf" at date? - %s', async (_, [date, now]) => {
      expect((await compare(string, 'nbf', date, now)).valid).toBeFalse()
    })
  })

  describe('Claim Validation', () => {
    it.each(strings)('custom claim is valid? - %s', async (_, value) => {
      expect((await compare(value, 'uid', value)).valid).toBeTrue()
    })

    it.each(strings)('invalid custom claim?', async (_, value) => {
      expect((await compare(value, 'uid', value, key)).valid).toBeFalse()
    })
  })

})
