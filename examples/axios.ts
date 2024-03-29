import axios from 'axios'
import type { Builder, Command, Describe, Handler } from 'landlubber'

import { serializeUrlSearchParams } from '@seamapi/url-search-params-serializer'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Options {}

export const command: Command = 'axios'

export const describe: Describe = 'Serialize Axios params'

export const builder: Builder = {}

export const handler: Handler<Options> = async ({ logger }) => {
  const { data } = await axios.get('https://httpbin.org/get', {
    paramsSerializer: serializeUrlSearchParams,
    params: {
      a: 'bar',
      b: 2,
      c: true,
      d: null,
      e: ['a', 2],
      f: [],
    },
  })
  logger.info({ data }, 'Response')
}
