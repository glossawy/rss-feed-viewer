import { createContext } from 'react'
import Parser from 'rss-parser'

export type Feed = Parser.Output<{ [key: string]: any }> // eslint-disable-line

export type AppError = {
  userFacingMessage: string
  internalMessage: string
}

export type AppState = {
  feedUrl: string
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
  errors: { url: null, feed: null },
  setFeedUrl: warnNotSet('change feed url'),
  setAppError: warnNotSet('set error'),
  clearErrors: warnNotSet('clear errors'),
})
