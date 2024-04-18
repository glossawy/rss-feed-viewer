import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'

import AppStateProvider from '@app/AppStateProvider'

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <AppStateProvider>{children}</AppStateProvider>
      </MantineProvider>
    </QueryClientProvider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export default function renderWithApp(ui: React.ReactNode) {
  return render(ui, { wrapper: AppWrapper })
}
