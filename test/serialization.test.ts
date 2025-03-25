import { Temporal } from '@js-temporal/polyfill'
import test from 'ava'

import {
  serializeUrlSearchParams,
  UnserializableParamError,
} from '@seamapi/url-search-params-serializer'

test('serializes empty object', (t) => {
  t.is(serializeUrlSearchParams({}), '')
})

test('serializes string', (t) => {
  t.is(serializeUrlSearchParams({ foo: 'd' }), 'foo=d')
  t.is(serializeUrlSearchParams({ foo: 'null' }), 'foo=null')
  t.is(serializeUrlSearchParams({ foo: 'undefined' }), 'foo=undefined')
  t.is(serializeUrlSearchParams({ foo: '0' }), 'foo=0')
})

test('serializes number', (t) => {
  t.is(serializeUrlSearchParams({ foo: 1 }), 'foo=1')
  t.is(serializeUrlSearchParams({ foo: 23.8 }), 'foo=23.8')
})

test('serializes boolean', (t) => {
  t.is(serializeUrlSearchParams({ foo: true }), 'foo=true')
  t.is(serializeUrlSearchParams({ foo: false }), 'foo=false')
})

test('removes undefined params', (t) => {
  t.is(serializeUrlSearchParams({ bar: undefined }), '')
  t.is(serializeUrlSearchParams({ foo: 1, bar: undefined }), 'foo=1')
})

test('serializes null params', (t) => {
  t.is(serializeUrlSearchParams({ bar: null }), 'bar=')
  t.is(serializeUrlSearchParams({ foo: 1, bar: null }), 'bar=&foo=1')
})

test('serializes empty array params', (t) => {
  t.is(serializeUrlSearchParams({ bar: [] }), 'bar=')
  t.is(serializeUrlSearchParams({ foo: 1, bar: [] }), 'bar=&foo=1')
})

test('serializes array params with one value', (t) => {
  t.is(serializeUrlSearchParams({ bar: ['a'] }), 'bar=a')
  t.is(serializeUrlSearchParams({ foo: 1, bar: ['a'] }), 'bar=a&foo=1')
})

test('serializes array params with many values', (t) => {
  t.is(
    serializeUrlSearchParams({ foo: 1, bar: ['a', '2'] }),
    'bar=a&bar=2&foo=1',
  )
  t.is(
    serializeUrlSearchParams({ foo: 1, bar: ['null', '2', 'undefined'] }),
    'bar=null&bar=2&bar=undefined&foo=1',
  )
})

test('serializes Date', (t) => {
  t.is(
    serializeUrlSearchParams({ foo: 1, now: new Date(1740422679000) }),
    'foo=1&now=2025-02-24T18%3A44%3A39.000Z',
  )
})

test('serializes Temporal.Instant', (t) => {
  t.is(
    serializeUrlSearchParams({
      foo: 1,
      now: Temporal.Instant.fromEpochMilliseconds(1740422679000),
    }),

    'foo=1&now=2025-02-24T18%3A44%3A39.000Z',
  )
})

test('serializes plain objects', (t) => {
  t.is(
    serializeUrlSearchParams({
      foo: 1,
      bar: { baz: 'a' },
    }),
    'bar.baz=a&foo=1',
  )

  t.is(
    serializeUrlSearchParams({
      foo: 1,
      bar: { baz: { x: { z: 1 } } },
    }),
    'bar.baz.x.z=1&foo=1',
  )

  t.is(
    serializeUrlSearchParams({
      foo: 1,
      bar: { baz: { x: { z: null } } },
    }),
    'bar.baz.x.z=&foo=1',
  )

  t.is(
    serializeUrlSearchParams({
      foo: 1,
      bar: { baz: [1, 'a'] },
    }),
    'bar.baz=1&bar.baz=a&foo=1',
  )
})

test('cannot serialize keys containing a .', (t) => {
  t.throws(() => serializeUrlSearchParams({ 'foo.bar': 1 }), {
    instanceOf: UnserializableParamError,
  })
  t.throws(() => serializeUrlSearchParams({ foo: { 'bar.baz': 1 } }), {
    instanceOf: UnserializableParamError,
  })
})

test('cannot serialize functions', (t) => {
  t.throws(() => serializeUrlSearchParams({ foo: () => {} }), {
    instanceOf: UnserializableParamError,
  })
})

test('cannot serialize non-plain objects', (t) => {
  class Foo {
    bar: string
    constructor() {
      this.bar = 'a'
    }
  }
  t.throws(() => serializeUrlSearchParams({ foo: new Foo() }), {
    instanceOf: UnserializableParamError,
  })
})

test('cannot serialize array params with unserializable values', (t) => {
  t.throws(() => serializeUrlSearchParams({ foo: [''] }), {
    instanceOf: UnserializableParamError,
  })
  t.throws(() => serializeUrlSearchParams({ bar: ['a', null] }), {
    instanceOf: UnserializableParamError,
  })
  t.throws(() => serializeUrlSearchParams({ bar: ['a', undefined] }), {
    instanceOf: UnserializableParamError,
  })
  t.throws(() => serializeUrlSearchParams({ bar: ['a', ['s']] }), {
    instanceOf: UnserializableParamError,
  })
  t.throws(() => serializeUrlSearchParams({ bar: ['a', []] }), {
    instanceOf: UnserializableParamError,
  })
  t.throws(() => serializeUrlSearchParams({ bar: ['a', ['']] }), {
    instanceOf: UnserializableParamError,
  })
  t.throws(() => serializeUrlSearchParams({ bar: ['a', {}] }), {
    instanceOf: UnserializableParamError,
  })
  t.throws(() => serializeUrlSearchParams({ bar: ['a', { x: 2 }] }), {
    instanceOf: UnserializableParamError,
  })
  t.throws(() => serializeUrlSearchParams({ bar: ['a', () => {}] }), {
    instanceOf: UnserializableParamError,
  })
  t.throws(() => serializeUrlSearchParams({ foo: 1, bar: ['', 'a', ''] }), {
    instanceOf: UnserializableParamError,
  })
  t.throws(() => serializeUrlSearchParams({ foo: 1, bar: ['', 'a', '2'] }), {
    instanceOf: UnserializableParamError,
  })
  t.throws(() => serializeUrlSearchParams({ foo: 1, bar: ['', '', ''] }), {
    instanceOf: UnserializableParamError,
  })
})
