declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PROXY_ALLOWED_ORIGINS?: string
    }
  }
}

export {}
