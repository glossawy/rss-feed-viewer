import { describe, expect, it } from 'bun:test'

import { renderHook } from '@testing-library/react'

import { useAppToggles } from '@app/hooks/appToggles'

describe('useAppToggles', () => {
  it('returns all false toggles by default', () => {
    const { result } = renderHook(() => useAppToggles())

    expect(Object.values(result.current.toggles).some((v) => v)).toBeFalse()
  })

  it('warns when attempting to set a toggle', () => {
    const { result } = renderHook(() => useAppToggles())

    result.current.setToggle('proxy', true)

    expect(console.warn).toHaveBeenCalledTimes(1)
  })

  it('warns when attempting to toggle a toggle', () => {
    const { result } = renderHook(() => useAppToggles())

    result.current.toggle('proxy')

    expect(console.warn).toHaveBeenCalledTimes(1)
  })
})
