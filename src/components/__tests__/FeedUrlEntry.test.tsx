import { describe, expect, it } from 'bun:test'

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import FeedUrlEntry from '@app/components/FeedUrlEntry'
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

const page = new PageObject()

describe('FeedUrlEntry', () => {
  it('is initially empty with no error', () => {
    renderWithApp(<FeedUrlEntry />)

    expect(page.inputElement).toHaveProperty('value', '')
    expect(
      screen.queryByText(/must be/i) || screen.queryByText(/invalid/i),
    ).toBeNull()
  })

  it('shows an error when an invalid url is entered', async () => {
    const user = userEvent.setup()
    renderWithApp(<FeedUrlEntry />)

    await user.type(page.inputElement, 'not a valid url')

    await waitFor(() => {
      expect(
        screen.queryByText('Must be an http or https URL', { exact: false }),
      ).not.toBeNull()
    })
  })

  it('shows an error when an invalid https url is entered', async () => {
    renderWithApp(<FeedUrlEntry />)
    const user = userEvent.setup()

    await user.type(page.inputElement, 'https://not a valid url')

    await waitFor(() => {
      expect(screen.queryByText('Invalid URL', { exact: false })).not.toBeNull()
    })
  })
})
