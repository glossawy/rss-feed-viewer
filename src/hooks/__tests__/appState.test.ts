import { Mock, describe, expect, it } from 'bun:test'

import { renderHook } from '@testing-library/react'

import { useAppState } from '@app/hooks/appState'

describe('AppStateContext', () => {
  it('returns a value by default', () => {
    const { result } = renderHook(() => useAppState())

    expect(result.current).not.toBeNull()
  })

  it('provides empty defaults', () => {
    const { result } = renderHook(() => useAppState())

    expect(result.current.feedUrl).toBeEmpty()
    expect(result.current.errors).toMatchObject({ url: null, feed: null })
  })

  it('provides default operations that log to console', () => {
    const { result } = renderHook(() => useAppState())

    result.current.setFeedUrl('test url')
    result.current.setAppError('url', {
      userFacingMessage: 'err',
      internalMessage: 'err',
    })
    result.current.clearErrors()

    const warn = console.warn as Mock<(message: string) => void>

    expect(warn).toHaveBeenCalledTimes(3)
    expect(warn.mock.calls[0][0]).toMatch(
      /feed url.+?without a context being set/,
    )
    expect(warn.mock.calls[1][0]).toMatch(
      /set error.+?without a context being set/,
    )
    expect(warn.mock.calls[2][0]).toMatch(
      /clear error.+?without a context being set/,
    )
  })
})
