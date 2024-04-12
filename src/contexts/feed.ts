import { createContext } from 'react'
import Parser from 'rss-parser'

export type Feed = Parser.Output<{ [key: string]: any }> // eslint-disable-line
type Error = string | null

export type FeedState = {
  feedUrl: string
  feed: Feed | null
  errors: {
    url: Error
    feed: Error
  }
}

const warnNotSet = (actionDesc: string) => () => {
  console.warn(`Attempted to ${actionDesc} without a context being set`)
}

export const FeedContext = createContext<
  FeedState & {
    setFeedUrl: (url: string) => void
    setFeed: (feed: Feed) => void
    setFeedError: (field: keyof FeedState['errors'], message: Error) => void
    clearErrors: () => void
  }
>({
  feedUrl: '',
  feed: null,
  errors: { url: null, feed: null },
  setFeed: warnNotSet('set feed'),
  setFeedUrl: warnNotSet('change feed url'),
  setFeedError: warnNotSet('set error'),
  clearErrors: warnNotSet('clear errors'),
})
