interface Testing {
  readonly testUrl: string
}

declare global {
  interface Window {
    testing: Testing
  }
}

export {}
