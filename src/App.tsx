import { Container, MantineProvider } from '@mantine/core'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'

import AppStateProvider from '@app/AppStateProvider'
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
  const searchParams = new URLSearchParams(window.location.search)
  const initialUrl = searchParams.get('url') || ''

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <AppStateProvider initialUrl={initialUrl}>
          <Container size="md" pt="sm">
            <FeedUrlEntry initialValue={initialUrl} />
            <FeedView />
          </Container>
        </AppStateProvider>
      </MantineProvider>
    </QueryClientProvider>
  )
}

export default App
