export interface ConfigOptions {
  key?: string,
  entropy?: number,
  baseAlphabet?: string,
  alphabet?: string,
  seed?: number,
}

export type AcceptedValue = null | boolean | string | number | bigint | Array<any> | object | Symbol | undefined

export const INDEX_TYPE = [
  'null',
  'boolean',
  'string',
  // 'number',
  'int',
  'float',
  'bigint',
  'array',
  'object',
  'symbol',
  'undefined',
  // 'function',
] as const

export const TYPE: Record<typeof INDEX_TYPE[number], number> = Object.fromEntries(
  INDEX_TYPE.map((type, index) => [type, index])
) as Record<typeof INDEX_TYPE[number], number>
