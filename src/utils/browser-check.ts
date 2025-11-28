/**
 * Browser/Server detection utilities
 * Safely handle code that should only run in browser or server
 */
export const isBrowser = typeof window !== 'undefined';
export const isServer = typeof window === 'undefined';

type BrowserFunction = () => unknown;
type ServerFunction = () => unknown;
type FallbackValue = unknown;

export function browserOnly(fn: BrowserFunction, fallback?: FallbackValue): unknown {
  if (isBrowser) {
    try {
      return fn();
    } catch (error) {
      console.error('Error in browserOnly function:', error);
      return fallback;
    }
  }
  return fallback;
}

export function serverOnly(fn: ServerFunction, fallback?: FallbackValue): unknown {
  if (isServer) {
    try {
      return fn();
    } catch (error) {
      console.error('Error in serverOnly function:', error);
      return fallback;
    }
  }
  return fallback;
}

export const safeWindow = isBrowser ? window : undefined;
export const safeDocument = isBrowser ? document : undefined;
export const safeLocalStorage = browserOnly(() => window.localStorage);
export const safeSessionStorage = browserOnly(() => window.sessionStorage);
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';
