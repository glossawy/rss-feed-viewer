import { Affix, Container, MantineProvider, Stack } from '@mantine/core'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'

import AppStateProvider from '@app/AppStateProvider'
import AppTogglesProvider from '@app/AppTogglesProvider'
import ColorSchemeToggle from '@app/components/ColorSchemeToggle'
import ContentLoadingToggle from '@app/components/ContentLoadingToggle'
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
        <AppTogglesProvider>
          <RequestProxyingProvider proxyUrl={determineProxyUrl()}>
            <AppStateProvider>
              <Container size="lg" pt="sm" py="sm">
                <Affix position={{ right: 20, top: 20 }}>
                  <Stack>
                    <ColorSchemeToggle />
                    <ProxyingToggle />
                    <ContentLoadingToggle />
                  </Stack>
                </Affix>
                <FeedUrlEntry />
                <FeedView />
              </Container>
            </AppStateProvider>
          </RequestProxyingProvider>
        </AppTogglesProvider>
      </MantineProvider>
    </QueryClientProvider>
  )
}

export default App
