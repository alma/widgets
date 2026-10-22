// Vite replaces process.env.BUILD_VERSION at build time.
export const BUILD_VERSION: string = process.env.BUILD_VERSION || 'dev'
