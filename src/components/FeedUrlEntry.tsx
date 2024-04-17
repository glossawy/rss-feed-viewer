import { Container, TextInput } from '@mantine/core'
import { IconRss } from '@tabler/icons-react'
import { useCallback, useEffect, useState } from 'react'

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

type Props = {
  initialValue?: string
}

export default function FeedUrlEntry({ initialValue }: Props) {
  const [anyInput, setAnyInput] = useState(false)
  const [url, setUrl] = useState(initialValue || '')

  const {
    feedUrl,
    errors: { url: urlError },
    setFeedUrl,
    setAppError,
  } = useAppState()

  useEffect(() => {
    const newError = validateUrl(url)

    if (anyInput)
      setAppError(
        'url',
        newError
          ? {
              userFacingMessage: newError,
              internalMessage: newError,
            }
          : null,
      )
  }, [url, setAppError, setFeedUrl])

  useEffect(() => {
    if (url !== feedUrl) setUrl(feedUrl)
  }, [feedUrl])

  const onChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setAnyInput(true)
      setUrl(evt.target.value)
    },
    [setAnyInput, setUrl],
  )

  const onSubmit = useCallback(
    (evt: React.FormEvent<HTMLFormElement>) => {
      evt.preventDefault()
      if (!urlError) setFeedUrl(url)
    },
    [url, urlError, setFeedUrl],
  )

  return (
    <Container fluid p="sm">
      <form onSubmit={onSubmit}>
        <TextInput
          value={url}
          onChange={onChange}
          error={urlError?.userFacingMessage}
          leftSection={<IconRss />}
          placeholder="Enter an RSS feed"
        />
      </form>
    </Container>
  )
}
