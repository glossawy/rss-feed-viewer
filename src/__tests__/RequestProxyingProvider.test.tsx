import { beforeEach, describe, expect, it } from 'bun:test'

import { act, renderHook, waitFor } from '@testing-library/react'

import { useRequestProxy } from '@app/hooks/requestProxy'
import RequestProxyingProvider from '@app/RequestProxyingProvider'
import { LocalStorageKeys } from '@app/utils/localStorageKeys'

function TestProxyingProvider({ children }: { children: React.ReactNode }) {
  return (
    <RequestProxyingProvider proxyUrl={new URL(window.testing.testUrl)}>
      {children}
    </RequestProxyingProvider>
  )
}

describe('RequestProxyingProvider', () => {
  beforeEach(() => localStorage.clear())

  it('is not proxying by default', () => {
    const { result } = renderHook(() => useRequestProxy(), {
      wrapper: TestProxyingProvider,
    })

    expect(result.current.isProxying).toBeFalse()
  })

  it('uses the setting saved in localStorage if set', () => {
    localStorage.setItem(LocalStorageKeys.isProxying, 'true')
    const { result } = renderHook(() => useRequestProxy(), {
      wrapper: TestProxyingProvider,
    })

    expect(result.current.isProxying).toBeTrue()
  })

  it('updates localStorage when setting changes', async () => {
    localStorage.setItem(LocalStorageKeys.isProxying, 'true')
    const { result } = renderHook(() => useRequestProxy(), {
      wrapper: TestProxyingProvider,
    })

    act(() => {
      result.current.setUseProxy(false)
    })

    await waitFor(() => {
      expect(result.current.isProxying).toBeFalse()
    })
  })

  it('returns unmodified urls when not proxying', () => {
    localStorage.setItem(LocalStorageKeys.isProxying, 'false')
    const { result } = renderHook(() => useRequestProxy(), {
      wrapper: TestProxyingProvider,
    })

    expect(result.current.isProxying).toBeFalse()
    expect(result.current.getRequestUrl('test')).toEqual('test')
  })

  it('returns modified urls when proxying', () => {
    localStorage.setItem(LocalStorageKeys.isProxying, 'true')
    const { result } = renderHook(() => useRequestProxy(), {
      wrapper: TestProxyingProvider,
    })

    expect(result.current.getRequestUrl('test')).toEqual(
      `${window.testing.testUrl}/proxy?url=test`,
    )
  })
})
