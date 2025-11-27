/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

// CRITICAL: SSR guard must be first
if (typeof self === 'undefined') {
  if (typeof global !== 'undefined') {
    (global as any).self = global;
  }
}

// Polyfills for browser APIs
if (typeof window !== 'undefined') {
  // Polyfill for requestIdleCallback
  if (!window.requestIdleCallback) {
    window.requestIdleCallback = function (cb: any) {
      const start = Date.now();
      return setTimeout(function () {
        cb({
          didTimeout: false,
          timeRemaining: function () {
            return Math.max(0, 50 - (Date.now() - start));
          },
        });
      }, 1) as any;
    };
  }

  if (!window.cancelIdleCallback) {
    window.cancelIdleCallback = function (id: any) {
      clearTimeout(id);
    };
  }

  // Add other browser-specific polyfills here
}

export {};
/**
 * Complete Polyfills for browser compatibility
 * This file adds essential polyfills and patches to ensure the application works
 * reliably across different browsers and environments
 * All polyfills are self-contained - no external dependencies
 */

// Ensure Promise is available
if (typeof Promise === 'undefined') {
  // Simple Promise polyfill implementation
  (global as any).Promise = (function() {
    function PromisePolyfill(this: any, executor: (resolve: (value: any) => void, reject: (reason: any) => void) => void) {
      this._state = 'pending';
      this._value = undefined;
      this._callbacks = [];

      const resolve = (value: any) => {
        if (this._state !== 'pending') return;
        this._state = 'fulfilled';
        this._value = value;
        this._callbacks.forEach((cb: any) => cb.onFulfilled(value));
      };

      const reject = (reason: any) => {
        if (this._state !== 'pending') return;
        this._state = 'rejected';
        this._value = reason;
        this._callbacks.forEach((cb: any) => cb.onRejected(reason));
      };

      try {
        executor(resolve, reject);
      } catch (error) {
        reject(error);
      }
    }

    PromisePolyfill.prototype.then = function(this: any, onFulfilled: any, onRejected: any) {
      return new (PromisePolyfill as any)((resolve: any, reject: any) => {
        const callback = { onFulfilled, onRejected };

        if (this._state === 'fulfilled') {
          setTimeout(() => {
            try {
              const result = onFulfilled ? onFulfilled(this._value) : this._value;
              resolve(result);
            } catch (error) {
              reject(error);
            }
          }, 0);
        } else if (this._state === 'rejected') {
          setTimeout(() => {
            try {
              const result = onRejected ? onRejected(this._value) : this._value;
              reject(result);
            } catch (error) {
              reject(error);
            }
          }, 0);
        } else {
          this._callbacks.push(callback);
        }
      });
    };

    PromisePolyfill.prototype.catch = function(this: any, onRejected: any) {
      return this.then(null, onRejected);
    };

    PromisePolyfill.prototype.finally = function(this: any, onFinally: any) {
      return this.then(
        (value: any) => {
          onFinally();
          return value;
        },
        (reason: any) => {
          onFinally();
          throw reason;
        }
      );
    };

    PromisePolyfill.resolve = function(value: any) {
      return new (PromisePolyfill as any)((resolve: any) => resolve(value));
    };

    PromisePolyfill.reject = function(reason: any) {
      return new (PromisePolyfill as any)((_: any, reject: any) => reject(reason));
    };

    PromisePolyfill.all = function(promises: any[]) {
      return new (PromisePolyfill as any)((resolve: any, reject: any) => {
        const results: any[] = [];
        let completed = 0;

        promises.forEach((promise, index) => {
          PromisePolyfill.resolve(promise).then(
            (value: any) => {
              results[index] = value;
              completed++;
              if (completed === promises.length) {
                resolve(results);
              }
            },
            reject
          );
        });
      });
    };

    PromisePolyfill.race = function(promises: any[]) {
      return new (PromisePolyfill as any)((resolve: any, reject: any) => {
        promises.forEach((promise) => {
          PromisePolyfill.resolve(promise).then(resolve, reject);
        });
      });
    };

    return PromisePolyfill;
  })();
}

// Fetch API polyfill
if (typeof window !== 'undefined' && !window.fetch) {
  // Simple fetch polyfill implementation
  (window as any).fetch = function(url: string, options: any = {}) {
    return new Promise((resolve: any, reject: any) => {
      const xhr = new XMLHttpRequest();

      xhr.open(options.method || 'GET', url, true);

      // Set headers
      if (options.headers) {
        Object.keys(options.headers).forEach(key => {
          xhr.setRequestHeader(key, options.headers[key]);
        });
      }

      // Set response type
      if (options.responseType) {
        xhr.responseType = options.responseType;
      }

      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            ok: true,
            status: xhr.status,
            statusText: xhr.statusText,
            url: xhr.responseURL,
            text: () => Promise.resolve(xhr.responseText),
            json: () => Promise.resolve(JSON.parse(xhr.responseText)),
            blob: () => Promise.resolve(new Blob([xhr.response])),
            arrayBuffer: () => Promise.resolve(xhr.response),
            headers: {
              get: (name: string) => xhr.getResponseHeader(name)
            }
          });
        } else {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      };

      xhr.onerror = function() {
        reject(new Error('Network error'));
      };

      if (options.body) {
        xhr.send(options.body);
      } else {
        xhr.send();
      }
    });
  };

  // Headers polyfill
  (window as any).Headers = class Headers {
    private map: Map<string, string> = new Map();

    constructor(init?: any) {
      if (init) {
        if (Array.isArray(init)) {
          init.forEach(([key, value]) => this.set(key, value));
        } else if (init) {
          Object.keys(init).forEach(key => this.set(key, init[key]));
        }
      }
    }

    append(name: string, value: string) {
      this.map.set(name.toLowerCase(), value);
    }

    set(name: string, value: string) {
      this.map.set(name.toLowerCase(), value);
    }

    get(name: string) {
      return this.map.get(name.toLowerCase()) || null;
    }

    has(name: string) {
      return this.map.has(name.toLowerCase());
    }

    delete(name: string) {
      this.map.delete(name.toLowerCase());
    }

    forEach(callback: (value: string, key: string) => void) {
      this.map.forEach((value, key) => callback(value, key));
    }
  };

  // Request polyfill
  (window as any).Request = class Request {
    constructor(input: string | Request, init?: any) {
      this.url = typeof input === 'string' ? input : input.url;
      this.method = init?.method || 'GET';
      this.headers = new Headers(init?.headers);
      this.body = init?.body;
    }

    url: string;
    method: string;
    headers: any;
    body: any;
  };

  // Response polyfill
  (window as any).Response = class Response {
    constructor(body?: any, init?: any) {
      this.body = body;
      this.status = init?.status || 200;
      this.statusText = init?.statusText || 'OK';
      this.headers = new Headers(init?.headers);
      this.ok = this.status >= 200 && this.status < 300;
    }

    body: any;
    status: number;
    statusText: string;
    headers: any;
    ok: boolean;

    text() {
      return Promise.resolve(this.body);
    }

    json() {
      return Promise.resolve(JSON.parse(this.body));
    }

    blob() {
      return Promise.resolve(new Blob([this.body]));
    }

    arrayBuffer() {
      return Promise.resolve(this.body);
    }
  };
}

// Object.assign polyfill
if (typeof Object.assign !== 'function') {
  Object.assign = function(target: any, ...args: any[]) {
    if (target === null || target === undefined) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    const to = Object(target);

    for (let i = 0; i < args.length; i++) {
      const nextSource = args[i];
      if (nextSource !== null && nextSource !== undefined) {
        for (const nextKey in nextSource) {
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}

// Array.from polyfill
if (!Array.from) {
  Array.from = function(arrayLike: any, mapFn?: (value: any, index: number) => any, thisArg?: any) {
    const items = Object(arrayLike);
    if (items === null || items === undefined) {
      throw new TypeError('Array.from requires an array-like object');
    }

    const len = Number(items.length);
    if (Number.isNaN(len) || len < 0) {
      return [];
    }
    if (len === 0) {
      return [];
    }

    const A = new Array(len);
    let k = 0;

    while (k < len) {
      const kValue = items[k];
      if (mapFn) {
        A[k] = thisArg ? mapFn.call(thisArg, kValue, k) : mapFn(kValue, k);
      } else {
        A[k] = kValue;
      }
      k += 1;
    }

    return A;
  };
}

// Array.prototype.includes polyfill
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement: any, fromIndex?: number) {
    if (this == null) {
      throw new TypeError('"this" is null or not defined');
    }

    const o = Object(this);
    const len = o.length >>> 0;

    if (len === 0) {
      return false;
    }

    const n = fromIndex || 0;
    let k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

    while (k < len) {
      if (o[k] === searchElement || (Number.isNaN(o[k]) && Number.isNaN(searchElement))) {
        return true;
      }
      k++;
    }

    return false;
  };
}

// String.prototype.includes polyfill
if (!String.prototype.includes) {
  String.prototype.includes = function(search: string, start?: number) {
    if (this == null) {
      throw new TypeError('"this" is null or not defined');
    }

    const string = String(this);
    const index = string.indexOf(search, start);
    return index !== -1;
  };
}

// Add type declaration for monitoring service
declare global {
  interface Window {
    __MONITORING_SERVICE?: {
      logError: (error: any) => void;
      captureEvent: (event: string, data?: any) => void;
    };
    __APP_ONLINE?: boolean;
    getTenantInfo?: () => { id: string; isDedicated: boolean; hostname: string };
  }
}

// Error handling for unhandled promises
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();

    if (process.env.NODE_ENV === 'production' && typeof window.__MONITORING_SERVICE !== 'undefined') {
      try {
        window.__MONITORING_SERVICE.logError(event.reason);
      } catch (e) {
        // Silently fail if monitoring is unavailable
      }
    }
  });
}

// Enhance console error for better debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const timestamp = new Date().toISOString();
    originalConsoleError.apply(console, [`[${timestamp}]`, ...args]);

    if (args[0] && typeof args[0] === 'string' && (
      args[0].includes('Unexpected token') ||
      args[0].includes('SyntaxError') ||
      args[0].includes('ChunkLoadError')
    )) {
      originalConsoleError.apply(console, [
        '%c ASSET LOADING ERROR - CHECK NETWORK TAB ',
        'background: #ff0000; color: white; font-size: 16px; padding: 2px 5px; border-radius: 2px;'
      ]);
    }
  };
}

// Add offline detection
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Application is online');
    (window as any).__APP_ONLINE = true;
    window.dispatchEvent(new CustomEvent('app:online'));
  });

  window.addEventListener('offline', () => {
    console.log('Application is offline');
    (window as any).__APP_ONLINE = false;
    window.dispatchEvent(new CustomEvent('app:offline'));
  });

  (window as any).__APP_ONLINE = navigator.onLine;
}

// Basic tenant detection helper
if (typeof window !== 'undefined') {
  (window as any).getTenantInfo = function() {
    try {
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      if (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'app') {
        return {
          id: parts[0],
          isDedicated: true,
          hostname: hostname
        };
      }

      return {
        id: 'default',
        isDedicated: false,
        hostname: hostname
      };
    } catch (e) {
      return {
        id: 'default',
        isDedicated: false,
        hostname: 'unknown'
      };
    }
  };
}

// Export a marker to indicate polyfills have loaded
export const POLYFILLS_LOADED = true;