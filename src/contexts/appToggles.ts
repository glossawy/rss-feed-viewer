import { createContext } from 'react'

export type ToggleType = 'proxy' | 'use-item-content'

export type AppToggles = {
  [k in ToggleType]: boolean
}

export type AppToggleOps = {
  setToggle: (toggle: ToggleType, enabled: boolean) => void
  toggle: (toggle: ToggleType) => void
}

export const AppToggleContext = createContext<
  { toggles: AppToggles } & AppToggleOps
>({
  toggles: { proxy: false, 'use-item-content': false },
  setToggle: () =>
    console.warn('Attempting to set toggle without context provider'),
  toggle: () =>
    console.warn('Attempting to toggle setting without context provider'),
})
