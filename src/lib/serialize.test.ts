import test from 'ava'

import { serializeUrlSearchParams, updateUrlSearchParams } from './serialize.js'

test('serializeUrlSearchParams', (t) => {
  t.is(serializeUrlSearchParams({ foo: 'd', bar: 2 }), 'bar=2&foo=d')
})

test('updateUrlSearchParams', (t) => {
  const searchParams = new URLSearchParams()
  updateUrlSearchParams(searchParams, { foo: 'd', bar: 2 })
  t.is(searchParams.toString(), 'bar=2&foo=d')
})
