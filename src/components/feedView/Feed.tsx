import {
  Anchor,
  Box,
  Group,
  List,
  Spoiler,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { IconExternalLink } from '@tabler/icons-react'
import Parser from 'rss-parser'

import FeedEntry from '@app/components/feedView/FeedEntry'
import type { Feed } from '@app/contexts/appState'

type Props = {
  feed: Feed
}

function itemKey(item: Parser.Item): string | null {
  // Maybe involve a hash function here as a fallback?
  // Realistically a guid or a link to the article should be unique
  // and available in most cases
  return item.guid || item.link || null
}

export default function Feed({ feed }: Props) {
  const fetchedUrl = new URL(feed.link || feed.fetchedUrl)
  const origin = fetchedUrl.origin
  const source = feed.fetchedUrl

  return (
    <Stack>
      <Box>
        <Group gap={0} id="topOfFeed">
          <Title order={2}>{feed.title}</Title>
          <Anchor href={source} size="xs" style={{ alignSelf: 'flex-start' }}>
            (source)
          </Anchor>
        </Group>
        <Anchor
          href={origin}
          size="xs"
          display="flex"
          style={{ flexDirection: 'row', width: 'fit-content' }}
        >
          <Text>{origin}</Text>
          <IconExternalLink size={12} style={{ alignSelf: 'center' }} />
        </Anchor>
        <Spoiler maxHeight={40} showLabel="Show more" hideLabel="Show less">
          <Text size="sm">{feed.description}</Text>
        </Spoiler>
      </Box>
      <List spacing="md" styles={{ item: { listStyleType: 'none ' } }}>
        {feed.items.map((it) => (
          <List.Item key={itemKey(it)}>
            <FeedEntry feed={feed} item={it} />
          </List.Item>
        ))}
      </List>
      <Stack
        justify="center"
        pt="sm"
        pb="md"
        gap={0}
        style={{ alignItems: 'center' }}
      >
        <Title order={3}>End of Feed</Title>
        <Anchor href="#topOfFeed" size="sm">
          Return to Top
        </Anchor>
      </Stack>
    </Stack>
  )
}
