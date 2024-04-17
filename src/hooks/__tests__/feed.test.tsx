import { describe, expect, it } from 'bun:test'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'

import useFeed from '@app/hooks/feed'
import { Fixtures } from '@mocks/fixtures'
import { createOneShotSignal } from '@testing/signals'

const testUrl = 'https://example.com/.rss'
const otherTestUrl = 'https://example.com/other.rss'

function QueryWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useFeed', () => {
  it('has no data and is loading until fetch resolves', async () => {
    const respondSignal = createOneShotSignal()

    window.testing.server.use(
      http.get(testUrl, async () => {
        await respondSignal
        return HttpResponse.xml(Fixtures.rssXml)
      }),
    )

    const { result } = renderHook(() => useFeed(testUrl), {
      wrapper: QueryWrapper,
    })
    const {
      query: { isLoading: initialLoading },
      feed: initialFeed,
    } = result.current

    respondSignal.send()

    expect(initialLoading).toEqual(true)
    expect(initialFeed).toBeUndefined()

    await waitFor(() => {
      expect(result.current.query.isLoading).toEqual(false)
      expect(result.current.feed).toBeDefined()
    })
  })

  it('aborts pre-existing request when a new one is made', async () => {
    const respondSignal = createOneShotSignal()
    window.testing.server.use(
      http.get(testUrl, async () => {
        await respondSignal
        return HttpResponse.text('Test')
      }),
      http.get(otherTestUrl, async () => {
        return HttpResponse.xml(Fixtures.rssXml)
      }),
    )

    const { result, rerender } = renderHook(
      ({ url = testUrl }: { url: string }) => useFeed(url),
      { initialProps: { url: testUrl }, wrapper: QueryWrapper },
    )

    act(() => {
      rerender({ url: otherTestUrl })
    })

    respondSignal.send()

    await waitFor(() => {
      expect(result.current.error).toBeNull()
      expect(result.current.feed).not.toBeNull()
    })
  })

  it('returns an error without a parser error if request failed', async () => {
    window.testing.server.use(
      http.get(testUrl, () => {
        return new HttpResponse(null, {
          status: 404,
        })
      }),
    )

    const { result } = renderHook(() => useFeed(testUrl), {
      wrapper: QueryWrapper,
    })

    await waitFor(() => {
      expect(result.current.error?.failureMode).toBeDefined()
    })

    const { message, failureMode } = result.current.error!

    expect(failureMode).toEqual('request')
    expect(message).toMatch(/404/)
  })

  it('returns an error with a parser error if feed is malformed', async () => {
    window.testing.server.use(
      http.get(testUrl, () =>
        HttpResponse.xml('<not-a-valid-feed></not-a-valid-feed>'),
      ),
    )

    const { result } = renderHook(() => useFeed(testUrl), {
      wrapper: QueryWrapper,
    })

    await waitFor(() => {
      expect(result.current.query.isLoading).toEqual(false)
      expect(result.current.error).not.toBeNull()
    })

    const { failureMode } = result.current.error!

    expect(failureMode).toEqual('parser')
  })

  it('returns a low-level error when a network error occurs', async () => {
    window.testing.server.use(http.get(testUrl, () => HttpResponse.error()))

    const { result } = renderHook(() => useFeed(testUrl), {
      wrapper: QueryWrapper,
    })

    await waitFor(() => {
      expect(result.current.error).not.toBeNull()
    })

    expect(result.current.error?.failureMode).toEqual('lowlevel')
  })
})
