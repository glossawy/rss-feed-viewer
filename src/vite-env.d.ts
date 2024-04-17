/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_PORT?: string
  readonly VITE_API_PATH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
