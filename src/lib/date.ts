interface DateLike {
  toISOString: () => string
}

export const isDateLike = (v: unknown): v is DateLike => {
  if (v == null) return false
  if (typeof v !== 'object') return false
  if (
    v instanceof Date ||
    Object.prototype.toString.call(v) === '[object Date]'
  ) {
    return 'toISOString' in v
  }
  return false
}
