import { SetupServerApi } from 'msw/node'

interface Testing {
  readonly testUrl: string
  readonly server: SetupServerApi
}

declare global {
  interface Window {
    testing: Testing
  }
}

export {}
