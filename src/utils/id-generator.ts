/**
 * Utility functions for generating unique IDs
 */

/**
 * Generate a unique ID with an optional prefix
 * 
 * @param prefix Optional prefix for the ID (e.g., 'user', 'inst')
 * @returns A unique ID string
 */
export function generateId(prefix?: string): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  
  if (prefix) {
    return `${prefix}_${timestamp}${randomPart}`;
  }
  
  return `${timestamp}${randomPart}`;
}