import { describe, expect, it } from 'bun:test'

import { act, renderHook, waitFor } from '@testing-library/react'

import AppTogglesProvider from '@app/AppTogglesProvider'
import { useAppToggles } from '@app/hooks/appToggles'
import setStoredToggle from '@testing/toggles'

function TestWrapper({ children }: { children: React.ReactNode }) {
  return <AppTogglesProvider>{children}</AppTogglesProvider>
}

function renderWithWrapper() {
  return renderHook(() => useAppToggles(), { wrapper: TestWrapper })
}

describe('AppTogglesProvider', () => {
  it('has all toggles false by default', () => {
    const { result } = renderWithWrapper()

    expect(Object.values(result.current.toggles).some((v) => v)).toBeFalse()
  })

  it('provides a way to set a specific toggle to true or false', async () => {
    const { result } = renderWithWrapper()

    act(() => {
      result.current.setToggle('proxy', true)
    })

    await waitFor(() => {
      expect(result.current.toggles.proxy).toBeTrue()
    })
  })

  it('provides a way to toggle the value of a toggle', async () => {
    const { result } = renderWithWrapper()

    act(() => {
      result.current.toggle('proxy')
    })

    await waitFor(() => {
      expect(result.current.toggles.proxy).toBeTrue()
    })
  })

  it('loads toggles from local storage', () => {
    setStoredToggle('proxy', true)

    const { result } = renderWithWrapper()

    expect(result.current.toggles.proxy).toBeTrue()
    expect(result.current.toggles['use-item-content']).toBeFalse()
  })
})
