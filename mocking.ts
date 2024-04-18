import { afterAll, beforeEach, mock } from 'bun:test'

import { setupServer } from 'msw/node'

// Allows us to pretend immutable things are mutable ^^
type Mutable<T> = {
  -readonly [k in keyof T]: T[k]
}

// Mock console
const originalConsole = { ...console }
const consoleKeys = ['info', 'warn', 'error'] as const

beforeEach(() => {
  consoleKeys.forEach((key) => {
    console[key] = mock()
  })
})

// VERY minimal mocking of history API, happy-dom does not provide an implementation
const history = global.history as Mutable<typeof global.history>

const pushStateMock = (history.pushState = mock((_data, _unused, url) => {
  const urlString = (url || '').toString()

  location.href = urlString
}))

beforeEach(() => {
  location.href = window.testing.testUrl
  pushStateMock.mockClear()
})

// MSW Global Setup

const server = setupServer()

server.listen({
  onUnhandledRequest(request) {
    originalConsole.error('Unhandled %s %s', request.method, request.url)
  },
})

beforeEach(() => server.resetHandlers())
afterAll(() => server.close())

window.testing = {
  testUrl: 'https://feed-viewer.test',
  server,
}

// Local Storage setup

beforeEach(() => localStorage.clear())
