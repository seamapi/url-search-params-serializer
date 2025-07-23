import { Temporal } from '@js-temporal/polyfill'
import axios from 'axios'
import type { Builder, Command, Describe, Handler } from 'landlubber'

import { serializeUrlSearchParams } from '@seamapi/url-search-params-serializer'

interface Options {}

export const command: Command = 'axios'

export const describe: Describe = 'Serialize Axios params'

export const builder: Builder = {}

export const handler: Handler<Options> = async ({ logger }) => {
  const { data } = await axios.get('https://httpbin.org/get', {
    paramsSerializer: serializeUrlSearchParams,
    params: {
      a: 'bar',
      b: 2.3,
      c: true,
      d: null,
      e: ['a', 2],
      f: [],
      g: new Date(),
      h: Temporal.Now.instant(),
      i: { foo: 1, bar: { baz: 2, fizz: [1, 'a'] } },
    },
  })
  logger.info({ data }, 'Response')
}
