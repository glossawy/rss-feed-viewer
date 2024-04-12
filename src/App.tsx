import FeedUrlEntry from '@app/components/FeedUrlEntry'
import FeedView from '@app/components/FeedView'
import FeedProvider from '@app/FeedProvider'
import { Container, MantineProvider } from '@mantine/core'

import '@mantine/core/styles.css'

function App() {
  return (
    <MantineProvider>
      <FeedProvider>
        <Container size="md" pt="sm">
          <FeedUrlEntry />
          <FeedView />
        </Container>
      </FeedProvider>
    </MantineProvider>
  )
}

export default App
