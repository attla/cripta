import { Bench } from 'tinybench'
import { Factory } from '@/factory'
import chalk from 'chalk'

const bench = new Bench()

const factory = new Factory({ key: 'secret' })

const payload = { id: 1, name: 'Test', active: true, items: Array(1000).fill('data') }
const encoded = factory.encode(payload)

bench
  .add('Cripta#encode', () => {
    factory.encode(payload)
  })
  .add('Cripta#decode', () => {
    factory.decode(encoded)
  })
  .add('Cripta#encode-decode', () => {
    factory.decode(factory.encode(payload))
  })

await bench.run()

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
    console.log(`🥇 ${chalk.green('Fastest')} → ${chalk.bold(line)}`)
  } else {
    const diff = (((fastest.hz - task.hz) / fastest.hz) * 100).toFixed(2)
    console.log(`   ${line} ${chalk.gray(`(${diff}% slower)`)}`)
  }
})
