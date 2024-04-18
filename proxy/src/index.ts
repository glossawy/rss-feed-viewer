import { pino } from 'pino'

import compileRouter from './routes.js'

const rootLogger = pino({
  name: 'proxy',
  timestamp: pino.stdTimeFunctions.isoTime,
})

Bun.serve({
  fetch: compileRouter(rootLogger),
})
