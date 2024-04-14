import { afterEach, describe, expect, it } from 'bun:test'

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useCallback, useState } from 'react'

import AppStateProvider from '@app/AppStateProvider'
import { AppError } from '@app/contexts/appState'
import { useAppState } from '@app/hooks/appState'
import { ConsoleMocker } from '@mocks/console'

class PageObject {
  get feedUrl() {
    return this.getFieldValue(/^Feed URL:/)
  }

  get errors(): { url: AppError; feed: AppError } {
    return {
      url: {
        userFacingMessage: this.getFieldValue(/^User Facing URL Error/),
        internalMessage: this.getFieldValue(/^Internal URL Error/),
      },
      feed: {
        userFacingMessage: this.getFieldValue(/^User Facing Feed Error/),
        internalMessage: this.getFieldValue(/^Internal Feed Error/),
      },
    }
  }

  async setAppError(
    type: 'url' | 'feed',
    userFacing: string,
    internal: string,
  ) {
    const errorInput = screen.getByLabelText('Error Input:')
    const errorInputBtn = screen.getByText('Set Error')

    await userEvent.type(
      errorInput,
      this.appErrorText(type, userFacing, internal),
    )
    await userEvent.click(errorInputBtn)

    userEvent.clear(errorInput)
  }

  async setFeedUrl(url: string) {
    const urlInput = screen.getByLabelText('Feed URL Input:')
    await userEvent.type(urlInput, url)
  }

  async clearErrors() {
    const clearErrorsBtn = screen.getByText('Clear Errors')
    await userEvent.click(clearErrorsBtn)
  }

  private getFieldValue(pattern: RegExp) {
    return screen
      .getByText(pattern)
      .textContent!.trim()
      .split(':')
      .slice(1)
      .join(':')
      .trim()
  }

  private appErrorText(type: string, userFacing: string, internal: string) {
    return [type, userFacing, internal].join(':')
  }
}

function AppStateConsumer() {
  const { feedUrl, errors, setFeedUrl, setAppError, clearErrors } =
    useAppState()

  const [errorInput, setErrorInput] = useState('')

  const onSetError = useCallback(() => {
    const [errorType, userFacingMessage, internalMessage] =
      errorInput.split(':')

    setAppError(errorType as 'feed' | 'url', {
      userFacingMessage,
      internalMessage,
    })
  }, [errorInput, setAppError])

  return (
    <div>
      <p>Feed URL: {feedUrl}</p>
      <p>User Facing URL Error: {errors.url?.userFacingMessage}</p>
      <p>Internal URL Error: {errors.url?.internalMessage}</p>
      <p>User Facing Feed Error: {errors.feed?.userFacingMessage}</p>
      <p>Internal Feed Error: {errors.feed?.internalMessage}</p>
      <div>
        <label htmlFor="feedUrl">Feed URL Input:</label>
        <input
          value={feedUrl}
          onChange={(evt) => setFeedUrl(evt.target.value)}
          id="feedUrl"
        />
      </div>
      <div>
        <label htmlFor="errorInput">Error Input:</label>
        <input
          value={errorInput}
          onChange={(evt) => setErrorInput(evt.target.value)}
          id="errorInput"
        />
        <button onClick={onSetError}>Set Error</button>
      </div>
      <button onClick={clearErrors}>Clear Errors</button>
    </div>
  )
}

function renderWithProvider(ui: React.ReactNode) {
  return render(<AppStateProvider>{ui}</AppStateProvider>)
}

const page = new PageObject()

afterEach(cleanup)

describe('AppStateProvider', () => {
  ConsoleMocker.install()

  it('has sane defaults', () => {
    renderWithProvider(<AppStateConsumer />)

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
    renderWithProvider(<AppStateConsumer />)

    await page.setFeedUrl('https://example.com')

    expect(page.feedUrl).toEqual('https://example.com')
  })

  it('clears errors when a new feed url is set', async () => {
    renderWithProvider(<AppStateConsumer />)

    await page.setAppError('url', 'test', 'test')
    expect(page.errors.url.internalMessage).not.toBeEmpty()

    await page.setFeedUrl('https://example.com')
    expect(page.errors.url.internalMessage).toBeEmpty()
  })

  it('provides a way to set app errors', async () => {
    renderWithProvider(<AppStateConsumer />)

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
    renderWithProvider(<AppStateConsumer />)

    await page.setAppError('url', 'test user facing', 'test internal')

    expect(console.error).toHaveBeenCalledTimes(1)
    expect(console.error).toHaveBeenCalledWith('App Error: test internal')
  })

  it('provides a way to clear errors', async () => {
    renderWithProvider(<AppStateConsumer />)

    await page.setAppError('url', 'test', 'test')
    expect(page.errors.url.userFacingMessage).not.toBeEmpty()

    await page.clearErrors()
    expect(page.errors.url.userFacingMessage).toBeEmpty()
  })
})
