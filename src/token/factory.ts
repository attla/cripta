import { Creator } from './creator'
import { Parser } from './parser'

export class Factory {
  static create(): Creator {
    return new Creator()
  }

  static parse(token: string): Parser {
    return new Parser(token)
  }
}
