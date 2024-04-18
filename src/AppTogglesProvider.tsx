import { useLocalStorage } from '@mantine/hooks'
import { useCallback } from 'react'

import {
  AppToggleContext,
  AppToggles,
  ToggleType,
} from '@app/contexts/appToggles'
import { LocalStorageKeys } from '@app/utils/localStorageKeys'
type Props = { children: React.ReactNode }

export default function AppTogglesProvider({ children }: Props) {
  const [toggles, setToggles] = useLocalStorage<AppToggles>({
    key: LocalStorageKeys.toggles,
    defaultValue: { proxy: false, 'use-item-content': false },
  })

  const setToggle = useCallback(
    (toggle: ToggleType, enabled: boolean) => {
      setToggles((state) => ({ ...state, [toggle]: enabled }))
    },
    [setToggles],
  )

  const toggle = useCallback(
    (toggle: ToggleType) => {
      setToggle(toggle, !toggles[toggle])
    },
    [toggles, setToggle],
  )

  return (
    <AppToggleContext.Provider value={{ toggles, setToggle, toggle }}>
      {children}
    </AppToggleContext.Provider>
  )
}
