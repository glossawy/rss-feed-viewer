import { Container, Paper, Text } from '@mantine/core'

import Feed from '@app/components/feedView/Feed'
import { useAppState } from '@app/hooks/appState'

export default function FeedView() {
  const {
    feedUrl,
    feed,
    isLoading,
    errors: { feed: feedError },
  } = useAppState()

  let display: React.ReactNode

  if (isLoading) {
    display = <Text fw="bold">Loading...</Text>
  } else if (feedError) {
    display = <Text fw="bold">{feedError.userFacingMessage}</Text>
  } else if (feedUrl.trim() === '' || feed?.items == null) {
    display = <Text fw="bold">No items to show</Text>
  } else {
    display = <Feed feed={feed} />
  }

  return (
    <Container>
      <Paper>{display}</Paper>
    </Container>
  )
}
