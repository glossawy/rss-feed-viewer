import { Affix, Container, MantineProvider } from '@mantine/core'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'

import AppStateProvider from '@app/AppStateProvider'
import ColorSchemeToggle from '@app/components/ColorSchemeToggle'
import FeedUrlEntry from '@app/components/FeedUrlEntry'
import FeedView from '@app/components/FeedView'
import ProxyingToggle from '@app/components/ProxyingToggle'
import RequestProxyingProvider from '@app/RequestProxyingProvider'

import '@mantine/core/styles.css'

function determineProxyUrl(): URL {
  const { PROD: isProduction, VITE_API_PATH, VITE_API_PORT } = import.meta.env

  if (isProduction) {
    const originOnly = new URL(window.location.href).origin
    return new URL(originOnly)
  } else {
    const apiUrl = new URL(window.location.href)
    if (VITE_API_PORT) apiUrl.host = `${apiUrl.hostname}:${VITE_API_PORT}`
    if (VITE_API_PATH) apiUrl.pathname = VITE_API_PATH

    return apiUrl
  }
}

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
      <MantineProvider>
        <RequestProxyingProvider proxyUrl={determineProxyUrl()}>
          <AppStateProvider>
            <Container size="md" pt="sm">
              <Affix position={{ right: 20, top: 20 }}>
                <ProxyingToggle />
                <ColorSchemeToggle />
              </Affix>
              <FeedUrlEntry />
              <FeedView />
            </Container>
          </AppStateProvider>
        </RequestProxyingProvider>
      </MantineProvider>
    </QueryClientProvider>
  )
}

export default App
