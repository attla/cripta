export interface Baggable<T = any> {
  all(): Record<string, T>,
  keys(): string[],
  has(key: string): boolean,
  add(data: Record<string, T>): void,
  replace(data: Record<string, T>): void,
  get(key: string, defaultValue?: T): T,
  remove(key: string): void,
  set(key: string, value: T): void,
  clear(): void,
  values(): T[],
  toArray(): [string, T][],
  toJson(options?: number): string,
}

export default class DataBag<T = any> implements Baggable<T> {
  protected data: Record<string, T> = {}

  constructor(data: Record<string, T> = {}) {
    this.data = { ...data }
  }

  public all(): Record<string, T> {
    return { ...this.data }
  }

  public has(key: string): boolean {
    return key in this.data
  }

  public add(data: Record<string, T> = {}): void {
    this.data = { ...this.data, ...data }
  }

  public replace(data: Record<string, T> = {}): void {
    this.data = { ...data }
  }

  public get(key: string, defaultValue?: T): T {
    return this.has(key) ? this.data[key] : defaultValue as T
  }

  public set(key: string, value: T): void {
    if (this.has(key) && typeof value != typeof this.data[key])
      throw new TypeError(`Type mismatch for key ${key}. Expected ${typeof this.data[key]}, got ${typeof value}`)

    this.data[key] = value
  }

  public remove(key: string): void {
    delete this.data[key]
  }

  public clear(): void {
    this.data = {}
  }

  public get length(): number {
    return this.keys().length
  }
  public get size(): number {
    return this.length
  }

  public keys(): string[] {
    return Object.keys(this.data)
  }

  public values(): T[] {
    return Object.values(this.data)
  }

  public toArray(): [string, T][] {
    return Object.entries(this.data)
  }

  public jsonSerialize(): Record<string, T> {
    return this.all()
  }

  public toJson(options: number = 0): string {
    return JSON.stringify(this.jsonSerialize(), null, options)
  }

  public [Symbol.iterator](): IterableIterator<[string, T]> {
    return Object.entries(this.data)[Symbol.iterator]()
  }
}
