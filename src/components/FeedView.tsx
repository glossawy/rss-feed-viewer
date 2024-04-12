import { useFeed } from '@app/hooks/feed'
import { Container } from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { useEffect, useRef, useState } from 'react'
import Parser from 'rss-parser'

export default function FeedView() {
  const [isLoading, setIsLoading] = useState(false)
  const abortController = useRef<AbortController>()

  const { feed, feedUrl, errors, setFeedError, setFeed } = useFeed()
  const [debouncedUrl] = useDebouncedValue(feedUrl, 500)

  useEffect(() => {
    if (feedUrl === '') return

    if (abortController.current) abortController.current.abort()

    setIsLoading(true)

    const ac = (abortController.current = new AbortController())

    fetch(debouncedUrl, { signal: ac.signal })
      .then(async (response) => {
        if (response.ok)
          return await new Parser().parseString(await response.text())
        else
          setFeedError(
            'feed',
            `Error when fetching feed: ${response.status} - ${response.statusText}`,
          )
      })
      .then((feed) => {
        feed && setFeed(feed)
      })
      .finally(() => {
        if (ac === abortController.current) setIsLoading(false)
      })
  }, [debouncedUrl])

  return (
    <Container>
      {isLoading
        ? 'loading...'
        : errors.feed ||
          (feed == null ? 'No feed yet, enter a URL!' : feed.title)}
    </Container>
  )
}
