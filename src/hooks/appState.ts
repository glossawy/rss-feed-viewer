import { useContext } from 'react'

import { AppStateContext } from '@app/contexts/appState'

export function useAppState() {
  return useContext(AppStateContext)
}
