import { afterEach } from 'bun:test'

import { GlobalRegistrator } from '@happy-dom/global-registrator'

GlobalRegistrator.register()

afterEach(async () => {
  // We dynamically import so that a global document is definitely available
  // when @testing-library/dom is loaded.
  //
  // see: https://github.com/testing-library/dom-testing-library/blob/5c7f2e836799873edd700b42df56b9264a457cc8/src/screen.ts
  const { cleanup } = await import('@testing-library/react')
  if (document.body) cleanup()
})
