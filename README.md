<h1 align="left">Criptλ<br/><a href="https://pr.new/attla/cripta"><img align="right" src="https://developer.stackblitz.com/img/start_pr_dark_small.svg" alt="Start new PR in StackBlitz Codeflow"></a><a href="https://npmjs.com/package/cripta"><img align="right" src="https://img.shields.io/npm/v/cripta.svg" alt="npm package"></a></h1>
<br/>

- [Installation](#install)
- [Usage](#usage)
- [License](#license)

## Install

```bash
# bun
bun i cripta

# pnpm
pnpm i cripta

# npm
npm i cripta

# yarn
yarn i cripta
```

## Usage

```ts
import { cripta } from 'cripta'

const instance = cripta({ key: 'your-secret-key' })

const encoded = instance.encode('hic sunt dracones')
console.log('Encoded object: ', encoded)
console.log('Decoded object: ', instance.decode(encoded))
```

The Cripta can encrypt all primitive types: `array`, `object`, `string`, `number`, `bigint`, `boolean`, `Symbol`, `undefined` and `null`.

See an example of object encryption:

```ts
// encoding
const encoded = instance.encode({
  name: 'John Doe',
  email: 'john@example.com'
})

console.log('Encoded object: ', encoded)

// retrieve the object from encoded value
const decoded = instance.decode(encoded)
console.log('Decoded object: ', decoded)
```

## License

This package is licensed under the [MIT license](https://github.com/attla/cripta/blob/main/LICENSE) © [Zunq](https://zunq.com)
