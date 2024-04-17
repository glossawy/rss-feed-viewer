import { describe, expect, it } from 'bun:test'

import { act, fireEvent, renderHook, waitFor } from '@testing-library/react'

import useUrlParam from '@app/hooks/urlParam'

function createDocumentPathname(urlParam: string) {
  return `/?url=${encodeURIComponent(urlParam)}`
}

function createDocumentUrl(urlParam: string) {
  return `${window.testing.testUrl}${createDocumentPathname(urlParam)}`
}

function setDocumentUrl(urlParam: string) {
  location.href = createDocumentUrl(urlParam)
}

describe('useProxyHistory', () => {
  it('without a url param set in the document url, returns an empty value', () => {
    const { result } = renderHook(() => useUrlParam())

    expect(result.current.urlParam).toBeEmpty()
  })

  it('with a url param set in the document url, uses that value on mount', () => {
    setDocumentUrl('test')
    location.href = `${window.testing.testUrl}/?url=test`
    const { result } = renderHook(() => useUrlParam())

    expect(result.current.urlParam).toEqual('test')
  })

  it('updates the document url and pushes to history when setter called', async () => {
    const { result } = renderHook(() => useUrlParam())

    act(() => {
      result.current.setUrlParam('test')
    })

    await waitFor(() => {
      expect(history.pushState).toHaveBeenCalledTimes(1)
      expect(history.pushState).toHaveBeenCalledWith(
        {},
        '',
        createDocumentPathname('test'),
      )
      expect(location.href).toEqual(createDocumentUrl('test'))
      expect(result.current.urlParam).toEqual('test')
    })
  })

  it('changes the document url and url param value when the back button is pressed', async () => {
    const { result } = renderHook(() => useUrlParam())

    act(() => {
      setDocumentUrl('test')
      fireEvent.popState(window)
    })

    await waitFor(() => {
      expect(result.current.urlParam).toEqual('test')
    })
  })

  it('propagates change to all mounted hooks', async () => {
    setDocumentUrl('initial')
    const { result: result1 } = renderHook(() => useUrlParam())
    const { result: result2 } = renderHook(() => useUrlParam())
    const { result: result3 } = renderHook(() => useUrlParam())

    act(() => {
      result1.current.setUrlParam('propagate')
    })

    await waitFor(() => {
      expect(result1.current.urlParam).toEqual('propagate')
      expect(result2.current.urlParam).toEqual('propagate')
      expect(result3.current.urlParam).toEqual('propagate')
    })
  })
})
