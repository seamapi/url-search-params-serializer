#!/usr/bin/env tsx

import landlubber from 'landlubber'

import * as axios from './axios.js'

const commands = [axios]

await landlubber(commands).parse()
