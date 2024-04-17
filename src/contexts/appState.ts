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
  isFetched: boolean
}

export type AppState = {
  feedUrl: string
  query: Query
  errors: {
    url: AppError | null
    feed: AppError | null
  }
}

export type AppStateOps = {
  setFeedUrl: (url: string) => void
  setAppError: (
    field: keyof AppState['errors'],
    message: AppError | null,
  ) => void
  clearErrors: () => void
}

const warnNotSet = (actionDesc: string) => () => {
  console.warn(`Attempted to ${actionDesc} without a context being set`)
}

export const AppStateContext = createContext<AppState & AppStateOps>({
  feedUrl: '',
  query: {
    feed: null,
    isLoading: false,
    isFetched: false,
  },
  errors: { url: null, feed: null },
  setFeedUrl: warnNotSet('change feed url'),
  setAppError: warnNotSet('set error'),
  clearErrors: warnNotSet('clear errors'),
})
