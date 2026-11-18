// Vite replaces import.meta.env.BUILD_VERSION at build time.
export const BUILD_VERSION: string = import.meta.env.BUILD_VERSION || 'dev'
