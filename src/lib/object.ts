export const isPlainObject = (v: unknown): v is Record<string, unknown> => {
  if (v == null) return false
  if (typeof v !== 'object') return false
  const proto = Object.getPrototypeOf(v)
  if (proto === null) return true
  if (proto === Object.prototype) return true
  return false
}
