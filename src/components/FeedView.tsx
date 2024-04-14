import { useAppState } from '@app/hooks/appState'
import useFeed from '@app/hooks/feed'
import { Container } from '@mantine/core'
import { useEffect } from 'react'

export default function FeedView() {
  const { feedUrl, errors, setAppError } = useAppState()
  const {
    url: fetchedUrl,
    feed,
    loading,
    error,
  } = useFeed(feedUrl, { debounceMillis: 500 })

  useEffect(() => {
    if (error) {
      if (error.parserError) {
        setAppError('feed', {
          userFacingMessage: 'Feed is either not an RSS feed or is malformed',
          internalMessage: error.parserError,
        })
      } else {
        setAppError('feed', {
          userFacingMessage: `Failed to fetch feed, ${error.statusCode} - ${error.statusCode}`,
          internalMessage: `Received ${error.statusCode} ${error.statusText} at ${fetchedUrl}`,
        })
      }
    }
  }, [setAppError, fetchedUrl, error])

  return (
    <Container>
      {loading
        ? 'loading...'
        : errors.feed?.userFacingMessage ||
          (feed == null ? 'No feed yet, enter a URL!' : feed.title)}
    </Container>
  )
}
