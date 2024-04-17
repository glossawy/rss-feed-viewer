import { useCallback, useSyncExternalStore } from 'react'

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
  const url = useSyncExternalStore((callback) => {
    window.addEventListener('popstate', callback)
    window.addEventListener('rssviewer:pushstate', callback)
    return () => {
      window.removeEventListener('popstate', callback)
      window.removeEventListener('rssviewer:pushstate', callback)
    }
  }, currentProxyUrlParam)

  const setUrlParam = useCallback((newUrl: string) => {
    if (currentProxyUrlParam() === newUrl) return

    history.pushState({}, '', nextStateUrl(newUrl))

    // We dispatch an event instead of setting directly
    // since this would broadcast to other mounted hooks
    window.dispatchEvent(new PushStateEvent())
  }, [])

  return { urlParam: url, setUrlParam }
}
