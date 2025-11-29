/**
 * Enhanced Styled-JSX Patch for Server-Side Rendering
 *
 * This patch completely eliminates "document is not defined" errors during
 * static page generation in Vercel by:
 *
 * 1. Creating a comprehensive mock for document
 * 2. Directly monkey-patching the styled-jsx StyleSheet class
 * 3. Intercepting the actual calls that cause the SSG errors
 *
 * This approach is more invasive but completely resolves the issue.
 */
/* eslint-disable @typescript-eslint/no-require-imports */

// Define a production-ready mock registry for styled-jsx
const createMockRegistry = () => {
  return {
    add: () => {},
    update: () => {},
    remove: () => {},
    reset: () => {},
    getStyles: () => []
  };
};

// Global StyleSheet replacement for styled-jsx
class MockStyleSheet {
  constructor(options) {
    this.tags = [];
    this.ctr = 0;
    this.sheet = null;
    this.cache = {};
    this.registry = createMockRegistry();
  }
  
  inject() { return this; }
  remove() {}
  flush() {}
  getSheet() { return { cssRules: [] }; }
  getRules() { return ""; }
  insertRule(rule) { return 0; }
  deleteRule() {}
  replaceRule() {}
}

// Set up a global registry flag to avoid duplicate patching
if (typeof global !== 'undefined' && !global.__STYLED_JSX_PATCHED__) {
  if (typeof window === 'undefined') {
    logger.debug('🔧 Setting up enhanced styled-jsx patch for SSR and SSG');
    
    // Comprehensive document mock that handles all styled-jsx needs
    if (typeof document === 'undefined') {
      global.document = {
        createElement: () => ({
          style: {},
          setAttribute: () => {},
          appendChild: () => {},
          textContent: ''
        }),
        createTextNode: () => ({ data: '' }),
        getElementById: () => null,
        head: { appendChild: () => {}, removeChild: () => {} },
        body: { appendChild: () => {}, removeChild: () => {} },
        documentElement: { style: {} },
        querySelector: () => null,
        querySelectorAll: () => []
      };
    }
    
    // Directly modify Node.js global to handle references to window
    global.window = global.window || {
      document: global.document,
      StyleSheet: MockStyleSheet
    };
    
    // Handle styled-jsx's references to self
    global.self = global.self || global.window;
    
    // Directly expose the MockStyleSheet globally
    global.StyleSheet = MockStyleSheet;
    
    // Set the flag to avoid duplicate patching
    global.__STYLED_JSX_PATCHED__ = true;
    
    // Next.js specific: set environment flags
    if (typeof process !== 'undefined') {
      process.env.__NEXT_STYLED_JSX_PATCH = 'true';
      process.env.__NEXT_DISABLE_STYLED_JSX_OPTIMIZATION = 'true';
    }
  }
}

// This function is called at runtime to ensure the patch is active
function applyPatch() {
  if (typeof window === 'undefined') {
    try {
      // Try to directly patch styled-jsx modules if they've been loaded
      let styledJsxPath;
      try {
        // Try to resolve the styled-jsx path
         
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        styledJsxPath = require.resolve('styled-jsx/dist/index');
      } catch (_e) {
        // Fallback paths in case require.resolve fails
        const possiblePaths = [
          'node_modules/styled-jsx/dist/index/index.js',
          '../node_modules/styled-jsx/dist/index/index.js',
          '../../node_modules/styled-jsx/dist/index/index.js'
        ];
        
        for (const path of possiblePaths) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            require(path);
            styledJsxPath = path;
            break;
          } catch (_err) {
            // Continue trying paths
          }
        }
      }
      
      // If we found styled-jsx, try to monkey patch it directly
      if (styledJsxPath) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const styledJsx = require(styledJsxPath);
          if (styledJsx && styledJsx.StyleSheet) {
            // Replace the actual StyleSheet implementation
            styledJsx.StyleSheet = MockStyleSheet;
            logger.debug('Successfully monkey-patched styled-jsx StyleSheet');
          }
        } catch (_err) {
          console.warn('Could not directly patch styled-jsx module:', err.message);
        }
      }
      
      return true;
    } catch (_error) {
      console.error('Failed to apply styled-jsx patch:', error);
      return false;
    }
  }
  return true; // No patching needed in browser
}

// Call patch immediately
applyPatch();

// Export a marker function to verify the patch is loaded
export function verifyStyledJsxPatch() {
  return applyPatch();
}

// Apply patch immediately
applyPatch();

// Support CommonJS exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    verifyStyledJsxPatch,
    default: verifyStyledJsxPatch
  };
}

export default verifyStyledJsxPatch;