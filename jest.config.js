const path = require('path')

module.exports = {
  moduleDirectories: ['node_modules', path.join(__dirname, 'src')],
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  testPathIgnorePatterns: ['<rootDir>/dist/'],
  testEnvironment: 'jsdom',
  rootDir: 'src',
  moduleNameMapper: {
    '^.+\\.css$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
    '^@/(.*)$': ['<rootDir>/$1'],
    '^test/(.*)$': ['<rootDir>/test/$1'],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  coveragePathIgnorePatterns: ['/node_modules/', '/test/'],
  collectCoverageFrom: ['<rootDir>/**/*.tsx', '<rootDir>/**/*.ts', '!<rootDir>/*/polyfills.js'],
  coverageThreshold: {
    global: {
      branches: 88,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
}
