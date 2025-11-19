// @ts-nocheck
// Jest setup file for error handling tests

// This file will be loaded by Jest before tests are run
// Configure any global setup needed for tests here

declare const jest: any;

// Mock Next.js routing
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Configure environment variables
if (!process.env.NODE_ENV) { Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: false }); }

// Suppress React 18 console errors/warnings to keep test output clean
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  if (
    /Warning.*not wrapped in act/i.test(args[0]) ||
    /Warning: ReactDOM.render is no longer supported/i.test(args[0])
  ) {
    return;
  }
  originalConsoleError(...args);
};

console.warn = (...args) => {
  if (/Warning: useLayoutEffect does nothing on the server/i.test(args[0])) {
    return;
  }
  originalConsoleWarn(...args);
};

// Cleanup mock console after all tests
// @ts-expect-error Jest types
if (typeof afterAll !== 'undefined') {
  // @ts-expect-error Jest types
  afterAll(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });
}