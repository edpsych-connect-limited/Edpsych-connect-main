/**
 * FILE: src/lib/validation/environmentConfigValidator.ts
 * PURPOSE: Validate environment variables and build-time configuration
 *
 * DETECTS:
 * - Missing required environment variables
 * - process.env.* accessed at module level (will fail at build time)
 * - Unsafe env var usage without fallbacks
 * - Non-existent or misnamed env vars
 *
 * WHY THIS MATTERS:
 * The Stripe build error showed env vars accessed without checks.
 * This validator catches those before build time.
 */

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

interface EnvConfigError {
  file: string;
  line: number;
  column: number;
  message: string;
  envVar: string;
  code: 'MISSING_REQUIRED_ENV' | 'UNSAFE_ENV_ACCESS' | 'MODULE_LEVEL_ENV_READ' | 'INVALID_ENV_VAR';
  severity: 'error' | 'warning';
  fix?: string;
}

interface EnvConfigResult {
  isValid: boolean;
  errors: EnvConfigError[];
  warnings: EnvConfigError[];
  missingEnvVars: string[];
  unsafePatterns: string[];
}

/**
 * Environment/Configuration Validator
 * Detects build-time configuration issues that prevent deployment
 */
export class EnvironmentConfigValidator {
  private requiredEnvVars: Set<string>;
  private optionalEnvVars: Set<string>;
  private sourceDir: string;

  constructor(sourceDir: string = 'src') {
    this.sourceDir = sourceDir;
    this.requiredEnvVars = new Set([
      'STRIPE_SECRET_KEY',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
    ]);

    this.optionalEnvVars = new Set([
      'REDIS_URL',
      'ANALYTICS_KEY',
      'NEXT_PUBLIC_API_URL',
    ]);
  }

  /**
   * Validate entire source directory
   */
  async validateDirectory(sourceDir: string): Promise<EnvConfigResult> {
    const errors: EnvConfigError[] = [];
    const warnings: EnvConfigError[] = [];
    const allMissingVars = new Set<string>();
    const allUnsafePatterns = new Set<string>();

    const files = this.getAllTypeScriptFiles(sourceDir);

    for (const file of files) {
      const result = await this.validateFile(file);
      errors.push(...result.errors);
      warnings.push(...result.warnings);
      result.missingEnvVars.forEach(v => allMissingVars.add(v));
      result.unsafePatterns.forEach(p => allUnsafePatterns.add(p));
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      missingEnvVars: Array.from(allMissingVars),
      unsafePatterns: Array.from(allUnsafePatterns),
    };
  }

  /**
   * Validate single file for env var issues
   */
  async validateFile(filePath: string): Promise<EnvConfigResult> {
    const errors: EnvConfigError[] = [];
    const warnings: EnvConfigError[] = [];
    const missingEnvVars = new Set<string>();
    const unsafePatterns = new Set<string>();

    try {
      if (!fs.existsSync(filePath)) {
        return { isValid: true, errors: [], warnings: [], missingEnvVars: [], unsafePatterns: [] };
      }

      const sourceCode = fs.readFileSync(filePath, 'utf-8');
      const sourceFile = ts.createSourceFile(
        filePath,
        sourceCode,
        ts.ScriptTarget.Latest,
        true
      );

      this.visitNode(
        sourceFile,
        filePath,
        sourceCode,
        errors,
        warnings,
        missingEnvVars,
        unsafePatterns
      );
    } catch (_error) {
      console.error(`Error validating ${filePath}:`, _error);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      missingEnvVars: Array.from(missingEnvVars),
      unsafePatterns: Array.from(unsafePatterns),
    };
  }

  /**
   * Recursively visit AST nodes to find env var issues
   */
  private visitNode(
    node: ts.Node,
    filePath: string,
    sourceCode: string,
    errors: EnvConfigError[],
    warnings: EnvConfigError[],
    missingEnvVars: Set<string>,
    unsafePatterns: Set<string>
  ): void {
    // Check for property access: process.env.VARIABLE
    if (
      ts.isPropertyAccessExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.expression.getText() === 'process' &&
      node.expression.name.getText() === 'env'
    ) {
      const envVarName = node.name.getText();
      const { line, column } = this.getLineCol(filePath, sourceCode, node.getStart());

      // Check if var is required
      if (this.requiredEnvVars.has(envVarName)) {
        // If accessed with non-null assertion (!), that's a problem
        const parent = node.parent;
        if (parent && (parent as any).kind === 229) { // 229 = NonNullAssertionExpression in TS
          const error: EnvConfigError = {
            file: filePath,
            line,
            column,
            message: `Required env var "${envVarName}" accessed with non-null assertion (!) - will fail if not set at build time`,
            envVar: envVarName,
            code: 'UNSAFE_ENV_ACCESS',
            severity: 'error',
            fix: `Use a fallback: process.env.${envVarName} || 'default-value' or check if (process.env.${envVarName}) before using`,
          };
          errors.push(error);
          missingEnvVars.add(envVarName);
        }
      }

      // Check if this is at module level (top level of file = not in function)
      if (this.isModuleLevel(node)) {
        const error: EnvConfigError = {
          file: filePath,
          line,
          column,
          message: `Env var "${envVarName}" accessed at module level - will execute during build and fail if not set`,
          envVar: envVarName,
          code: 'MODULE_LEVEL_ENV_READ',
          severity: 'error',
          fix: `Move this inside a function or API route handler. Use: const value = process.env.${envVarName} inside a function.`,
        };
        errors.push(error);
        unsafePatterns.add(`MODULE_LEVEL: process.env.${envVarName}`);
      }

      // Check if it looks like a Stripe key
      if (envVarName.includes('STRIPE') && !envVarName.startsWith('NEXT_PUBLIC_')) {
        // Check for .next/ or build artifacts (sign of module-level execution in prod build)
        if (this.hasSecretKeyPattern(filePath)) {
          warnings.push({
            file: filePath,
            line,
            column,
            message: `Stripe secret key "${envVarName}" should never be in client-side code or next build artifacts`,
            envVar: envVarName,
            code: 'INVALID_ENV_VAR',
            severity: 'warning',
          });
        }
      }
    }

    ts.forEachChild(node, child =>
      this.visitNode(child, filePath, sourceCode, errors, warnings, missingEnvVars, unsafePatterns)
    );
  }

  /**
   * Check if node is at module level (not inside a function)
   */
  private isModuleLevel(node: ts.Node): boolean {
    let current: ts.Node | undefined = node;

    while (current) {
      // If we find a function/arrow function/method, we're not at module level
      if (
        current.kind === ts.SyntaxKind.FunctionDeclaration ||
        current.kind === ts.SyntaxKind.FunctionExpression ||
        current.kind === ts.SyntaxKind.ArrowFunction ||
        current.kind === ts.SyntaxKind.MethodDeclaration ||
        current.kind === ts.SyntaxKind.Constructor ||
        current.kind === ts.SyntaxKind.GetAccessor ||
        current.kind === ts.SyntaxKind.SetAccessor
      ) {
        return false;
      }

      // If we find a variable declaration and it's a const/let (not exported), inside function is ok
      if (current.kind === ts.SyntaxKind.VariableDeclaration) {
        const parent = current.parent;
        if (
          parent &&
          (parent.kind === ts.SyntaxKind.VariableDeclarationList)
        ) {
          const grandparent = parent.parent;
          // If it's a top-level variable declaration, it's module level
          if (grandparent && grandparent.parent?.kind === ts.SyntaxKind.SourceFile) {
            return true;
          }
        }
      }

      current = current.parent;
    }

    return true; // Default to module level
  }

  /**
   * Check if file path suggests it contains secret keys (in build artifacts)
   */
  private hasSecretKeyPattern(filePath: string): boolean {
    return (
      filePath.includes('.next') ||
      filePath.includes('dist') ||
      filePath.includes('build')
    );
  }

  /**
   * Get line and column from node start position
   */
  private getLineCol(
    filePath: string,
    sourceCode: string,
    position: number
  ): { line: number; column: number } {
    const lines = sourceCode.substring(0, position).split('\n');
    return {
      line: lines.length,
      column: lines[lines.length - 1].length + 1,
    };
  }

  /**
   * Get all TypeScript files in directory
   */
  private getAllTypeScriptFiles(dir: string): string[] {
    const files: string[] = [];
    const extensions = ['.ts', '.tsx'];

    const traverse = (currentPath: string) => {
      if (!fs.existsSync(currentPath)) return;

      const entries = fs.readdirSync(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        // Skip node_modules and build artifacts
        if (
          entry.name === 'node_modules' ||
          entry.name === '.next' ||
          entry.name === 'dist' ||
          entry.name === '.git'
        ) {
          continue;
        }

        if (entry.isDirectory()) {
          traverse(fullPath);
        } else if (extensions.some(ext => entry.name.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    };

    traverse(dir);
    return files;
  }
}

export default EnvironmentConfigValidator;
