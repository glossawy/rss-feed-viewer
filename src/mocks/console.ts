import { afterAll, beforeEach, mock } from 'bun:test'

const info = console.info
const warn = console.warn
const error = console.error
const log = console.log

type ConsoleMocker = {
  mock: () => void
  unmock: () => void
  install: () => void
}

export const ConsoleMocker: ConsoleMocker = {
  mock() {
    console.info = mock()
    console.warn = mock()
    console.error = mock()
    console.log = mock()
  },
  unmock() {
    global.console = {
      ...global.console,
      info,
      warn,
      error,
      log,
    }
  },
  install() {
    beforeEach(() => ConsoleMocker.mock())
    afterAll(() => ConsoleMocker.unmock())
  },
}
