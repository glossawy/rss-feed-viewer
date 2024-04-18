import { useCallback } from 'react'

import { RequestProxyContext } from '@app/contexts/requestProxy'
import { useAppToggles } from '@app/hooks/appToggles'

type Props = { proxyUrl: URL; children: React.ReactNode }

export default function RequestProxyingProvider({ proxyUrl, children }: Props) {
  const { toggles, setToggle } = useAppToggles()
  const isProxying = toggles.proxy

  const setUseProxy = useCallback(
    (enabled: boolean) => {
      setToggle('proxy', enabled)
    },
    [setToggle],
  )

  const getRequestUrl = useCallback(
    (url: string) => {
      if (isProxying) {
        const newUrl = new URL(proxyUrl)
        newUrl.pathname = '/proxy'
        newUrl.searchParams.set('url', url)

        return newUrl.toString()
      } else {
        return url
      }
    },
    [isProxying],
  )

  return (
    <RequestProxyContext.Provider
      value={{ isProxying, getRequestUrl, setUseProxy }}
    >
      {children}
    </RequestProxyContext.Provider>
  )
}
