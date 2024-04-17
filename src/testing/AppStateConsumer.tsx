import { screen } from '@testing-library/react'
import userEvent, { UserEvent } from '@testing-library/user-event'
import { useCallback, useState } from 'react'

import { AppError } from '@app/contexts/appState'
import { useAppState } from '@app/hooks/appState'

export class AppStateConsumerPage {
  user: UserEvent

  constructor() {
    this.user = userEvent.setup()
  }

  get feedUrl() {
    return this.getFieldValue(/^Feed URL:/)
  }

  get fetchedUrl() {
    return this.getFieldValue(/^Feed Fetched URL:/)
  }

  get isLoading() {
    return this.getCheckboxValue(/^Query Is Loading:/)
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

    await this.user.clear(errorInput)
    await this.user.type(
      errorInput,
      this.appErrorText(type, userFacing, internal),
    )
    await this.user.click(errorInputBtn)
  }

  async setFeedUrl(url: string) {
    const urlInput = screen.getByLabelText('Feed URL Input:')
    const urlInputBtn = screen.getByText('Set Feed URL')
    await this.user.clear(urlInput)
    await this.user.type(urlInput, url)
    await this.user.click(urlInputBtn)
  }

  async clearErrors() {
    const clearErrorsBtn = screen.getByText('Clear Errors')
    await this.user.click(clearErrorsBtn)
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

  private getCheckboxValue(pattern: RegExp) {
    const checkbox = screen.getByLabelText(pattern)

    if (checkbox instanceof HTMLInputElement) return checkbox.checked

    throw new Error(`${pattern} does not match an input element`)
  }

  private appErrorText(type: string, userFacing: string, internal: string) {
    return [type, userFacing, internal].join(':')
  }
}

export function AppStateConsumer() {
  const {
    feedUrl,
    feed,
    isLoading,
    errors,
    setFeedUrl,
    setAppError,
    clearErrors,
  } = useAppState()

  const [feedInput, setFeedInput] = useState('')
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
      <p>Feed Fetched URL: {feed?.fetchedUrl}</p>
      <div>
        <label htmlFor="queryIsLoading">Query Is Loading:</label>
        <input
          checked={isLoading}
          type="checkbox"
          id="queryIsLoading"
          readOnly
        />
      </div>
      <div>
        <label htmlFor="feedUrl">Feed URL Input:</label>
        <input
          value={feedInput}
          onChange={(evt) => setFeedInput(evt.target.value)}
          id="feedUrl"
        />
        <button onClick={() => setFeedUrl(feedInput)}>Set Feed URL</button>
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
