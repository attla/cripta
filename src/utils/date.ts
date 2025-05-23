export default class DateUtil {
  static timestamp(date: number | Date | null = null): number {
    if (date === null || date === undefined) {
      return 0
    } else if (typeof date === 'number') {
      return date
    } else if (date instanceof Date) {
      return Math.floor(date.getTime() / 1000)
    }

    return 0
  }

  static minuteToSecond(date: number | Date | null = null): number {
    return DateUtil.timestamp(date) || Math.floor(Date.now() / 1000)
  }

  static strToDate(str: string): Date {
    return new Date(str)
  }

  static now(): number {
    return Math.floor(Date.now() / 1000)
  }

  static addSeconds(timestamp: number, seconds: number): number {
    return timestamp + seconds
  }

  static addMinutes(timestamp: number, minutes: number): number {
    return timestamp + (minutes * 60)
  }

  static addHours(timestamp: number, hours: number): number {
    return timestamp + (hours * 3600)
  }

  static addDays(timestamp: number, days: number): number {
    return timestamp + (days * 86400)
  }
}
