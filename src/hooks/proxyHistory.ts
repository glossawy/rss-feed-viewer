import { useEffect, useRef } from 'react'

function queryParams() {
  return new URL(location.href).searchParams
}

function currentProxyUrlParam() {
  return queryParams().get('url') || ''
}

function nextStateUrl(proxyUrl: string) {
  const params = queryParams()
  params.set('url', proxyUrl)

  return `${location.pathname}?${params}`
}

export default function useProxyHistory(
  url: string,
  { enabled }: { enabled: boolean } = { enabled: true },
) {
  const targetUrl = useRef<string>(url)

  // If URL changes via an app action, set it to the target url.
  // Update param in URL
  if (enabled && targetUrl.current !== url) {
    targetUrl.current = url

    if (currentProxyUrlParam() !== url) {
      history.pushState({}, '', nextStateUrl(url))
    }
  }

  useEffect(() => {
    const listener = () => {
      const newUrl = currentProxyUrlParam()
      targetUrl.current = newUrl
    }

    window.addEventListener('popstate', listener)
    return () => {
      window.removeEventListener('popstate', listener)
    }
  }, [])

  return { targetUrl: targetUrl }
}
