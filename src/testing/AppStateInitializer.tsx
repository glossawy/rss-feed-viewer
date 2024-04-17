import { useEffect } from 'react'

import { AppState } from '@app/contexts/appState'
import { useAppState } from '@app/hooks/appState'

type Props = {
  feedUrl: string
  errors?: Partial<AppState['errors']>
}

export default function AppStateInitializer({ feedUrl, errors }: Props) {
  const { setAppError, setFeedUrl } = useAppState()

  useEffect(() => {
    if (errors?.feed) setAppError('feed', errors.feed)
    if (errors?.url) setAppError('url', errors.url)
    setFeedUrl(feedUrl)
  }, [])

  return <div data-testid="app-state-initializer"></div>
}
