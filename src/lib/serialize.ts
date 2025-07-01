import { isDateLike, isTemporalInstantLike } from './date.js'
import { isPlainObject } from './object.js'

export type Params = Record<string, unknown>

export const serializeUrlSearchParams = (params: Params): string => {
  const searchParams = new URLSearchParams()
  updateUrlSearchParams(searchParams, params)
  return searchParams.toString()
}

export const updateUrlSearchParams = (
  searchParams: URLSearchParams,
  params: Record<string, unknown>,
): void => {
  nestedUpdateUrlSearchParams(searchParams, params, [])
  searchParams.sort()
}

const nestedUpdateUrlSearchParams = (
  searchParams: URLSearchParams,
  params: Record<string, unknown>,
  path: string[],
): void => {
  for (const [key, value] of Object.entries(params)) {
    if (key.includes('.')) {
      throw new UnserializableParamError(
        key,
        'contains one or more dots "." in its name which is unsupported',
      )
    }

    const currentPath = [...path, key]
    if (isPlainObject(value)) {
      nestedUpdateUrlSearchParams(searchParams, value, currentPath)
      return
    }

    const name = currentPath.join('.')

    if (value == null && value !== null) {
      continue
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        searchParams.set(name, '')
        continue
      }

      if (value.length === 1 && value[0] === '') {
        throw new UnserializableParamError(
          name,
          'is a single element array containing the empty string which is unsupported',
        )
      }
      if (value.some((v) => v === '')) {
        throw new UnserializableParamError(
          name,
          'is an array containing the empty string which is unsupported',
        )
      }
      if (value.some((v) => v == null)) {
        throw new UnserializableParamError(
          name,
          'is an array containing null or undefined values which is unsupported',
        )
      }
      for (const v of value) {
        searchParams.append(name, serialize(name, v))
      }
      continue
    }

    searchParams.set(name, serialize(name, value))
  }
}

const serialize = (k: string, v: unknown): string => {
  if (v === null) return ''
  if (typeof v === 'string') {
    if (v.length === 0) {
      throw new UnserializableParamError(
        k,
        'is the empty string which is unsupported',
      )
    }
    return v.toString()
  }
  if (typeof v === 'number') {
    if (
      isNaN(v) ||
      v === Infinity ||
      v === -Infinity ||
      v.toString() === 'NaN' ||
      v.toString() === 'Infinity' ||
      v.toString() === '-Infinity'
    ) {
      throw new UnserializableParamError(k, `is ${v}`)
    }
    return v.toString()
  }
  if (typeof v === 'bigint') return v.toString()
  if (typeof v === 'boolean') return v.toString()
  if (isDateLike(v)) return v.toISOString()
  if (isTemporalInstantLike(v)) {
    return new Date(v.epochMilliseconds).toISOString()
  }
  throw new UnserializableParamError(k, `is a ${typeof v}`)
}

export class UnserializableParamError extends Error {
  constructor(name: string, message: string) {
    super(`Could not serialize parameter: '${name}' ${message}`)
    this.name = this.constructor.name
  }
}
