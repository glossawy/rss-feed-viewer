import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'

import AppStateProvider from '@app/AppStateProvider'

export default function renderWithApp(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  const renderData = render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <AppStateProvider>{ui}</AppStateProvider>
      </MantineProvider>
    </QueryClientProvider>,
  )

  return { queryClient, ...renderData }
}
