import { Factory } from './factory'
import { Config } from './config'
import type { ConfigOptions } from './types'

export { Config, Factory }
export * from './types'

export const cripta = (config?: ConfigOptions | Config): Factory => new Factory(config)
