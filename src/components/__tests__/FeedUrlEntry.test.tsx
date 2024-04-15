import { describe, expect, it } from 'bun:test'

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import FeedUrlEntry from '@app/components/FeedUrlEntry'
import {
  AppStateConsumer,
  AppStateConsumerPage,
} from '@testing/AppStateConsumer'
import renderWithApp from '@testing/renderWithAppState'

class PageObject {
  get inputElement() {
    return screen.getByPlaceholderText('Enter an RSS feed')
  }

  async setUrl(url: string) {
    await userEvent.type(this.inputElement, url)
  }

  debug() {
    console.debug({
      url: (this.inputElement as HTMLInputElement).value,
    })
  }
}

describe('FeedUrlEntry', () => {
  it('is initially empty with no error', () => {
    const page = new PageObject()

    renderWithApp(<FeedUrlEntry />)

    expect(page.inputElement).toHaveProperty('value', '')
    expect(
      screen.queryByText(/must be/i) || screen.queryByText(/invalid/i),
    ).toBeNull()
  })

  it('shows an error when a non-url is entered', async () => {
    const page = new PageObject()

    renderWithApp(<FeedUrlEntry />)

    await page.setUrl('not a valid url')

    await waitFor(() => {
      expect(
        screen.queryByText('Must be an http or https URL', { exact: false }),
      ).not.toBeNull()
    })
  })

  it('shows an error when an invalid https url is entered', async () => {
    const page = new PageObject()

    renderWithApp(<FeedUrlEntry />)

    await page.setUrl('https://not a valid url')

    await waitFor(() => {
      expect(screen.queryByText('Invalid URL', { exact: false })).not.toBeNull()
    })
  })

  it('updates the feed URL when entered URL is valid', async () => {
    const page = new PageObject()
    const statePage = new AppStateConsumerPage()
    const testUrl = 'https://example.com/.rss'

    renderWithApp(
      <>
        <FeedUrlEntry />
        <AppStateConsumer />
      </>,
    )

    expect(statePage.feedUrl).toBeEmpty()

    await page.setUrl(testUrl)

    await waitFor(() => {
      expect(statePage.feedUrl).toEqual(testUrl)
    })
  })

  it('updates the app error state when entered URL is invalid', async () => {
    const page = new PageObject()
    const statePage = new AppStateConsumerPage()

    renderWithApp(
      <>
        <FeedUrlEntry />
        <AppStateConsumer />
      </>,
    )

    await page.setUrl('not a valid url')

    await waitFor(() => {
      expect(statePage.errors.url.internalMessage).toMatch(/^Must be an http/i)
      expect(statePage.errors.url.userFacingMessage).toMatch(
        /^Must be an http/i,
      )
    })
  })
})
