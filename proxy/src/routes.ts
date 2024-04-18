import { env } from 'bun'
import pino from 'pino'

import createRouter, { Router } from '~proxy/utils/router.js'

const allowedOrigin = env.PROXY_ALLOWED_ORIGINS

if (allowedOrigin == null)
  throw new Error('Server cannot run without PROXY_ALLOWED_ORIGINS set')

function getResponseHeaders() {
  const responseHeaders = new Headers()
  responseHeaders.set('Content-Type', 'application/xml')
  responseHeaders.set('Access-Control-Allow-Origin', allowedOrigin!)
  responseHeaders.set('Vary', 'Origin')

  return responseHeaders
}

function getErrorMessage(resp: Response): string {
  switch (resp.status) {
    case 401:
    case 403:
      return 'Authentication or authorization required'
    case 429:
      return 'Too many requests, rate-limited'
    default:
      return 400 <= resp.status && resp.status < 500
        ? `Unknown client error occurred: ${resp.status} - ${resp.statusText}`
        : `Server returned an error: ${resp.status} - ${resp.statusText}`
  }
}

function defineRoutes(r: Router): void {
  r.get('proxy', async (req, params) => {
    const proxiedUrl = params.get('url')

    if (proxiedUrl == null) {
      req.logger.error('No URL provided')
      return new Response('No URL Provided', {
        status: 400,
      })
    }

    const response = await fetch(proxiedUrl, { redirect: 'follow' })

    req.logger.info(
      { proxiedStatus: response.status },
      `Received response from proxied url: ${response.status} - ${response.statusText}`,
    )

    if (response.ok) {
      return new Response(response.body, { headers: getResponseHeaders() })
    } else {
      return new Response(getErrorMessage(response), {
        status: response.status,
      })
    }
  })

  r.fallback(async (req) => {
    req.logger.error('Unrecognized path')
    return new Response('Not Found', { status: 404 })
  })
}

export default function compileRouter(logger: pino.Logger<never>) {
  const router = createRouter((r) => {
    r.logger = logger
    defineRoutes(r)
  })

  return router.compile()
}
