import { afterEach, beforeEach, mock } from 'bun:test'

import { GlobalRegistrator } from '@happy-dom/global-registrator'

GlobalRegistrator.register()

const originalConsole = { ...console }

function mockConsole() {
  ;['info', 'warn', 'error'].forEach((key) => {
    console[key] = mock()
  })
}

function unmockConsole() {
  global.console = originalConsole
}

afterEach(async () => {
  // We dynamically import so that a global document is definitely available
  // when @testing-library/dom is loaded.
  //
  // see: https://github.com/testing-library/dom-testing-library/blob/5c7f2e836799873edd700b42df56b9264a457cc8/src/screen.ts
  const { cleanup } = await import('@testing-library/react')
  if (document.body) cleanup()
})

beforeEach(mockConsole)
afterEach(unmockConsole)
