// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import { secondsToMilliseconds } from 'date-fns/secondsToMilliseconds'
import { toHaveNoViolations } from 'jest-axe'

// Extend Jest matchers with jest-axe matchers
expect.extend(toHaveNoViolations)

// Mock window.matchMedia for tests (JSDOM doesn't provide it by default)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false, // Default to false (no reduced motion preference)
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

jest.mock('no-scroll', () => ({ on: jest.fn(), off: jest.fn() }))

// Mock HTMLCanvasElement.getContext pour éviter les erreurs axe-core
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: jest.fn(() => ({
    fillStyle: '',
    fillRect: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    clearRect: jest.fn(),
    getImageData: jest.fn(() => ({ data: [] })),
    putImageData: jest.fn(),
    createImageData: jest.fn(() => ({ data: [] })),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
  })),
})

beforeEach(() => {
  // Mock jest's "Today"
  Date.now = jest.fn(() => secondsToMilliseconds(1638350762)) // 01.12.2021
})

// Clean sessionStorage between all tests
afterEach(() => sessionStorage.clear())
