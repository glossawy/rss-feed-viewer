import { Server } from 'bun'
import pino from 'pino'

import generateHexId from './generateHexId'
import promisify from './promisify'

type RouteHandler = (
  req: Request & { logger: pino.Logger<never> },
  params: Params,
) => Response | Promise<Response>

type Route = {
  path: string
  handler: RouteHandler
}

type Params = {
  get: (key: string) => string | null
}

type CompiledRouter = (req: Request, server: Server) => Promise<Response>

function getClientIp(req: Request, server: Server): string | null {
  return (
    req.headers.get('X-Forwarded-For') ||
    req.headers.get('X-Real-IP') ||
    server.requestIP(req)?.address ||
    null
  )
}

export class Router {
  root: string
  routes: Route[]
  fallbackHandler: RouteHandler | null
  requestLogger: pino.Logger<never>

  constructor(root: string) {
    this.root = root
    this.routes = []
    this.fallbackHandler = null
    this.requestLogger = pino()
  }

  set logger(logger: pino.Logger<never>) {
    this.requestLogger = logger
  }

  get absoluteRoutes(): Route[] {
    return this.routes.map(({ path, handler }) => ({
      path: `${this.root}${path}`,
      handler,
    }))
  }

  compile(): CompiledRouter {
    return async (rawRequest: Request, server: Server) => {
      const url = new URL(rawRequest.url)
      const path = url.pathname
      const clientIp = getClientIp(rawRequest, server)

      const route = this.absoluteRoutes.find((r) => r.path === path)
      const logger = this.requestLogger.child({
        requestId: generateHexId(),
        clientIp,
        path,
        params: Object.fromEntries(url.searchParams.entries()),
      })

      const req = { ...rawRequest, logger }

      logger.info('Routing request')

      if (route) {
        return await promisify(route.handler(req, url.searchParams))
      } else {
        if (this.fallbackHandler)
          return this.fallbackHandler(req, url.searchParams)
        else throw new Error(`Unhandled route with no fallback: ${path}`)
      }
    }
  }

  get(path: string, handler: RouteHandler) {
    this.routes.push({ path, handler })
  }

  fallback(handler: RouteHandler) {
    this.fallbackHandler = handler
  }
}

type CreateRouterOptions = {
  root?: string
}

export default function createRouter(
  build: (router: Router) => void,
  routerOptions?: CreateRouterOptions,
): Router {
  const options: Required<CreateRouterOptions> = Object.assign(
    { root: '/' },
    routerOptions || {},
  )

  const router = new Router(options.root)
  build(router)

  return router
}
