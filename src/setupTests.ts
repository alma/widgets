// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import secondsToMilliseconds from 'date-fns/secondsToMilliseconds'
import { server } from 'mocks/server'
import { queryClient } from './providers/ReactQuery'

jest.mock('no-scroll', () => ({ on: jest.fn(), off: jest.fn() }))

beforeEach(() => {
  // Mock jest's "Today"
  // Most tests are based on the date 12 December 2021 as "Today"
  Date.now = jest.fn(() => secondsToMilliseconds(1638350762)) // 01 12 2021
})

// MSW
beforeAll(() => {
  // Enable API mocking before tests
  server.listen()
})

beforeEach(() => {
  queryClient.clear() // Clear react-Query client for each test to avoid cache or side effects
})

afterEach(() => {
  // Reset any runtime request handlers we may add during the tests
  server.resetHandlers()
})

afterAll(() => {
  // Clean up once the tests are done
  server.close()
})
