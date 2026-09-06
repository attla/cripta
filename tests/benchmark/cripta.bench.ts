import { Bench } from 'tinybench'
import { bold, gray, green } from 't0n/color'

import { hash, compare } from '@/hash'
import { create, parse } from '@/token'
import { config, encode, decode } from '@/.'

const bench = new Bench()

const key = 'secret'
const conf = await config({ key })

const body = { id: 1, name: 'Test', active: true, items: Array(1000).fill('data') }
const encoded = await encode(body, conf)
const tokenEncoded = await create(conf, body)

const hashed = await hash(key)

await bench
  .add('Cripta#encode', async () => {
    await encode(body, conf)
  })
  .add('Cripta#decode', async () => {
    await decode(encoded, conf)
  })
  .add('Cripta#encode-decode', async () => {
    await decode(await encode(body, conf), conf)
  })
  // Token
  .add('Token#create', async () => {
    await create(conf, body)
  })
  .add('Token#parse', async () => {
    await parse(conf, tokenEncoded)
  })
  .add('Token#encode-decode', async () => {
    await parse(conf, await create(conf, body))
  })
  // Hash
  .add('Hash#hash', async () => {
    await hash(key)
  })
  .add('Hash#compare', async () => {
    await compare(key, hashed)
  })
  .run()

const tasks = bench.tasks
  .map(task => {
    const r = task.result
    return {
      name: task.name,
      hz: r?.hz ?? 0,
      rme: r?.rme ?? 0,
      samples: r?.samples.length ?? 0
    }
  })
  .sort((a, b) => b.hz - a.hz)

const fastest = tasks[0]

console.log('\n')

tasks.forEach((task, index) => {
  const ops = task.hz.toFixed(2)
  const rme = task.rme.toFixed(2)
  const line = `${task.name.padEnd(24)} ${ops} ops/sec ±${rme}% (${task.samples} samples)`

  if (index === 0) {
    console.log(`🥇 ${green('Fastest')} → ${bold(line)}`)
  } else {
    const diff = (((fastest.hz - task.hz) / fastest.hz) * 100).toFixed(2)
    console.log(`   ${line} ${gray(`(${diff}% slower)`)}`)
  }
})
