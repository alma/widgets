/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BUILD_VERSION: string
}

declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}
