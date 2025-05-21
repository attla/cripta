export default function toInt(data: any[] | string | number): number {
  if (typeof data === 'number' && Number.isInteger(data))
    return data

  const jsonString = JSON.stringify(data)
  // Simplified implementation without MD5 (less accurate than the original)
  // TODO: add o md5 and stable-hash
  const numericString = jsonString.replace(/\D/g, '')
  return numericString ? parseInt(numericString.slice(0, 16), 10) : 0
}
