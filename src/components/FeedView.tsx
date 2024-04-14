import { Container } from '@mantine/core'
import { useEffect } from 'react'

import { AppError } from '@app/contexts/appState'
import { useAppState } from '@app/hooks/appState'
import useFeed, { FeedFetchError } from '@app/hooks/feed'

function toAppError(url: string, error: FeedFetchError): AppError {
  if (error.parserError) {
    return {
      userFacingMessage: 'Feed is either not an RSS feed or is malformed',
      internalMessage: error.parserError,
    }
  } else if (error.lowLevelError) {
    return {
      userFacingMessage: 'An unexpected error occurred',
      internalMessage: error.lowLevelError,
    }
  } else if (error.statusCode != null) {
    return {
      userFacingMessage: `Failed to fetch feed, ${error.statusCode} - ${error.statusCode}`,
      internalMessage: `Received ${error.statusCode} ${error.statusText} at ${url}`,
    }
  } else {
    return {
      userFacingMessage: 'Failed to fetch feed, reason unknown',
      internalMessage: `Failed to fetch feed for unknown reason at ${url}`,
    }
  }
}

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
      setAppError('feed', toAppError(fetchedUrl, error))
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
