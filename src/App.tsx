import AppStateProvider from '@app/AppStateProvider'
import FeedUrlEntry from '@app/components/FeedUrlEntry'
import FeedView from '@app/components/FeedView'
import { Container, MantineProvider } from '@mantine/core'

import '@mantine/core/styles.css'

function App() {
  return (
    <MantineProvider>
      <AppStateProvider>
        <Container size="md" pt="sm">
          <FeedUrlEntry />
          <FeedView />
        </Container>
      </AppStateProvider>
    </MantineProvider>
  )
}

export default App
