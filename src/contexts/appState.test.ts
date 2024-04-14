import { Mock, describe, expect, it } from 'bun:test'

import { renderHook } from '@testing-library/react'
import { useContext } from 'react'

import { AppStateContext } from '@app/contexts/appState'
import { ConsoleMocker } from '@app/mocks/console'

describe('AppStateContext', () => {
  ConsoleMocker.install()

  it('returns a value by default', () => {
    const { result } = renderHook(() => useContext(AppStateContext))

    expect(result.current).not.toBeNull()
  })

  it('provides empty defaults', () => {
    const { result } = renderHook(() => useContext(AppStateContext))

    expect(result.current.feedUrl).toBeEmpty()
    expect(result.current.errors).toMatchObject({ url: null, feed: null })
  })

  it('provides default operations that log to console', () => {
    const { result } = renderHook(() => useContext(AppStateContext))

    result.current.setFeedUrl('test url')
    result.current.setAppError('url', {
      userFacingMessage: 'err',
      internalMessage: 'err',
    })
    result.current.clearErrors()

    const warn = console.warn as Mock<(message: string) => void>

    expect(warn.mock.calls).toHaveLength(3)
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
