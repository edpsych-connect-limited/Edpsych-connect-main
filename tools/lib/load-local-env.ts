import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

export interface LoadLocalEnvOptions {
  /**
   * Repo root (defaults to process.cwd()).
   * Most tools run from repo root already, but being explicit avoids surprises.
   */
  rootDir?: string;
  /**
   * If true, do not log which env files were loaded.
   */
  silent?: boolean;
}

/**
 * Load env files using a Next.js-like precedence (simplified):
 *   .env.{mode}.local
 *   .env.local              (except test)
 *   .env.{mode}
 *   .env
 *
 * - Does NOT override already-set process.env values.
 * - Safe logging: prints filenames only, never values.
 */
export function loadLocalEnv(options: LoadLocalEnvOptions = {}): void {
  const mode = (process.env.NODE_ENV || 'development').toLowerCase();
  const root = options.rootDir || process.cwd();

  const candidates: string[] = [
    `.env.${mode}.local`,
    ...(mode === 'test' ? [] : ['.env.local']),
    `.env.${mode}`,
    '.env',
  ];

  const loaded: string[] = [];
  for (const rel of candidates) {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) continue;
    const result = dotenv.config({ path: abs, override: false });
    if (!result.error) loaded.push(rel);
  }

  if (!options.silent) {
    if (loaded.length > 0) {
      console.log(`Loaded env files: ${loaded.join(', ')}`);
    } else {
      console.log('Loaded env files: (none found)');
    }
  }
}
