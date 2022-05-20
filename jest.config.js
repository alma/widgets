const path = require('path')

module.exports = {
  moduleDirectories: ['node_modules', path.join(__dirname, 'src')],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  collectCoverageFrom: ['src/**/*.tsx', 'src/**/*.ts', '!src/*/polyfills.js'],
  testPathIgnorePatterns: ['<rootDir>/dist/'],
}
