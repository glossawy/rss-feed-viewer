import { MantineProvider } from '@mantine/core'
import { render } from '@testing-library/react'

import AppStateProvider from '@app/AppStateProvider'

export default function renderWithApp(ui: React.ReactNode) {
  return render(
    <MantineProvider>
      <AppStateProvider>{ui}</AppStateProvider>
    </MantineProvider>,
  )
}
