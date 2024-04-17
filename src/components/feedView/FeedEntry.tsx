import {
  Anchor,
  Box,
  Card,
  Divider,
  Group,
  Spoiler,
  Text,
  Title,
} from '@mantine/core'
import { IconExternalLink } from '@tabler/icons-react'
import Parser from 'rss-parser'

import type { Feed } from '@app/contexts/appState'

type Props = {
  feed: Feed
  item: Parser.Item
}

export default function FeedEntry({ item }: Props) {
  return (
    <Card
      withBorder
      shadow="sm"
      radius="md"
      styles={{
        section: {
          padding: '1em',
        },
      }}
    >
      <Card.Section>
        <Group justify="flex-start">
          <Box>
            <Title order={3}>{item.title || ''}</Title>
            {item.creator ? <Text>by {item.creator}</Text> : null}
          </Box>
          <Group justify="flex-end" style={{ flexGrow: 1 }}>
            <Anchor
              display="flex"
              href={item.link}
              style={{ justifyContent: 'right' }}
            >
              <Text>Read More&nbsp;</Text>
              <IconExternalLink />
            </Anchor>
          </Group>
        </Group>
      </Card.Section>
      <Divider variant="dashed" />
      <Card.Section>
        <Spoiler maxHeight={200} showLabel="Show more" hideLabel="Show less">
          {item.contentSnippet}
        </Spoiler>
      </Card.Section>
    </Card>
  )
}
