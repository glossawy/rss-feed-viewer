import { createContext } from 'react'

type RequestProxyState = {
  isProxying: boolean
  getRequestUrl: (url: string) => string
  setUseProxy: (useProxy: boolean) => void
}

export const RequestProxyContext = createContext<RequestProxyState>({
  isProxying: false,
  getRequestUrl: (url) => url,
  setUseProxy() {
    console.warn('Attempted to set proxy use without context provided')
  },
})
