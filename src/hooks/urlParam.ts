import { useCallback, useEffect, useState } from 'react'

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

class PushStateEvent extends CustomEvent<PushStateEvent> {
  constructor() {
    super('rssviewer:pushstate')
  }
}

export default function useUrlParam() {
  const [url, setUrl] = useState(currentProxyUrlParam())

  const setUrlParam = useCallback((newUrl: string) => {
    if (currentProxyUrlParam() === newUrl) return

    history.pushState({}, '', nextStateUrl(newUrl))

    // We dispatch an event instead of setting directly
    // since this would broadcast to other mounted hooks
    window.dispatchEvent(new PushStateEvent())
  }, [])

  useEffect(() => {
    const listener = () => {
      const newUrl = currentProxyUrlParam()
      setUrl(newUrl)
    }

    window.addEventListener('popstate', listener)
    window.addEventListener('rssviewer:pushstate', listener)
    return () => {
      window.removeEventListener('popstate', listener)
      window.removeEventListener('rssviewer:pushstate', listener)
    }
  }, [setUrl])

  return { urlParam: url, setUrlParam }
}
