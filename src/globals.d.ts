declare global {
  interface WindowEventMap {
    'rssviewer:pushstate': CustomEvent
  }
}

export {}
