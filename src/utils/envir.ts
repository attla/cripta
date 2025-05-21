import Attempt from './attempt'
import DataBag from './databag'

export default class Envir {
  private static _memory: DataBag

  private static memory(): DataBag {
    if (!this._memory)
      this._memory = new DataBag()

    return this._memory
  }

  static has(key: string): boolean {
    return Attempt.UNDEFINED !== this.get(key, Attempt.UNDEFINED)
  }

  static get<T = any>(key: string, defaultValue?: T): T | undefined {
    if (this.memory().has(key))
      return this.memory().get(key, defaultValue) as T

    const envValue = process.env[key]
    return envValue !== undefined ? envValue as T : defaultValue
  }

  static set<T = any>(key: string, value: T): void {
    this.memory().set(key, value)
  }

  static remove(key: string): void {
    this.memory().remove(key)
  }
}
