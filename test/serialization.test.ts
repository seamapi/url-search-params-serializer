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

test('removes null params', (t) => {
  t.is(serializeUrlSearchParams({ bar: null }), '')
  t.is(serializeUrlSearchParams({ foo: 1, bar: null }), 'foo=1')
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
  t.is(
    serializeUrlSearchParams({ foo: 1, bar: ['', '', ''] }),
    'bar=&bar=&bar=&foo=1',
  )
  t.is(
    serializeUrlSearchParams({ foo: 1, bar: ['', 'a', '2'] }),
    'bar=&bar=a&bar=2&foo=1',
  )
  t.is(
    serializeUrlSearchParams({ foo: 1, bar: ['', 'a', ''] }),
    'bar=&bar=a&bar=&foo=1',
  )
})

test('cannot serialize single element array params with empty string', (t) => {
  t.throws(() => serializeUrlSearchParams({ foo: [''] }), {
    instanceOf: UnserializableParamError,
  })
})

test('cannot serialize unserializable values', (t) => {
  t.throws(() => serializeUrlSearchParams({ foo: {} }), {
    instanceOf: UnserializableParamError,
  })
  t.throws(() => serializeUrlSearchParams({ foo: { x: 2 } }), {
    instanceOf: UnserializableParamError,
  })
  t.throws(() => serializeUrlSearchParams({ foo: () => {} }), {
    instanceOf: UnserializableParamError,
  })
})

test('cannot serialize array params with unserializable values', (t) => {
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
  t.throws(() => serializeUrlSearchParams({ bar: ['a', {}] }), {
    instanceOf: UnserializableParamError,
  })
  t.throws(() => serializeUrlSearchParams({ bar: ['a', { x: 2 }] }), {
    instanceOf: UnserializableParamError,
  })
  t.throws(() => serializeUrlSearchParams({ bar: ['a', () => {}] }), {
    instanceOf: UnserializableParamError,
  })
})
