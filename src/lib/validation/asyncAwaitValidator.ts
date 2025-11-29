import { logger } from "@/lib/logger";
/**
 * Async/Await Validator
 * Detects Promise handling errors and async/await misuse
 *
 * @module AsyncAwaitValidator
 */

import * as ts from 'typescript';
import * as fs from 'fs';

interface AsyncIssue {
  type: 'MISSING_AWAIT' | 'UNHANDLED_REJECTION' | 'RACE_CONDITION' | 'WRONG_PROMISE_METHOD';
  severity: 'critical' | 'high' | 'medium';
  file: string;
  line: number;
  column: number;
  message: string;
  suggestion: string;
}

interface AsyncValidationResult {
  errors: AsyncIssue[];
  warnings: AsyncIssue[];
  stats: {
    filesScanned: number;
    missingAwaits: number;
    unhandledRejections: number;
    raceConditions: number;
  };
}

export class AsyncAwaitValidator {
  private errors: AsyncIssue[] = [];
  private warnings: AsyncIssue[] = [];
  private sourceFile: ts.SourceFile | null = null;
  private typeChecker: ts.TypeChecker | null = null;

  /**
   * Validate a file for async/await issues
   */
  async validateFile(filePath: string): Promise<AsyncValidationResult> {
    this.reset();

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      this.sourceFile = ts.createSourceFile(
        filePath,
        content,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS
      );

      // Create basic program for type checking
      const program = ts.createProgram([filePath], {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext
      });

      this.typeChecker = program.getTypeChecker();

      this.analyzeFile(this.sourceFile);

      return {
        errors: this.errors,
        warnings: this.warnings,
        stats: {
          filesScanned: 1,
          missingAwaits: this.errors.filter(e => e.type === 'MISSING_AWAIT').length,
          unhandledRejections: this.errors.filter(e => e.type === 'UNHANDLED_REJECTION').length,
          raceConditions: this.errors.filter(e => e.type === 'RACE_CONDITION').length
        }
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.errors.push({
        type: 'MISSING_AWAIT',
        severity: 'critical',
        file: filePath,
        line: 0,
        column: 0,
        message: `Validation error: ${msg}`,
        suggestion: 'Check file format and ensure it is valid TypeScript'
      });

      return {
        errors: this.errors,
        warnings: this.warnings,
        stats: {
          filesScanned: 1,
          missingAwaits: 0,
          unhandledRejections: 0,
          raceConditions: 0
        }
      };
    }
  }

  /**
   * Analyze file for async issues
   */
  private analyzeFile(sourceFile: ts.SourceFile): void {
    const visit = (node: ts.Node): void => {
      // Check function declarations
      if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isMethodDeclaration(node)) {
        this.checkAsyncFunction(node);
      }

      // Check call expressions
      if (ts.isCallExpression(node)) {
        this.checkCallExpression(node);
      }

      // Check variable declarations with async results
      if (ts.isVariableDeclaration(node)) {
        this.checkVariableDeclaration(node);
      }

      // Check return statements
      if (ts.isReturnStatement(node)) {
        this.checkReturnStatement(node);
      }

      // Check Promise.all/race usage
      if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
        this.checkPromiseMethod(node);
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
  }

  /**
   * Check if async function is properly awaited
   */
  private checkAsyncFunction(node: ts.Node): void {
    if (!this.sourceFile) return;

    // Check for async but no await usage
    const isAsync = (node as any).modifiers?.some(
      (mod: ts.Modifier) => mod.kind === ts.SyntaxKind.AsyncKeyword
    );

    if (isAsync) {
      let hasAwait = false;
      const checkForAwait = (n: ts.Node): void => {
        if (ts.isAwaitExpression(n)) {
          hasAwait = true;
        }
        if (!hasAwait) {
          ts.forEachChild(n, checkForAwait);
        }
      };

      checkForAwait(node);

      if (!hasAwait && (node as any).body) {
        const line = this.sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        const column = this.sourceFile.getLineAndCharacterOfPosition(node.getStart()).character + 1;

        this.warnings.push({
          type: 'MISSING_AWAIT',
          severity: 'medium',
          file: this.sourceFile.fileName,
          line,
          column,
          message: `Async function declared but no await expressions found`,
          suggestion: 'Remove async keyword or add await to async operations'
        });
      }
    }
  }

  /**
   * Check call expressions for missing await
   */
  private checkCallExpression(node: ts.CallExpression): void {
    if (!this.sourceFile) return;

    try {
      // Check if calling an async function without await
      if (this.isAsyncFunctionCall(node)) {
        // Check if result is being used properly
        const parent = node.parent;

        // Standalone expression - probably missing await
        if (ts.isExpressionStatement(parent)) {
          const line = this.sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
          const column = this.sourceFile.getLineAndCharacterOfPosition(node.getStart()).character + 1;

          this.errors.push({
            type: 'MISSING_AWAIT',
            severity: 'high',
            file: this.sourceFile.fileName,
            line,
            column,
            message: `Async function called without await in expression statement`,
            suggestion: 'Add await or .then() / .catch() for proper promise handling'
          });
        }

        // Assignment without await - may be intentional but risky
        if (ts.isVariableDeclaration(parent) && !ts.isAwaitExpression(parent.initializer!)) {
          const line = this.sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
          const column = this.sourceFile.getLineAndCharacterOfPosition(node.getStart()).character + 1;

          this.warnings.push({
            type: 'MISSING_AWAIT',
            severity: 'medium',
            file: this.sourceFile.fileName,
            line,
            column,
            message: `Async function result assigned without await - variable will be a Promise`,
            suggestion: 'Add await if you need the resolved value, or use .then() explicitly'
          });
        }
      }
    } catch {
      // Silently skip type checking errors
    }
  }

  /**
   * Check variable declaration for promise without await
   */
  private checkVariableDeclaration(node: ts.VariableDeclaration): void {
    if (!this.sourceFile || !node.initializer) return;

    try {
      // Check if initializer is an async function call
      if (ts.isCallExpression(node.initializer)) {
        if (this.isAsyncFunctionCall(node.initializer)) {
          const line = this.sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
          const column = this.sourceFile.getLineAndCharacterOfPosition(node.getStart()).character + 1;

          this.warnings.push({
            type: 'UNHANDLED_REJECTION',
            severity: 'medium',
            file: this.sourceFile.fileName,
            line,
            column,
            message: `Promise assigned to variable without error handling`,
            suggestion: 'Add .catch() handler or use try/catch with await'
          });
        }
      }
    } catch {
      // Silently skip
    }
  }

  /**
   * Check return statement for proper async handling
   */
  private checkReturnStatement(node: ts.ReturnStatement): void {
    if (!this.sourceFile || !node.expression) return;

    // Check if returning promise from non-async function
    const parent = this.getParentFunction(node);
    if (parent) {
      const isAsync = (parent as any).modifiers?.some(
        (mod: ts.Modifier) => mod.kind === ts.SyntaxKind.AsyncKeyword
      );

      if (!isAsync && ts.isCallExpression(node.expression)) {
        if (this.isAsyncFunctionCall(node.expression)) {
          const line = this.sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
          const column = this.sourceFile.getLineAndCharacterOfPosition(node.getStart()).character + 1;

          this.warnings.push({
            type: 'UNHANDLED_REJECTION',
            severity: 'high',
            file: this.sourceFile.fileName,
            line,
            column,
            message: `Returning Promise from non-async function`,
            suggestion: 'Make parent function async or use .then() to handle promise'
          });
        }
      }
    }
  }

  /**
   * Check Promise.all/Promise.race usage
   */
  private checkPromiseMethod(node: ts.CallExpression): void {
    if (!this.sourceFile) return;

    try {
      const expr = node.expression as ts.PropertyAccessExpression;
      const methodName = expr.name.getText();

      if (methodName === 'all' || methodName === 'race') {
        const parent = node.parent;

        // Check if awaited
        if (!ts.isAwaitExpression(parent)) {
          const line = this.sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
          const column = this.sourceFile.getLineAndCharacterOfPosition(node.getStart()).character + 1;

          this.warnings.push({
            type: 'MISSING_AWAIT',
            severity: 'high',
            file: this.sourceFile.fileName,
            line,
            column,
            message: `Promise.${methodName}() called without await`,
            suggestion: `Add await before Promise.${methodName}()`
          });
        }

        // Check for race condition patterns (Promise.race with same source)
        if (methodName === 'race') {
          const args = node.arguments;
          if (args.length > 0 && ts.isArrayLiteralExpression(args[0])) {
            const elements = (args[0] as ts.ArrayLiteralExpression).elements;
            const texts = new Set<string>();

            elements.forEach(el => {
              const text = el.getText();
              if (texts.has(text)) {
                const line = this.sourceFile!.getLineAndCharacterOfPosition(node.getStart()).line + 1;
                const column = this.sourceFile!.getLineAndCharacterOfPosition(node.getStart()).character + 1;

                this.errors.push({
                  type: 'RACE_CONDITION',
                  severity: 'high',
                  file: this.sourceFile!.fileName,
                  line,
                  column,
                  message: `Promise.race() with duplicate elements - likely unintended race condition`,
                  suggestion: 'Check Promise.race() arguments, ensure each is unique'
                });
              }
              texts.add(text);
            });
          }
        }
      }
    } catch {
      // Silently skip
    }
  }

  /**
   * Check if a call expression is to an async function
   */
  private isAsyncFunctionCall(node: ts.CallExpression): boolean {
    try {
      const text = node.expression.getText();
      // Simple heuristic: looks for known async patterns
      return text.includes('async') || 
             text.includes('fetch') ||
             text.includes('Promise') ||
             !!(text.match(/^[a-zA-Z_]\w*Async\w*$/));
    } catch {
      return false;
    }
  }

  /**
   * Get parent function node
   */
  private getParentFunction(node: ts.Node): ts.Node | null {
    let parent = node.parent;
    while (parent) {
      if (ts.isFunctionDeclaration(parent) || 
          ts.isArrowFunction(parent) || 
          ts.isMethodDeclaration(parent)) {
        return parent;
      }
      parent = parent.parent;
    }
    return null;
  }

  /**
   * Reset state
   */
  private reset(): void {
    this.errors = [];
    this.warnings = [];
    this.sourceFile = null;
    this.typeChecker = null;
  }
}
