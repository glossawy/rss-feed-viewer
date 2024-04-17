import { describe, expect, it } from 'bun:test'

import { renderHook } from '@testing-library/react'

import { useRequestProxy } from '@app/hooks/requestProxy'

describe('useRequestProxy', () => {
  it('will not proxy feed requests by default', () => {
    const { result } = renderHook(() => useRequestProxy())

    expect(result.current.isProxying).toBeFalse()
    expect(result.current.getRequestUrl('test')).toEqual('test')
  })

  it('logs a warning when default setter is used', () => {
    const { result } = renderHook(() => useRequestProxy())

    result.current.setUseProxy(true)

    expect(console.warn).toHaveBeenCalledTimes(1)
  })
})
