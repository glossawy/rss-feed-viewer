/* eslint-disable @typescript-eslint/no-explicit-any */

import { createContext } from 'react'
import Parser from 'rss-parser'

export type Feed = { fetchedUrl: string } & Parser.Output<{
  [key: string]: any
}>

export type AppError = {
  userFacingMessage: string
  internalMessage: string
}

export type Query = {
  feed: Feed | null
  isLoading: boolean
}

export type AppState = {
  feedUrl: string
  errors: {
    feed: AppError | null
  }
}

export type AppStateOps = {
  setFeedUrl: (url: string) => void
}

const warnNotSet = (actionDesc: string) => () => {
  console.warn(`Attempted to ${actionDesc} without a context being set`)
}

export const AppStateContext = createContext<AppState & Query & AppStateOps>({
  feedUrl: '',
  feed: null,
  isLoading: false,
  errors: { feed: null },
  setFeedUrl: warnNotSet('change feed url'),
})
