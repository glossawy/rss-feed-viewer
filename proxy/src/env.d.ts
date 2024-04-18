declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PROXY_HOST?: string
      PROXY_PORT?: string
      PROXY_ALLOWED_ORIGINS?: string
    }
  }
}

export {}
