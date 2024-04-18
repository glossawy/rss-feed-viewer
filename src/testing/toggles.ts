import { AppToggles, ToggleType } from '@app/contexts/appToggles'
import { LocalStorageKeys } from '@app/utils/localStorageKeys'

function mergeStoredToggles(delta: Partial<AppToggles>) {
  const storedTogglesValue = localStorage.getItem(LocalStorageKeys.toggles)
  const storedToggles: AppToggles = storedTogglesValue
    ? JSON.parse(storedTogglesValue)
    : { proxy: false, 'use-item-content': false }

  localStorage.setItem(
    LocalStorageKeys.toggles,
    JSON.stringify({ ...storedToggles, ...delta }),
  )
}

export default function setStoredToggle(toggle: ToggleType, enabled: boolean) {
  mergeStoredToggles({ [toggle]: enabled })
}
