import { useQuery } from '@tanstack/react-query'
import Parser from 'rss-parser'

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

type FailureMode = 'request' | 'parser' | 'lowlevel'
export class FeedFetchError extends Error {
  failureMode: FailureMode

  constructor(message: string, mode: FailureMode, opts?: ErrorOptions) {
    super(message, opts)
    this.failureMode = mode
  }
}

export default function useFeed(url: string) {
  const query = useQuery({
    queryKey: ['feed', url],
    queryFn: async ({ signal, queryKey: [_feed, queryUrl] }) => {
      if (url.trim() === '') return null

      const response = await fetch(url, {
        signal,
        headers: defaultHeaders,
        mode: 'cors',
      }).catch((err) => {
        switch ((err as Error).name) {
          case 'AbortError':
            // Not really important since we likely are
            // just cancelling the query
            throw err
          default:
            throw new FeedFetchError(err.message, 'lowlevel', { cause: err })
        }
      })

      if (response.ok) {
        try {
          const xml = await response.text()
          const parsed = await new Parser<{ fetchedUrl: string }>().parseString(
            xml,
          )

          parsed.fetchedUrl = queryUrl

          return parsed
        } catch (err) {
          let errorMessage: string

          if (err instanceof Error) errorMessage = err.message
          else if (typeof err === 'string') errorMessage = err
          else errorMessage = `Unexpected Error: ${err}`
          throw new FeedFetchError(errorMessage, 'parser', { cause: err })
        }
      } else {
        throw new FeedFetchError(
          `Non-successful response: ${response.status} @ ${queryUrl}`,
          'request',
        )
      }
    },
    enabled: url.trim() !== '',
    retry: false,
    // Extremely unlikely to change often so keep data for 30 minutes
    staleTime: 1000 * 60 * 30,
  })

  const { data: feed, error } = query

  return { query, feed, error: error as FeedFetchError | null }
}
