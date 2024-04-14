import { afterEach, describe, expect, it } from 'bun:test'

import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpHandler, HttpResponse, http } from 'msw'
import { SetupServerApi, setupServer } from 'msw/node'

import useFeed from '@app/hooks/feed'
import { ConsoleMocker } from '@mocks/console'
import { Fixtures } from '@mocks/fixtures'

const testUrl = 'https://example.com/.rss'
const otherTestUrl = 'https://example.com/other.rss'

type Signal = PromiseLike<void> & { send: () => void }
function createOneShotSignal(): Signal {
  let sendSignal

  const signal: Partial<Signal> = new Promise((resolve) => {
    sendSignal = resolve
  })

  signal.send = sendSignal

  return signal as Signal
}

describe('useFeed', () => {
  let server: SetupServerApi | null = null

  function runTestServer(
    resolver: (() => HttpResponse) | (() => Promise<HttpResponse>),
    ...otherHandlers: HttpHandler[]
  ) {
    const handlers: HttpHandler[] = [
      http.get(testUrl, resolver),
      ...otherHandlers,
    ]

    server = setupServer(...handlers)
    server.listen()
  }

  ConsoleMocker.install()

  afterEach(() => {
    server?.close()
    server = null
  })

  it('has no data and is loading until fetch resolves', async () => {
    const respondSignal = createOneShotSignal()

    runTestServer(async () => {
      await respondSignal
      return HttpResponse.xml(Fixtures.rssXml)
    })

    const { result } = renderHook(() => useFeed(testUrl))
    const {
      loading: initialLoading,
      feed: initialFeed,
      xml: initialXml,
    } = result.current

    respondSignal.send()

    expect(initialLoading).toEqual(true)
    expect(initialFeed).toBeNull()
    expect(initialXml).toBeNull()

    await waitFor(() => {
      expect(result.current.loading).toEqual(false)
      expect(result.current.feed).not.toBeNull()
      expect(result.current.xml).toEqual(Fixtures.rssXml)
    })
  })

  it('allows for a request to be aborted', () => {
    const respondSignal = createOneShotSignal()
    runTestServer(async () => {
      await respondSignal
      return HttpResponse.xml(Fixtures.rssXml)
    })

    const { result } = renderHook(() => useFeed(testUrl))
    const wasLoading = result.current.loading

    result.current.abort()

    expect(wasLoading).toEqual(true)
    waitFor(() => {
      expect(result.current.loading).toEqual(false)
    })
  })

  it('aborts pre-existing request when a new one is made', async () => {
    const respondSignal = createOneShotSignal()
    runTestServer(
      async () => {
        await respondSignal
        return HttpResponse.text('Test')
      },
      http.get(otherTestUrl, async () => {
        return HttpResponse.xml(Fixtures.rssXml)
      }),
    )

    const { result, rerender } = renderHook(
      ({ url = testUrl }: { url: string }) =>
        useFeed(url, { debounceMillis: 0 }),
      { initialProps: { url: testUrl } },
    )

    act(() => {
      rerender({ url: otherTestUrl })
    })
    // Allow for debouncing delay
    await waitFor(() => expect(result.current.url).toEqual(otherTestUrl))

    respondSignal.send()

    await waitFor(() => {
      expect(result.current.error).toBeNull()
      expect(result.current.feed).not.toBeNull()
      expect(result.current.xml).toEqual(Fixtures.rssXml)
    })
  })

  it('returns an error without a parser error if request failed', async () => {
    runTestServer(() => {
      return new HttpResponse(null, {
        status: 404,
      })
    })

    const { result } = renderHook(() => useFeed(testUrl))

    await waitFor(() => {
      expect(result.current.error?.statusCode).toBeDefined()
    })

    const { statusCode, statusText, parserError } = result.current.error!

    expect(statusCode).toEqual(404)
    expect(statusText).toEqual('Not Found')
    expect(parserError).toBeUndefined()
  })

  it('returns an error with a parser error if feed is malformed', async () => {
    runTestServer(() =>
      HttpResponse.xml('<not-a-valid-feed></not-a-valid-feed>'),
    )

    const { result } = renderHook(() => useFeed(testUrl))

    await waitFor(() => {
      expect(result.current.loading).toEqual(false)
      expect(result.current.error).not.toBeNull()
    })

    const { statusCode, statusText, parserError } = result.current.error!

    expect(statusCode).toEqual(200)
    expect(statusText).toEqual('OK')
    expect(parserError).toBeDefined()
    expect(parserError).not.toBeNull()
  })

  it('returns a low-level error when a network error occurs', async () => {
    runTestServer(() => HttpResponse.error())

    const { result } = renderHook(() => useFeed(testUrl))

    await waitFor(() => {
      expect(result.current.error).not.toBeNull()
    })

    expect(result.current.error).toMatchObject({
      statusCode: null,
      statusText: null,
    })
    expect(result.current.error?.lowLevelError).toBeDefined()
  })
})
