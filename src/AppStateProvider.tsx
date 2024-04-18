import { useCallback } from 'react'

import { AppError, AppStateContext } from '@app/contexts/appState'
import useFeed, { FeedFetchError } from '@app/hooks/feed'
import useUrlParam from '@app/hooks/urlParam'

type Props = {
  children: React.ReactNode
}

function toAppError(error: FeedFetchError): AppError {
  switch (error.failureMode) {
    case 'parser':
      return {
        userFacingMessage: 'Feed is either not an RSS feed or is malformed',
        internalMessage: error.message,
      }
    case 'lowlevel':
      return {
        userFacingMessage: 'An unexpected error occurred',
        internalMessage: error.message,
      }
    default:
      return {
        userFacingMessage: 'Failed to fetch feed',
        internalMessage: error.message,
      }
  }
}

export default function AppStateProvider({ children }: Props) {
  const { urlParam, setUrlParam } = useUrlParam()

  const {
    query: { isLoading },
    error,
    feed,
  } = useFeed(urlParam)

  const setFeedUrl = useCallback(
    (feedUrl: string) => {
      setUrlParam(feedUrl)
    },
    [setUrlParam],
  )

  return (
    <AppStateContext.Provider
      value={{
        feedUrl: urlParam,
        errors: {
          feed: error && toAppError(error),
        },
        feed: feed || null,
        isLoading,
        setFeedUrl,
      }}
    >
      {children}
    </AppStateContext.Provider>
  )
}
