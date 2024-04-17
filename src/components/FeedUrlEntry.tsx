import { Container, TextInput } from '@mantine/core'
import { IconRss } from '@tabler/icons-react'
import { useCallback, useState } from 'react'

import { useAppState } from '@app/hooks/appState'

function validateUrl(urlValue: string): string | null {
  if (!urlValue.startsWith('http://') && !urlValue.startsWith('https://'))
    return 'Must be an http or https URL, e.g., https://example.com'

  try {
    new URL(urlValue)
  } catch {
    return 'Invalid URL'
  }

  return null
}

export default function FeedUrlEntry() {
  const { feedUrl, setFeedUrl } = useAppState()
  const [lastFeedUrl, setLastFeedUrl] = useState(feedUrl)

  const [url, setUrl] = useState(feedUrl)
  const [error, setError] = useState<string | null>(null)

  const onChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setUrl(evt.target.value)
      setError(validateUrl(evt.target.value))
    },
    [setUrl],
  )

  const onSubmit = useCallback(
    (evt: React.FormEvent<HTMLFormElement>) => {
      evt.preventDefault()
      if (!error) setFeedUrl(url)
    },
    [url, error, setFeedUrl],
  )

  if (lastFeedUrl !== feedUrl) {
    setLastFeedUrl(feedUrl)
    setUrl(feedUrl)
  }

  return (
    <Container fluid p="sm">
      <form onSubmit={onSubmit}>
        <TextInput
          value={url}
          onChange={onChange}
          error={error}
          leftSection={<IconRss color="orange" />}
          placeholder="Enter an RSS feed"
        />
      </form>
    </Container>
  )
}
