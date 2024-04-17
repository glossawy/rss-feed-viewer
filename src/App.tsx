import { Container, MantineProvider } from '@mantine/core'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'

import AppStateProvider from '@app/AppStateProvider'
import ColorSchemeToggle from '@app/components/ColorSchemeToggle'
import FeedUrlEntry from '@app/components/FeedUrlEntry'
import FeedView from '@app/components/FeedView'

import '@mantine/core/styles.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
})

const queryClientPersister = createSyncStoragePersister({
  storage: window.localStorage,
})

persistQueryClient({ queryClient, persister: queryClientPersister })

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider defaultColorScheme="auto">
        <AppStateProvider>
          <Container size="md" pt="sm">
            <ColorSchemeToggle />
            <FeedUrlEntry />
            <FeedView />
          </Container>
        </AppStateProvider>
      </MantineProvider>
    </QueryClientProvider>
  )
}

export default App
