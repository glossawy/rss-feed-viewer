import { useDebouncedValue } from '@mantine/hooks'
import { useCallback, useEffect, useRef, useState } from 'react'
import Parser from 'rss-parser'

import { Feed } from '@app/contexts/appState'

export type FeedFetchError = {
  statusCode: number | null
  statusText: string | null
  parserError?: string
  lowLevelError?: string
}

type Options = {
  debounceMillis: number
}

const defaultOptions: Options = {
  debounceMillis: 500,
}

const MIME_TYPE_WEIGHTS: [string, number][] = [
  ['application/rss+xml', 1.0],
  ['application/atom+xml', 1.0],
  ['text/xml', 0.9],
  ['application/xml', 0.8],
]

const defaultHeaders = (() => {
  const headers = new Headers()

  headers.set(
    'Accept',
    MIME_TYPE_WEIGHTS.map(([type, weight]) => `${type};q=${weight}`).join(','),
  )

  return headers
})()

export default function useFeed(
  urlValue: string,
  hookOptions: Partial<Options> = {},
) {
  const options: Options = { ...defaultOptions, ...hookOptions }

  const [url] = useDebouncedValue(urlValue, options.debounceMillis)
  const [loading, setLoading] = useState(false)
  const [feedXml, setFeedXml] = useState<string | null>(null)
  const [feed, setFeed] = useState<Feed | null>(null)
  const [error, setError] = useState<FeedFetchError | null>(null)

  const abortController = useRef<AbortController | null>(null)

  const setFeedData = useCallback(
    (xml: string, feed: Feed) => {
      setFeedXml(xml)
      setFeed(feed)
    },
    [setFeedXml, setFeed],
  )

  const abort: () => void = useCallback(
    (reason: string = 'Manually aborted without reason') =>
      abortController.current?.abort(reason),
    [],
  )

  useEffect(() => {
    if (url.trim() === '') return

    if (abortController.current) {
      console.log('Aborting...')
      abortController.current.abort('More recent feed request made')
    }

    setLoading(true)

    const ac = (abortController.current = new AbortController())

    fetch(url, { signal: ac.signal, headers: defaultHeaders })
      .then(async (response) => {
        if (ac.signal.aborted) return

        const fetchError: FeedFetchError = {
          statusCode: response.status,
          statusText: response.statusText,
        }

        if (response.ok) {
          try {
            const xml = await response.text()
            const parsed = await new Parser().parseString(xml)
            setFeedData(xml, parsed)
          } catch (err) {
            if (err instanceof Error) fetchError.parserError = err.message
            else if (typeof err === 'string') fetchError.parserError = err
            else fetchError.parserError = `Unexpected Error: ${err}`

            setError(fetchError)
          }
        } else {
          setError(fetchError)
        }
      })
      .catch((err) => {
        if (ac.signal.aborted) return

        if (err instanceof DOMException || err instanceof TypeError) {
          switch (err.name) {
            case 'AbortError':
              // Just aborted, do nothing
              break
            default:
              // Could be a network error, let's log it
              console.error(err)
              setError({
                statusCode: null,
                statusText: null,
                lowLevelError: err.message,
              })
              break
          }
        }
      })
      .finally(() => {
        if (abortController.current === ac) setLoading(false)
      })
  }, [url, setFeedData, setError, setLoading])

  return { url, loading, xml: feedXml, feed, error, abort }
}
