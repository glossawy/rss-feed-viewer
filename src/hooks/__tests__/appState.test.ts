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
    expect(result.current.errors).toMatchObject({ feed: null })
  })

  it('provides default operations that log to console', () => {
    const { result } = renderHook(() => useAppState())

    result.current.setFeedUrl('test url')

    const warn = console.warn as Mock<(message: string) => void>

    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toMatch(
      /feed url.+?without a context being set/,
    )
  })
})
