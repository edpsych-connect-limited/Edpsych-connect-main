/**
 * Production environment requirements
 *
 * Keep these checks tiny and dependency-free.
 * They are intended to fail-fast in production for missing critical secrets.
 */

export function isProductionEnv(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function requireEnv(name: string, opts?: { allowEmpty?: boolean }): string {
  const value = process.env[name];
  const allowEmpty = opts?.allowEmpty ?? false;

  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  if (!allowEmpty && value.trim().length === 0) {
    throw new Error(`Environment variable is set but empty: ${name}`);
  }

  return value;
}

export function requireOneOf(names: string[], label?: string): { name: string; value: string } {
  for (const name of names) {
    const value = process.env[name];
    if (value !== undefined && value.trim().length > 0) {
      return { name, value };
    }
  }

  const display = label ? `${label} (${names.join(' | ')})` : names.join(' | ');
  throw new Error(`Missing required environment variable: ${display}`);
}
