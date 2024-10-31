const path = require('path')

module.exports = {
  moduleDirectories: ['node_modules', path.join(__dirname, 'src')],
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  collectCoverageFrom: ['src/**/*.tsx', 'src/**/*.ts', '!src/*/polyfills.js'],
  testPathIgnorePatterns: ['<rootDir>/dist/'],
  testEnvironment: 'jsdom',
  rootDir: 'src',
  moduleNameMapper: {
    '\\.s?css': '<rootDir>/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
    '^@/(.*)$': ['<rootDir>/$1'],
    '^test/(.*)$': ['<rootDir>/test/$1'],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  coveragePathIgnorePatterns: ['/node_modules/', '/test/'],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
}
