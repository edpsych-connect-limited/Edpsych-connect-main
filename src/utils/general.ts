import { v4 as uuidv4 } from 'uuid';

/**
 * General utility functions used throughout the application
 */

/**
 * Generate a UUID v4
 * 
 * @returns A unique UUID string
 */
export function generateUUID(): string {
  return uuidv4();
}

/**
 * Get the current timestamp as a Date object
 * 
 * @returns Current Date object
 */
export function getCurrentTimestamp(): Date {
  return new Date();
}

/**
 * Format a date as an ISO string without milliseconds
 * 
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('.')[0] + 'Z';
}

/**
 * Create a slug from a string (for URLs, IDs, etc.)
 * 
 * @param str - The string to convert to a slug
 * @returns A URL-friendly slug
 */
export function createSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Remove consecutive hyphens
}

/**
 * Safely parse JSON with error handling
 * 
 * @param jsonString - The JSON string to parse
 * @param fallback - Optional fallback value if parsing fails
 * @returns The parsed object or fallback value
 */
export function safeJsonParse<T>(jsonString: string, fallback: T = null as unknown as T): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch (_error) {
    return fallback;
  }
}

/**
 * Safely stringify to JSON with error handling
 * 
 * @param value - The value to stringify
 * @param fallback - Optional fallback string if stringification fails
 * @returns The JSON string or fallback
 */
export function safeJsonStringify(value: any, fallback: string = '{}'): string {
  try {
    return JSON.stringify(value);
  } catch (_error) {
    return fallback;
  }
}

/**
 * Delay execution for a specified number of milliseconds
 * 
 * @param ms - Time to delay in milliseconds
 * @returns Promise that resolves after the delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a deep copy of an object
 * 
 * @param obj - The object to clone
 * @returns A deep copy of the object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Get a random integer between min and max (inclusive)
 * 
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Random integer
 */
export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}