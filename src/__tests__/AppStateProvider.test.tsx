import { describe, expect, it } from 'bun:test'

import { AppError } from '@app/contexts/appState'
import {
  AppStateConsumer,
  AppStateConsumerPage,
} from '@testing/AppStateConsumer'
import renderWithApp from '@testing/renderWithAppState'

const page = new AppStateConsumerPage()

describe('AppStateProvider', () => {
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
})
