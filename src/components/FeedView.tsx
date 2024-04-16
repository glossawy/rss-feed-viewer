import {
  Anchor,
  Box,
  Container,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { IconExternalLink } from '@tabler/icons-react'

import FeedItemList from '@app/components/feedView/FeedItemList'
import { useAppState } from '@app/hooks/appState'

export default function FeedView() {
  const {
    feedUrl,
    query: { feed, isLoading },
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
    display = (
      <Stack>
        <Box>
          <Title order={2}>{feed.title}</Title>
          <Anchor
            href={feed.link}
            size="xs"
            display="flex"
            style={{ flexDirection: 'row', width: 'fit-content' }}
          >
            <Text>{feed.link}</Text>
            <IconExternalLink size={12} style={{ alignSelf: 'center' }} />
          </Anchor>
        </Box>
        <FeedItemList feedItems={feed.items} />
      </Stack>
    )
  }

  return (
    <Container>
      <Paper>{display}</Paper>
    </Container>
  )
}
