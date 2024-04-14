import { AppStateContext } from '@app/contexts/appState'
import { useContext } from 'react'

export function useAppState() {
  return useContext(AppStateContext)
}
