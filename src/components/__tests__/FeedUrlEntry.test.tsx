import { describe, expect, it } from 'bun:test'

import { renderHook, screen, waitFor } from '@testing-library/react'
import userEvent, { UserEvent } from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'

import FeedUrlEntry from '@app/components/FeedUrlEntry'
import { useAppState } from '@app/hooks/appState'
import { setDocumentUrl } from '@testing/locationManipulation'
import { AppWrapper } from '@testing/renderWithAppState'

class PageObject {
  user: UserEvent

  constructor() {
    this.user = userEvent.setup()
  }

  get inputElement() {
    return screen.getByPlaceholderText('Enter an RSS feed')
  }

  get errorElement() {
    return (
      screen.queryByText(/must be/i, { exact: false }) ||
      screen.queryByText(/invalid/i, { exact: false })
    )
  }

  async setUrl(url: string) {
    await this.user.clear(this.inputElement)
    if (url !== '') await this.user.type(this.inputElement, url)
  }

  async submitUrl(url: string) {
    await this.setUrl(url)
    await this.user.type(this.inputElement, '{enter}')
  }

  debug() {
    console.debug({
      url: (this.inputElement as HTMLInputElement).value,
    })
  }
}

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AppWrapper>
      <FeedUrlEntry />
      {children}
    </AppWrapper>
  )
}

function renderWithAppState() {
  return renderHook(() => useAppState(), { wrapper: TestWrapper })
}

describe('FeedUrlEntry', () => {
  it('is initially empty with no error', () => {
    const page = new PageObject()

    renderWithAppState()

    expect(page.inputElement).toHaveProperty('value', '')
    expect(page.errorElement).toBeNull()
  })

  it('initializes using the feed url from app state', () => {
    const page = new PageObject()
    const testUrl = 'https://example.test'

    window.testing.server.use(http.get(testUrl, () => HttpResponse.error()))
    setDocumentUrl(testUrl)

    renderWithAppState()

    expect(page.inputElement).toHaveProperty('value', testUrl)
  })

  it('shows an error for empty input after user starts typing', async () => {
    const page = new PageObject()

    renderWithAppState()

    await page.setUrl('test')
    await page.setUrl('')

    expect(page.inputElement).toHaveProperty('value', '')
    expect(page.errorElement).not.toBeNull()
  })

  it('shows an error when a non-url is entered', async () => {
    const page = new PageObject()

    renderWithAppState()

    await page.setUrl('not a valid url')

    await waitFor(() => {
      expect(page.errorElement).not.toBeNull()
      expect(page.errorElement?.textContent).toInclude('http or https')
    })
  })

  it('shows an error when an invalid https url is entered', async () => {
    const page = new PageObject()

    renderWithAppState()

    await page.setUrl('https://not a valid url')

    await waitFor(() => {
      expect(page.errorElement).not.toBeNull()
      expect(page.errorElement?.textContent).toInclude('Invalid URL')
    })
  })

  it('updates the feed URL when entered URL is valid', async () => {
    const page = new PageObject()
    const testUrl = 'https://example.com/.rss'

    window.testing.server.use(http.get(testUrl, () => HttpResponse.error()))

    const { result } = renderWithAppState()

    await page.submitUrl(testUrl)

    await waitFor(() => {
      expect(result.current.feedUrl).toEqual(testUrl)
    })
  })
})
