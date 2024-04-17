import { useLocalStorage } from '@mantine/hooks'
import { useCallback } from 'react'

import { RequestProxyContext } from '@app/contexts/requestProxy'
import { LocalStorageKeys } from '@app/utils/localStorageKeys'

type Props = { proxyUrl: URL; children: React.ReactNode }

export default function RequestProxyingProvider({ proxyUrl, children }: Props) {
  const [isProxying, setIsProxying] = useLocalStorage({
    key: LocalStorageKeys.isProxying,
    defaultValue: false,
    deserialize(value) {
      if (value) return JSON.parse(value)
      else return false
    },
  })

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
      value={{ isProxying, getRequestUrl, setUseProxy: setIsProxying }}
    >
      {children}
    </RequestProxyContext.Provider>
  )
}
