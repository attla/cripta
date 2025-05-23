import { Factory as Cripta } from './factory'
import { Config } from './config'
import type { ConfigOptions } from './types'

export { Config, Cripta }
export * from './types'

export const cripta = (config?: ConfigOptions | Config): Cripta => new Cripta(config)

export * from './token'
