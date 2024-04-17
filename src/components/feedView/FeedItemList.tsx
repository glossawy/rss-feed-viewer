import { Button, Card, List, Text } from '@mantine/core'
import Parser from 'rss-parser'

type Props = {
  feedItems: Parser.Item[]
}

function itemKey(item: Parser.Item): string | null {
  // Maybe involve a hash function here as a fallback?
  // Realistically a guid or a link to the article should be unique
  // and available in most cases
  return item.guid || item.link || null
}

export default function FeedItemList({ feedItems }: Props) {
  return (
    <List spacing="md">
      {feedItems.map((it) => (
        <List.Item key={itemKey(it)} style={{ listStyleType: 'none' }}>
          <Card p="lg" radius="md" withBorder>
            {it.title ? (
              <>
                <Card.Section>
                  <Text fw="bolder">{it.title}</Text>
                  {it.creator ? <Text fw="bold">by {it.creator}</Text> : null}
                </Card.Section>
              </>
            ) : null}
            <Card.Section>
              <Text>{it.contentSnippet}</Text>
            </Card.Section>
            <Card.Section>
              <Button variant="subtle" component="a" href={it.link}>
                Read More
              </Button>
            </Card.Section>
          </Card>
        </List.Item>
      ))}
    </List>
  )
}
