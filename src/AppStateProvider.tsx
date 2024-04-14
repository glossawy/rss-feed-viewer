import { AppError, AppState, AppStateContext } from '@app/contexts/appState'
import { PropsWithChildren, useCallback, useState } from 'react'

type Props = { initialUrl?: string }

export default function AppStateProvider({
  initialUrl,
  children,
}: PropsWithChildren<Props>) {
  const [feedState, setFeedState] = useState<AppState>({
    feedUrl: initialUrl || '',
    errors: {
      url: null,
      feed: null,
    },
  })

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
