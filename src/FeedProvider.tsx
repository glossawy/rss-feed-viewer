import { Feed, FeedContext, FeedState } from '@app/contexts/feed'
import { PropsWithChildren, useCallback, useState } from 'react'

type Props = { initialUrl?: string }

export default function FeedProvider({
  initialUrl,
  children,
}: PropsWithChildren<Props>) {
  const [feedState, setFeedState] = useState<FeedState>({
    feedUrl: initialUrl || '',
    feed: null,
    errors: {
      url: null,
      feed: null,
    },
  })

  const setFeedError = useCallback(
    (name: 'url' | 'feed', message: string | null) => {
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

  const setFeed = useCallback(
    (feed: Feed) => {
      setFeedError('feed', null)
      setFeedState((state) => ({ ...state, feed }))
    },
    [setFeedError, setFeedState],
  )

  const setFeedUrl = useCallback(
    (feedUrl: string) => {
      clearErrors()
      setFeedState((state) => ({ ...state, feedUrl }))
    },
    [clearErrors, setFeedState],
  )

  return (
    <FeedContext.Provider
      value={{
        ...feedState,
        setFeed,
        setFeedUrl,
        setFeedError,
        clearErrors,
      }}
    >
      {children}
    </FeedContext.Provider>
  )
}
