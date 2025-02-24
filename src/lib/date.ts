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

interface TemporalInstantLike {
  epochMilliseconds: number
}

export const isTemporalInstantLike = (v: unknown): v is TemporalInstantLike => {
  if (v == null) return false
  if (typeof v !== 'object') return false
  if (!('epochMilliseconds' in v)) return false
  try {
    if (typeof v.epochMilliseconds !== 'number') return false
    if (isNaN(v.epochMilliseconds)) return false
    return true
  } catch {
    return false
  }
}
