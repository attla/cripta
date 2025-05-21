
export type VALUE<T = any> = T | null | undefined | Symbol

export default class Attempt<T = any> {
  static readonly UNDEFINED = Symbol('UNDEFINED')

  static resolve<T>(callback: () => T, defaultValue?: T): Attempt<T> {
    let value: VALUE<T> = Attempt.UNDEFINED
    try { value = callback() } catch (e) {}
    return new Attempt<T>(value, defaultValue)
  }

  static defined(value: any): boolean {
    return !this.undefined(value) && !this.isUnset(value)
  }
  static undefined(value: any): boolean {
    return value === Attempt.UNDEFINED || this.isUnset(value)
  }
  static isUnset(value: any): boolean {
    return value === null || value === undefined
  }

  private value: VALUE<T>
  private _default?: T

  constructor(
    value: VALUE<T>,
    defaultValue?: T
  ) {
    this.value = value
    this._default = defaultValue
  }

  or(callback: () => T): Attempt<T> {
    return Attempt.defined(this.value) ? this : Attempt.resolve(callback, this._default)
  }

  default(defaultValue: T): this {
    this._default = defaultValue
    return this
  }

  tap(callback?: (value: T | null | undefined) => void): this {
    const value = this.get()
    callback?.(value)
    return this
  }

  get(): T {
    return Attempt.undefined(this.value)
      ? this._default as T
      : this.value as T
  }

  getOrThrow(error?: Error): T {
    const value = this.get()
    if (Attempt.undefined(value))
      throw error ?? new Error('Value is null or undefined')

    return value
  }
}
