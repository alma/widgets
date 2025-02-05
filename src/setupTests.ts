// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import { secondsToMilliseconds } from 'date-fns/secondsToMilliseconds'

jest.mock('no-scroll', () => ({ on: jest.fn(), off: jest.fn() }))

beforeEach(() => {
  // Mock jest's "Today"
  Date.now = jest.fn(() => secondsToMilliseconds(1638350762)) // 01.12.2021
})

// Clean sessionStorage between all tests
afterEach(() => sessionStorage.clear())
