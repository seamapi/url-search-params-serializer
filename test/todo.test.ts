import test from 'ava'

import { todo } from '@seamapi/url-search-params-serializer'

test('todo: returns argument', (t) => {
  t.is(todo('todo'), 'todo', 'returns input')
})
