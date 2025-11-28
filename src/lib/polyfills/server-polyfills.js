/**
 * Server-Side Polyfills
 * 
 * This module provides polyfills for browser globals when running in server context.
 * These are needed for libraries that assume browser environment but are used in SSR.
 */
import { logger } from '@/lib/logger';


// Only apply polyfills in a Node.js environment (not in browser)
if (typeof window === 'undefined') {
  logger.debug('🔧 Applying server-side polyfills...');

  // Polyfill global 'self'
  if (typeof self === 'undefined') {
    global.self = global;
    logger.debug('✅ Polyfilled: self');
  }

  // Polyfill window
  if (typeof window === 'undefined') {
    global.window = global;
    logger.debug('✅ Polyfilled: window');
  }

  // Polyfill document
  if (typeof document === 'undefined') {
    global.document = {
      createElement: () => ({
        style: {},
        setAttribute: () => {},
        getElementsByTagName: () => [],
        appendChild: () => {}
      }),
      createElementNS: () => ({
        style: {},
        setAttribute: () => {},
        appendChild: () => {}
      }),
      head: { appendChild: () => {} },
      body: { appendChild: () => {} },
      documentElement: { style: {} },
      querySelector: () => null,
      querySelectorAll: () => [],
      getElementById: () => null,
      getElementsByClassName: () => [],
      addEventListener: () => {},
      removeEventListener: () => {}
    };
    logger.debug('✅ Polyfilled: document');
  }

  // Polyfill navigator
  if (typeof navigator === 'undefined') {
    global.navigator = {
      userAgent: 'Node.js Server',
      language: 'en-US',
      platform: process.platform,
      languages: ['en-US', 'en'],
      cookieEnabled: false,
      onLine: true
    };
    logger.debug('✅ Polyfilled: navigator');
  }

  // Polyfill localStorage
  if (typeof localStorage === 'undefined') {
    global.localStorage = {
      getItem: (key) => global._localStorage?.[key] ?? null,
      setItem: (key, value) => {
        global._localStorage = global._localStorage || {};
        global._localStorage[key] = String(value);
      },
      removeItem: (key) => {
        if (global._localStorage) delete global._localStorage[key];
      },
      clear: () => { global._localStorage = {}; },
      key: (index) => {
        if (!global._localStorage) return null;
        return Object.keys(global._localStorage)[index] || null;
      },
      length: 0
    };
    Object.defineProperty(global.localStorage, 'length', {
      get: () => global._localStorage ? Object.keys(global._localStorage).length : 0
    });
    logger.debug('✅ Polyfilled: localStorage');
  }

  // Polyfill sessionStorage
  if (typeof sessionStorage === 'undefined') {
    global.sessionStorage = {
      getItem: (key) => global._sessionStorage?.[key] ?? null,
      setItem: (key, value) => {
        global._sessionStorage = global._sessionStorage || {};
        global._sessionStorage[key] = String(value);
      },
      removeItem: (key) => {
        if (global._sessionStorage) delete global._sessionStorage[key];
      },
      clear: () => { global._sessionStorage = {}; },
      key: (index) => {
        if (!global._sessionStorage) return null;
        return Object.keys(global._sessionStorage)[index] || null;
      },
      length: 0
    };
    Object.defineProperty(global.sessionStorage, 'length', {
      get: () => global._sessionStorage ? Object.keys(global._sessionStorage).length : 0
    });
    logger.debug('✅ Polyfilled: sessionStorage');
  }

  // Polyfill some common browser APIs
  if (typeof fetch === 'undefined') {
    global.fetch = () => Promise.resolve({
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      blob: () => Promise.resolve(new Blob()),
      ok: true,
      status: 200,
      headers: new Map()
    });
    logger.debug('✅ Polyfilled: fetch API stub');
  }

  // Request Animation Frame
  if (typeof requestAnimationFrame === 'undefined') {
    global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
    global.cancelAnimationFrame = (id) => clearTimeout(id);
    logger.debug('✅ Polyfilled: requestAnimationFrame/cancelAnimationFrame');
  }

  // Basic Event System
  if (typeof Event === 'undefined') {
    global.Event = class Event {
      constructor(type, options = {}) {
        this.type = type;
        this.bubbles = !!options.bubbles;
        this.cancelable = !!options.cancelable;
        this.composed = !!options.composed;
      }
    };
    logger.debug('✅ Polyfilled: Event');
  }

  logger.debug('✅ Server-side polyfills applied successfully');
}

// Export a function to explicitly apply polyfills
export function applyServerPolyfills() {
  logger.debug('🔄 Explicitly applying server-side polyfills...');
  // The polyfills are already applied when this module is imported
  return true;
}

// Default export for simpler importing
export default applyServerPolyfills;