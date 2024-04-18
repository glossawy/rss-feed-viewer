import { env } from 'bun'
import { pino } from 'pino'

import compileRouter from './routes.js'

const rootLogger = pino({
  name: 'proxy',
  timestamp: pino.stdTimeFunctions.isoTime,
})

const hostname = env.PROXY_HOST || '0.0.0.0'
const port = env.PROXY_PORT || '3000'
const appEnv = env.NODE_ENV || 'production'

Bun.serve({
  port,
  hostname,
  development: appEnv === 'development',
  fetch: compileRouter(rootLogger),
})

rootLogger.info(`Proxy server started on ${hostname}:${port} in ${appEnv} mode`)
