type Params = Record<string, unknown>

export const serializeUrlSearchParams = (params: Params): string => {
  const searchParams = new URLSearchParams()
  updateUrlSearchParams(searchParams, params)
  return searchParams.toString()
}

export const updateUrlSearchParams = (
  searchParams: URLSearchParams,
  params: Record<string, unknown>,
): void => {
  for (const [name, value] of Object.entries(params)) {
    if (value == null) continue

    if (Array.isArray(value)) {
      if (value.length === 0) searchParams.set(name, '')
      if (value.length === 1 && value[0] === '') {
        throw new UnserializableParamError(
          name,
          `is a single element array containing the empty string which is unsupported because it serializes to the empty array`,
        )
      }
      for (const v of value) {
        searchParams.append(name, serialize(name, v))
      }
      continue
    }

    searchParams.set(name, serialize(name, value))
  }

  searchParams.sort()
}

const serialize = (k: string, v: unknown): string => {
  if (typeof v === 'string') return v.toString()
  if (typeof v === 'number') return v.toString()
  if (typeof v === 'bigint') return v.toString()
  if (typeof v === 'boolean') return v.toString()
  throw new UnserializableParamError(k, `is a ${typeof v}`)
}

export class UnserializableParamError extends Error {
  constructor(name: string, message: string) {
    super(`Could not serialize parameter: '${name}' ${message}`)
    this.name = this.constructor.name
  }
}
