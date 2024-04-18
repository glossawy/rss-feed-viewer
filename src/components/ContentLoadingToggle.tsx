import { Button } from '@mantine/core'
import { IconArticle, IconArticleOff } from '@tabler/icons-react'
import { useCallback } from 'react'

import { useAppToggles } from '@app/hooks/appToggles'

export default function ContentLoadingToggle() {
  const { toggles, toggle } = useAppToggles()
  const isFullyLoading = toggles['use-item-content']

  const onClick = useCallback(() => {
    toggle('use-item-content')
  }, [toggle])

  const description = isFullyLoading
    ? 'Articles are being fully loaded, click to only load snippets'
    : 'Only article snippets are being shown, click to load full articles'

  return (
    <Button variant="subtle" color="gray" onClick={onClick} title={description}>
      {isFullyLoading ? <IconArticle /> : <IconArticleOff />}
    </Button>
  )
}
