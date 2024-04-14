import { Container, TextInput } from '@mantine/core'
import { useDebouncedState } from '@mantine/hooks'
import { IconRss } from '@tabler/icons-react'
import { useCallback, useEffect } from 'react'

import { useAppState } from '@app/hooks/appState'

function validateUrl(urlValue: string): string | null {
  if (urlValue.trim() === '') return null

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
  const [url, setUrl] = useDebouncedState('', 200)

  const {
    errors: { url: urlError },
    setFeedUrl,
    setAppError,
  } = useAppState()

  useEffect(() => {
    const newError = validateUrl(url)

    if (newError == null) setFeedUrl(url)
    else
      setAppError('url', {
        userFacingMessage: newError,
        internalMessage: newError,
      })
  }, [url, setAppError, setFeedUrl])

  const onChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setUrl(evt.target.value)
    },
    [setUrl],
  )

  return (
    <Container fluid p="sm">
      <TextInput
        onChange={onChange}
        error={urlError?.userFacingMessage}
        leftSection={<IconRss />}
      />
    </Container>
  )
}
