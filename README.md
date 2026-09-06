<h1 align="left">Criptλ<br/><a href="https://pr.new/attla/cripta"><img align="right" src="https://developer.stackblitz.com/img/start_pr_dark_small.svg" alt="Start new PR in StackBlitz Codeflow"></a><a href="https://npmjs.com/package/cripta"><img align="right" src="https://img.shields.io/npm/v/cripta.svg" alt="npm package"></a></h1>
<br/>

- [Installation](#install)
- [Usage](#usage)
- [License](#license)

## Install

```bash
bun i cripta
```

## Usage

```ts
import { config, encode, decode } from 'cripta'

const opts = await config({ key: 'your-secret-key' })

const encoded = await encode('hic sunt dracones', opts)
console.log('Encoded: ', encoded)
console.log('Decoded: ', await decode(encoded, opts))
```

The Cripta can encrypt all primitive types: `array`, `object`, `string`, `number`, `bigint`, `boolean`, `Symbol`, `undefined` and `null`.

See an example of object encryption:

```ts
// encoding
const encoded = await encode({
  name: 'John Doe',
  email: 'john@example.com'
}, opts)

console.log('Encoded object: ', encoded)

// retrieve the object from encoded value
const decoded = await decode(encoded, opts)
console.log('Decoded object: ', decoded)
```

## License

This package is licensed under the [MIT license](https://github.com/attla/cripta/blob/main/LICENSE) © [HUB](https://hub.bi)
