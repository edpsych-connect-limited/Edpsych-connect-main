/**
 * Sentry Stub Module
 * 
 * Used to replace @sentry/nextjs during server-side build to prevent
 * "ReferenceError: self is not defined" error.
 * 
 * This stub provides minimal no-op implementations of Sentry's main exports
 * so that any code trying to use Sentry won't break at runtime.
 */

export const init = () => {
  // No-op: Sentry disabled during build
};

export const captureException = () => {
  // No-op: Sentry disabled during build
};

export const captureMessage = () => {
  // No-op: Sentry disabled during build
};

export const configureScope = () => {
  // No-op: Sentry disabled during build
};

export const setUser = () => {
  // No-op: Sentry disabled during build
};

export const setContext = () => {
  // No-op: Sentry disabled during build
};

export const setTag = () => {
  // No-op: Sentry disabled during build
};

export const setLevel = () => {
  // No-op: Sentry disabled during build
};

// Re-export as default for any import * as Sentry
export default {
  init,
  captureException,
  captureMessage,
  configureScope,
  setUser,
  setContext,
  setTag,
  setLevel,
};
