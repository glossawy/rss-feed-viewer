import { describe, expect, it } from 'bun:test'

import { act, fireEvent, renderHook, waitFor } from '@testing-library/react'

import useProxyHistory from '@app/hooks/proxyHistory'

const initialUrl = 'https://example.test'
const secondUrl = 'https://another.example.test'
describe('useProxyHistory', () => {
  it('sets the target url to the passed in url initially', () => {
    const {
      result: {
        current: { targetUrl },
      },
    } = renderHook(() => useProxyHistory(initialUrl))

    expect(targetUrl.current).toEqual(initialUrl)
  })

  it('updates the target url when the passed in url changes', () => {
    const {
      result: {
        current: { targetUrl },
      },
      rerender,
    } = renderHook(({ url }) => useProxyHistory(url), {
      initialProps: { url: initialUrl },
    })

    rerender({ url: secondUrl })

    expect(targetUrl.current).toEqual(secondUrl)
  })

  it('does not update the document url when initially mounted', () => {
    renderHook(() => useProxyHistory(initialUrl))

    expect(document.location.href !== initialUrl)
  })

  it('changes the document url and pushes to history when the passed in url changes', async () => {
    const { rerender } = renderHook(({ url }) => useProxyHistory(url), {
      initialProps: { url: initialUrl },
    })

    rerender({ url: secondUrl })

    await waitFor(() => {
      expect(history.pushState).toHaveBeenCalledWith(
        {},
        '',
        `/?url=${encodeURIComponent(secondUrl)}`,
      )
      expect(location.href).toEqual(
        `${window.testing.testUrl}/?url=${encodeURIComponent(secondUrl)}`,
      )
    })
  })

  it('changes the document url and target url when the back button is pressed', async () => {
    const {
      result: {
        current: { targetUrl },
      },
    } = renderHook(() => useProxyHistory(initialUrl))

    act(() => {
      location.href = `${window.testing.testUrl}/?url=test`
      fireEvent.popState(window)
    })

    await waitFor(() => {
      expect(targetUrl.current).toEqual('test')
    })
  })
})
