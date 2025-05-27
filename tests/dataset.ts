import { sha256 } from '@/hash'

export const strings = {
  alfa: 'Now I am become Death, the destroyer of worlds.',
  alfanum: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  special: '`~!@#$%^&*()\\][+={}/|:;"\'<>,.?-_',
  acents: 'àáâãäÀÁÂÃÄ çÇ èéêëÈÉÊË ìíîïÌÍÎÏ ñÑ òóôõöÒÓÔÕÖ ùúûüÙÚÛÜ ýÿÝ',
  japanese: '今、私は世界の破壊者である死になりました。',
  mandarin: '现在我变成了死神，世界的毁灭者。',
  hindi: 'अब मैं मृत्यु बन गया हूँ, संसारों का नाश करने वाला।',
  'string numeric (FALSE)': '0',
  'string numeric (TRUE)': '1',
}

export const string = Object.values(strings)[Math.floor(Math.random() * Object.values(strings).length)]

export const types: { [key: string]: any } = {
  ...strings,
  int: 42,
  float: 4.2,
  array: [4, 2],
  obj: { four: 4, two: 2 },
  false: false,
  true: true,
  'int (FALSE)': 0,
  'int (TRUE)': 1,
  'array (empty)': [],
  'obj (empty)': {},
  null: null,
  'null (byte)': String.fromCharCode(0),
  'zero (byte)': 0x0,
  'null string (byte)': '\x00',
  'separator (byte)': '\x1c',
  byte: 0x2A,
  others: " \t\n\r\0\x0B\x0c\xa0"
}

export const key = 'test-key'
export const config = { key, entropy: 8 }
export const secret = sha256(config.key, 'buffer')
