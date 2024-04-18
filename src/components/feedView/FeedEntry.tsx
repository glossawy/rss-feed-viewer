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
import { useAppToggles } from '@app/hooks/appToggles'

type Props = {
  feed: Feed
  item: Parser.Item
}

export default function FeedEntry({ item }: Props) {
  const { toggles } = useAppToggles()
  const showFullContent = toggles['use-item-content']

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
        <Spoiler
          maxHeight={showFullContent ? 500 : 200}
          showLabel="Show more"
          hideLabel="Show less"
        >
          {showFullContent ? (
            <Text
              dangerouslySetInnerHTML={{
                __html: item.content || item.contentSnippet || '',
              }}
            />
          ) : (
            <Text>{item.contentSnippet}</Text>
          )}
        </Spoiler>
      </Card.Section>
    </Card>
  )
}
