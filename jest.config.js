const path = require('path')
const { resolve } = require('path')
const baseDir = __dirname

module.exports = {
  moduleDirectories: ['node_modules', path.join(__dirname, 'src')],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  collectCoverageFrom: ['src/**/*.tsx', 'src/**/*.ts', '!src/*/polyfills.js'],
  testPathIgnorePatterns: ['<rootDir>/dist/'],
  moduleNameMapper: {
    '\\.(css|less|scss|sss|styl)$': resolve(baseDir, 'node_modules', 'jest-css-modules'), // Equivalent of identity-obj-proxy
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: ['/node_modules/(?!(axios)/)'],
}
