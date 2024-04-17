import { beforeEach, describe, expect, it } from 'bun:test'

import { waitFor } from '@testing-library/react'
import { HttpResponse, delay, http } from 'msw'

import { AppError } from '@app/contexts/appState'
import { Fixtures } from '@mocks/fixtures'
import {
  AppStateConsumer,
  AppStateConsumerPage,
} from '@testing/AppStateConsumer'
import {
  createDocumentUrl,
  simulateNavigateBack,
} from '@testing/locationManipulation'
import renderWithApp from '@testing/renderWithAppState'
import { createOneShotSignal } from '@testing/signals'

const page = new AppStateConsumerPage()
const testUrl = 'https://example.com'

describe('AppStateProvider', () => {
  beforeEach(() => {
    window.testing.server.use(http.get(testUrl, () => HttpResponse.error()))
  })

  it('has sane defaults', () => {
    renderWithApp(<AppStateConsumer />)

    expect(page.feedUrl).toBeEmpty()
    expect(page.errors.url).toMatchObject({
      userFacingMessage: '',
      internalMessage: '',
    })
    expect(page.errors.feed).toMatchObject({
      userFacingMessage: '',
      internalMessage: '',
    })
  })

  it('provides a way to set the feed url', async () => {
    renderWithApp(<AppStateConsumer />)

    await page.setFeedUrl('https://example.com')

    expect(page.feedUrl).toEqual('https://example.com')
  })

  it('clears errors when a new feed url is set', async () => {
    renderWithApp(<AppStateConsumer />)

    await page.setAppError('url', 'test', 'test')
    expect(page.errors.url.internalMessage).not.toBeEmpty()

    await page.setFeedUrl('https://example.com')
    expect(page.errors.url.internalMessage).toBeEmpty()
  })

  it('provides a way to set app errors', async () => {
    renderWithApp(<AppStateConsumer />)

    const expectedUrlError: AppError = {
      userFacingMessage: 'url error',
      internalMessage: 'internal url error',
    }

    const expectedFeedError: AppError = {
      userFacingMessage: 'feed error',
      internalMessage: 'internal feed error',
    }

    await page.setAppError(
      'url',
      expectedUrlError.userFacingMessage,
      expectedUrlError.internalMessage,
    )
    await page.setAppError(
      'feed',
      expectedFeedError.userFacingMessage,
      expectedFeedError.internalMessage,
    )

    expect(page.errors.url).toMatchObject(expectedUrlError)
    expect(page.errors.feed).toMatchObject(expectedFeedError)
  })

  it('logs internal messages for errors when set', async () => {
    renderWithApp(<AppStateConsumer />)

    await page.setAppError('url', 'test user facing', 'test internal')

    expect(console.error).toHaveBeenCalledTimes(1)
    expect(console.error).toHaveBeenCalledWith('App Error: test internal')
  })

  it('provides a way to clear errors', async () => {
    renderWithApp(<AppStateConsumer />)

    await page.setAppError('url', 'test', 'test')
    expect(page.errors.url.userFacingMessage).not.toBeEmpty()

    await page.clearErrors()
    expect(page.errors.url.userFacingMessage).toBeEmpty()
  })

  describe('feed fetch integration tests', () => {
    it('sets the query state while fetching', async () => {
      window.testing.server.use(
        http.get(testUrl, async (_req) => {
          await delay('infinite')
        }),
      )

      renderWithApp(<AppStateConsumer />)

      await page.setFeedUrl(testUrl)

      await waitFor(() => {
        expect(page.isLoading).toBeTrue()
        expect(page.fetchedUrl).toBeEmpty()
      })
    })

    it('updates the query state with feed data when fetch completes', async () => {
      const signal = createOneShotSignal()
      window.testing.server.use(
        http.get(testUrl, async (_req) => {
          await signal
          return HttpResponse.xml(Fixtures.rssXml)
        }),
      )

      renderWithApp(<AppStateConsumer />)

      await page.setFeedUrl(testUrl)

      await waitFor(() => {
        expect(page.isLoading).toBeTrue()
      })

      signal.send()

      await waitFor(() => {
        expect(page.isLoading).toBeFalse()
        expect(page.fetchedUrl).toEqual(testUrl)
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

      renderWithApp(<AppStateConsumer />)

      await page.setFeedUrl(testUrl)

      await waitFor(() => {
        expect(page.isLoading).toBeTrue()
        expect(page.errors.feed.userFacingMessage).toBeEmpty()
        expect(page.errors.feed.internalMessage).toBeEmpty()
      })

      signal.send()

      await waitFor(() => {
        expect(page.isLoading).toBeFalse()
        expect(page.fetchedUrl).toBeEmpty()

        expect(page.errors.feed.userFacingMessage).not.toBeEmpty()
        expect(page.errors.feed.internalMessage).not.toBeEmpty()
      })
    })

    it('does not preserve the existing feed state when a fetch fails', async () => {
      const secondUrl = 'https://example.rss'
      window.testing.server.use(
        http.get(testUrl, async (_req) => HttpResponse.xml(Fixtures.rssXml)),
        http.get(secondUrl, async (_req) => HttpResponse.error()),
      )

      renderWithApp(<AppStateConsumer />)

      await page.setFeedUrl(testUrl)
      await waitFor(() => {
        expect(page.fetchedUrl).toEqual(testUrl)
        expect(page.errors.feed.internalMessage).toBeEmpty()
      })

      await page.setFeedUrl(secondUrl)
      await waitFor(() => {
        expect(page.feedUrl).toEqual(secondUrl)
        expect(page.errors.feed.internalMessage).not.toBeEmpty()
        expect(page.fetchedUrl).toBeEmpty()
      })
    })
  })

  describe('url management integration tests', () => {
    it('sets document url when the feed url changes', async () => {
      window.testing.server.use(
        http.get(testUrl, (_req) => HttpResponse.xml(Fixtures.rssXml)),
      )

      renderWithApp(<AppStateConsumer />)

      await page.setFeedUrl(testUrl)

      waitFor(() => {
        expect(location.href).toEqual(createDocumentUrl(testUrl))
      })
    })

    it('changes the feed url when user navigates back', async () => {
      renderWithApp(<AppStateConsumer />)

      simulateNavigateBack(testUrl)

      await waitFor(() => {
        expect(page.feedUrl).toEqual(testUrl)
      })
    })
  })
})
