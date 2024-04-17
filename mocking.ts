import { afterEach, beforeEach, mock } from 'bun:test'

// Allows us to pretend immutable things are mutable ^^
type Mutable<T> = {
  -readonly [k in keyof T]: T[k]
}

window.testing = {
  testUrl: 'https://feed-viewer.test',
}

// Mock console
const originalConsole = { ...console }

function mockConsole() {
  ;(['info', 'warn', 'error'] as const).forEach((key) => {
    console[key] = mock()
  })
}

function unmockConsole() {
  global.console = originalConsole
}

beforeEach(mockConsole)
afterEach(unmockConsole)

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
