import { beforeEach, describe, expect, it } from 'bun:test'

import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, delay, http } from 'msw'

import { useAppState } from '@app/hooks/appState'
import { Fixtures } from '@mocks/fixtures'
import {
  createDocumentUrl,
  simulateNavigateBack,
} from '@testing/locationManipulation'
import { AppWrapper } from '@testing/renderWithAppState'
import { createOneShotSignal } from '@testing/signals'

const testUrl = 'https://example.com'

function renderAppState() {
  return renderHook(() => useAppState(), { wrapper: AppWrapper })
}

describe('AppStateProvider', () => {
  beforeEach(() => {
    window.testing.server.use(http.get(testUrl, () => HttpResponse.error()))
  })

  it('has sane defaults', () => {
    const { result } = renderAppState()

    expect(result.current.feedUrl).toBeEmpty()
    expect(result.current.feed).toBeNull()
    expect(result.current.errors).toMatchObject({ feed: null })
  })

  it('sets the document title initially to the default', () => {
    renderAppState()

    expect(document.title).toEqual('RSS Feed Viewer')
  })

  it('provides a way to set the feed url', async () => {
    const { result } = renderAppState()

    act(() => {
      result.current.setFeedUrl(testUrl)
    })

    await waitFor(() => {
      expect(result.current.feedUrl).toEqual(testUrl)
    })
  })

  describe('feed fetch integration tests', () => {
    it('sets the query state while fetching', async () => {
      window.testing.server.use(
        http.get(testUrl, async (_req) => {
          await delay('infinite')
        }),
      )

      const { result } = renderAppState()

      act(() => {
        result.current.setFeedUrl(testUrl)
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBeTrue()
        expect(result.current.feed).toBeNull()
      })
    })

    it('updates the query state and document title with feed data when fetch completes', async () => {
      const signal = createOneShotSignal()
      window.testing.server.use(
        http.get(testUrl, async (_req) => {
          await signal
          return HttpResponse.xml(Fixtures.rssXml)
        }),
      )

      const { result } = renderAppState()

      act(() => {
        result.current.setFeedUrl(testUrl)
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBeTrue()
      })

      signal.send()

      await waitFor(() => {
        expect(result.current.isLoading).toBeFalse()
        expect(result.current.feed?.fetchedUrl).toEqual(testUrl)
        expect(document.title).toMatch('NASA Space Station News')
      })
    })

    it('updates the query state and error state when fetch errors', async () => {
      const signal = createOneShotSignal()
      window.testing.server.use(
        http.get(testUrl, async (_req) => {
          await signal
          return HttpResponse.error()
        }),
      )

      const { result } = renderAppState()

      act(() => {
        result.current.setFeedUrl(testUrl)
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBeTrue()
        expect(result.current.errors.feed).toBeNull()
      })

      signal.send()

      await waitFor(() => {
        expect(result.current.isLoading).toBeFalse()
        expect(result.current.feed).toBeNull()

        expect(result.current.errors.feed).not.toBeNull()
      })
    })

    it('does not preserve the existing feed state when a fetch fails', async () => {
      const secondUrl = 'https://example.rss'
      window.testing.server.use(
        http.get(testUrl, async (_req) => HttpResponse.xml(Fixtures.rssXml)),
        http.get(secondUrl, async (_req) => HttpResponse.error()),
      )

      const { result } = renderAppState()

      act(() => result.current.setFeedUrl(testUrl))
      await waitFor(() => {
        expect(result.current.feed?.fetchedUrl).toEqual(testUrl)
        expect(result.current.errors.feed).toBeNull()
      })

      act(() => result.current.setFeedUrl(secondUrl))
      await waitFor(() => {
        expect(result.current.feedUrl).toEqual(secondUrl)
        expect(result.current.errors.feed).not.toBeNull()
        expect(result.current.feed).toBeNull()
      })
    })
  })

  describe('url management integration tests', () => {
    it('sets document url when the feed url changes', async () => {
      window.testing.server.use(
        http.get(testUrl, (_req) => HttpResponse.xml(Fixtures.rssXml)),
      )

      const { result } = renderAppState()

      act(() => result.current.setFeedUrl(testUrl))

      waitFor(() => {
        expect(location.href).toEqual(createDocumentUrl(testUrl))
      })
    })

    it('changes the feed url when user navigates back', async () => {
      const { result } = renderAppState()

      simulateNavigateBack(testUrl)

      await waitFor(() => {
        expect(result.current.feedUrl).toEqual(testUrl)
      })
    })
  })
})
