import { afterEach, beforeEach, mock } from 'bun:test'

type Mutable<T> = {
  -readonly [k in keyof T]: T[k]
}

// Mock console
const originalConsole = { ...console }

function mockConsole() {
  ;['info', 'warn', 'error'].forEach((key) => {
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
history.pushState = (data, unused, url) => {
  const urlString = (url || '').toString()

  location.href = urlString
}
