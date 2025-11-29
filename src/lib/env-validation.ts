/**
 * Get current environment name
 */
export function getEnvironmentName(): string {
  return process.env.NEXT_PUBLIC_APP_ENV ||
         process.env.NODE_ENV ||
         'unknown';
}