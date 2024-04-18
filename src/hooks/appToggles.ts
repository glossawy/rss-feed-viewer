import { useContext } from 'react'

import { AppToggleContext } from '@app/contexts/appToggles'

export const useAppToggles = () => {
  return useContext(AppToggleContext)
}
