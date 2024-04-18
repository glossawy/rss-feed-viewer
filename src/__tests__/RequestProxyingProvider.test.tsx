import { describe, expect, it } from 'bun:test'

import { act, renderHook, waitFor } from '@testing-library/react'

import AppTogglesProvider from '@app/AppTogglesProvider'
import { useRequestProxy } from '@app/hooks/requestProxy'
import RequestProxyingProvider from '@app/RequestProxyingProvider'
import setStoredToggle from '@testing/toggles'

function TestProxyingProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppTogglesProvider>
      <RequestProxyingProvider proxyUrl={new URL(window.testing.testUrl)}>
        {children}
      </RequestProxyingProvider>
    </AppTogglesProvider>
  )
}

describe('RequestProxyingProvider', () => {
  it('is not proxying by default', () => {
    const { result } = renderHook(() => useRequestProxy(), {
      wrapper: TestProxyingProvider,
    })

    expect(result.current.isProxying).toBeFalse()
  })

  it('uses the setting saved in localStorage if set', () => {
    setStoredToggle('proxy', true)

    const { result } = renderHook(() => useRequestProxy(), {
      wrapper: TestProxyingProvider,
    })

    expect(result.current.isProxying).toBeTrue()
  })

  it('updates localStorage when setting changes', async () => {
    setStoredToggle('proxy', true)

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
    setStoredToggle('proxy', false)

    const { result } = renderHook(() => useRequestProxy(), {
      wrapper: TestProxyingProvider,
    })

    expect(result.current.isProxying).toBeFalse()
    expect(result.current.getRequestUrl('test')).toEqual('test')
  })

  it('returns modified urls when proxying', () => {
    setStoredToggle('proxy', true)

    const { result } = renderHook(() => useRequestProxy(), {
      wrapper: TestProxyingProvider,
    })

    expect(result.current.getRequestUrl('test')).toEqual(
      `${window.testing.testUrl}/proxy?url=test`,
    )
  })
})
