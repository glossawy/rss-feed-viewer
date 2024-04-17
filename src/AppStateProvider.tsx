import { useCallback, useState } from 'react'

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
    errors: {
      url: null,
      feed: null,
    },
  })
  const { feedUrl: currentFeedUrl } = feedState

  const {
    query: { isLoading },
    error,
    feed,
  } = useFeed(currentFeedUrl)
  const [lastQueryError, setLastQueryError] = useState(error)

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

  if (error !== lastQueryError) {
    setLastQueryError(error)
    setFeedState({
      ...feedState,
      errors: {
        ...feedState.errors,
        feed: error && toAppError(error),
      },
    })
  }

  // useEffect(() => {
  //   console.debug({ fetched: feed?.fetchedUrl, error, isLoading })
  //   setFeedState((state) => ({
  //     ...state,
  //     query: {
  //       feed: feed || null,
  //       isLoading,
  //     },
  //     errors: {
  //       ...state.errors,
  //       feed: error && toAppError(error),
  //     },
  //   }))
  // }, [feed, error, isLoading])

  // If URL Param changed it gets priority, then we communicate any feed url
  // changes to the url param
  if (urlParam !== lastUrlParam) {
    setLastUrlParam(urlParam)
    setFeedUrl(urlParam)
  } else if (currentFeedUrl !== '' && currentFeedUrl !== urlParam) {
    setUrlParam(currentFeedUrl)
  }

  return (
    <AppStateContext.Provider
      value={{
        ...feedState,
        feed: feed || null,
        isLoading,
        setFeedUrl,
        setAppError,
        clearErrors,
      }}
    >
      {children}
    </AppStateContext.Provider>
  )
}
