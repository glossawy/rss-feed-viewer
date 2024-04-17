import { useCallback, useEffect, useState } from 'react'

import { AppError, AppState, AppStateContext } from '@app/contexts/appState'
import useFeed, { FeedFetchError } from '@app/hooks/feed'
import useUrlParam from '@app/hooks/urlParam'

type Props = { children: React.ReactNode }

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
  const [lastUrlParam, setLastUrlParam] = useState(urlParam)
  const [feedState, setFeedState] = useState<AppState>({
    feedUrl: urlParam,
    query: {
      feed: null,
      isFetched: false,
      isLoading: false,
    },
    errors: {
      url: null,
      feed: null,
    },
  })
  const { feedUrl: currentFeedUrl } = feedState

  const {
    query: { isLoading, isFetched },
    error,
    feed,
  } = useFeed(currentFeedUrl)

  const setAppError = useCallback(
    (name: 'url' | 'feed', message: AppError | null) => {
      if (message) console.error(`App Error: ${message.internalMessage}`)

      setFeedState((state) => ({
        ...state,
        errors: { ...state.errors, [name]: message },
      }))
    },
    [setFeedState],
  )

  const clearErrors = useCallback(
    () =>
      setFeedState((state) => ({
        ...state,
        errors: { url: null, feed: null },
      })),
    [setFeedState],
  )

  const setFeedUrl = useCallback(
    (feedUrl: string) => {
      clearErrors()
      setFeedState((state) => ({ ...state, feedUrl }))
    },
    [clearErrors, setFeedState],
  )

  useEffect(() => {
    setFeedState((state) => ({
      ...state,
      query: {
        feed: feed || null,
        isLoading,
        isFetched,
      },
      errors: {
        ...state.errors,
        feed: error && toAppError(error),
      },
    }))
  }, [feed, error, isLoading, isFetched])

  // When URL Param changes, update feed url
  useEffect(() => {
    if (urlParam !== lastUrlParam) {
      setLastUrlParam(urlParam)
      setFeedUrl(urlParam)
    }
  }, [urlParam])

  /// When feed url changes, update the URL param, dont update to blank url
  useEffect(() => {
    if (currentFeedUrl === '') return

    setUrlParam(currentFeedUrl)
  }, [currentFeedUrl])

  return (
    <AppStateContext.Provider
      value={{
        ...feedState,
        setFeedUrl,
        setAppError,
        clearErrors,
      }}
    >
      {children}
    </AppStateContext.Provider>
  )
}
