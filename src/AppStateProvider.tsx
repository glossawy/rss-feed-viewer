import { PropsWithChildren, useCallback, useEffect, useState } from 'react'

import { AppError, AppState, AppStateContext } from '@app/contexts/appState'
import useFeed, { FeedFetchError } from '@app/hooks/feed'
import useUrlParam from '@app/hooks/urlParam'

type Props = { initialUrl?: string }

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

export default function AppStateProvider({
  initialUrl,
  children,
}: PropsWithChildren<Props>) {
  const { urlParam, setUrlParam } = useUrlParam()
  const [feedState, setFeedState] = useState<AppState>({
    feedUrl: initialUrl || '',
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

  const fetchedUrl = feed?.fetchedUrl

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

  // When URL Param changes, update feed url if they dont match
  useEffect(() => {
    if (urlParam === currentFeedUrl) return

    setFeedUrl(urlParam)
  }, [urlParam])

  // When feed changes update URL param if feed loaded
  useEffect(() => {
    if (fetchedUrl == null) return

    setUrlParam(fetchedUrl)
  }, [fetchedUrl])

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
