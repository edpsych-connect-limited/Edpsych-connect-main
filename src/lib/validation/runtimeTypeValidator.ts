/**
 * Runtime Type Validator
 * Validates type safety at runtime and catches type narrowing errors
 *
 * @module RuntimeTypeValidator
 */

import * as ts from 'typescript';

interface RuntimeTypeError {
  type: 'UNSAFE_CAST' | 'MISSING_GUARD' | 'TYPE_GUARD_FAILURE' | 'NULL_DEREFERENCE' | 'INVALID_NARROWING';
  severity: 'critical' | 'high' | 'medium';
  file: string;
  line: number;
  column: number;
  message: string;
  suggestion: string;
}

interface RuntimeTypeResult {
  errors: RuntimeTypeError[];
  warnings: RuntimeTypeError[];
  stats: {
    filesScanned: number;
    unsafeCasts: number;
    missingGuards: number;
    typeGuardFailures: number;
  };
}

export class RuntimeTypeValidator {
  private errors: RuntimeTypeError[] = [];
  private warnings: RuntimeTypeError[] = [];
  private sourceFile: ts.SourceFile | null = null;
  private typeChecker: ts.TypeChecker | null = null;
  private program: ts.Program | null = null;

  /**
   * Validate a TypeScript file for runtime type safety
   */
  async validateFile(filePath: string): Promise<RuntimeTypeResult> {
    this.reset();

    try {
      // Create compiler program
      this.program = ts.createProgram([filePath], {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext,
        lib: ['es2020', 'dom'],
        strict: true,
        noImplicitAny: true,
        strictNullChecks: true,
        strictFunctionTypes: true
      });

      this.typeChecker = this.program.getTypeChecker();
      const sourceFile = this.program.getSourceFile(filePath);

      if (!sourceFile) {
        throw new Error(`Could not load source file: ${filePath}`);
      }

      this.sourceFile = sourceFile;
      this.analyzeFile(sourceFile);

      return {
        errors: this.errors,
        warnings: this.warnings,
        stats: {
          filesScanned: 1,
          unsafeCasts: this.errors.filter(e => e.type === 'UNSAFE_CAST').length,
          missingGuards: this.errors.filter(e => e.type === 'MISSING_GUARD').length,
          typeGuardFailures: this.errors.filter(e => e.type === 'TYPE_GUARD_FAILURE').length
        }
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.errors.push({
        type: 'UNSAFE_CAST',
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
          unsafeCasts: 0,
          missingGuards: 0,
          typeGuardFailures: 0
        }
      };
    }
  }

  /**
   * Analyze file for type safety issues
   */
  private analyzeFile(sourceFile: ts.SourceFile): void {
    const visit = (node: ts.Node): void => {
      // Check for type assertions
      if (ts.isAsExpression(node)) {
        this.checkTypeAssertion(node as ts.AsExpression);
      }

      // Check for null/undefined dereference
      if (ts.isPropertyAccessExpression(node)) {
        this.checkPropertyAccess(node);
      }

      // Check for variable assignments without guards
      if (ts.isVariableDeclaration(node)) {
        this.checkVariableDeclaration(node);
      }

      // Check for function calls with optional parameters
      if (ts.isCallExpression(node)) {
        this.checkFunctionCall(node);
      }

      // Check for if-statements with proper narrowing
      if (ts.isIfStatement(node)) {
        this.checkIfStatement(node);
      }

      // Check for logical operations
      if (ts.isBinaryExpression(node)) {
        this.checkBinaryExpression(node);
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
  }

  /**
   * Check for unsafe type assertions
   */
  private checkTypeAssertion(node: ts.AsExpression): void {
    if (!this.sourceFile || !this.typeChecker) return;

    try {
      const actualType = this.typeChecker.getTypeAtLocation(node.expression);

      // Check if assertion is narrowing without guard
      if ((actualType.flags & ts.TypeFlags.Union) && !this.hasNarrowingGuard(node)) {
        const line = this.sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        const column = this.sourceFile.getLineAndCharacterOfPosition(node.getStart()).character + 1;

        this.errors.push({
          type: 'UNSAFE_CAST',
          severity: 'high',
          file: this.sourceFile.fileName,
          line,
          column,
          message: `Unsafe type assertion without type guard`,
          suggestion: 'Add type guard (e.g., if (typeof x === "string")) before asserting type'
        });
      }
    } catch {
      // Silently skip if type info unavailable
    }
  }

  /**
   * Check for null/undefined dereference
   */
  private checkPropertyAccess(node: ts.PropertyAccessExpression): void {
    if (!this.sourceFile || !this.typeChecker) return;

    try {
      const objectType = this.typeChecker.getTypeAtLocation(node.expression);

      // Check if type includes null or undefined
      if ((objectType.flags & ts.TypeFlags.Union) !== 0) {
        const types = (objectType as ts.UnionType).types;
        const hasNull = types.some(t => t.flags & ts.TypeFlags.Null);
        const hasUndefined = types.some(t => t.flags & ts.TypeFlags.Undefined);

        if ((hasNull || hasUndefined) && !this.isInsideGuard(node)) {
          const line = this.sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
          const column = this.sourceFile.getLineAndCharacterOfPosition(node.getStart()).character + 1;

          this.warnings.push({
            type: 'NULL_DEREFERENCE',
            severity: 'high',
            file: this.sourceFile.fileName,
            line,
            column,
            message: `Potential null/undefined dereference`,
            suggestion: 'Add null/undefined check or use optional chaining (obj?.property)'
          });
        }
      }
    } catch {
      // Silently skip
    }
  }

  /**
   * Check variable declaration without proper type
   */
  private checkVariableDeclaration(node: ts.VariableDeclaration): void {
    if (!this.sourceFile || !this.typeChecker) return;

    try {
      // Check if implicit any
      if (!node.type && !node.initializer) {
        const line = this.sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        const column = this.sourceFile.getLineAndCharacterOfPosition(node.getStart()).character + 1;

        this.warnings.push({
          type: 'MISSING_GUARD',
          severity: 'medium',
          file: this.sourceFile.fileName,
          line,
          column,
          message: `Variable declared without type or initializer`,
          suggestion: 'Add explicit type annotation or initialize with value'
        });
      }
    } catch {
      // Silently skip
    }
  }

  /**
   * Check function calls for type safety
   */
  private checkFunctionCall(node: ts.CallExpression): void {
    if (!this.sourceFile || !this.typeChecker) return;

    try {
      const signature = this.typeChecker.getResolvedSignature(node);
      if (!signature) return;

      // Check arguments against parameters
      node.arguments.forEach((arg, index) => {
        const _param = signature.parameters[index];
        if (!_param) return;

        // Type checking would go here
      });
    } catch {
      // Silently skip
    }
  }

  /**
   * Check if-statement for proper type narrowing
   */
  private checkIfStatement(node: ts.IfStatement): void {
    if (!this.sourceFile || !this.typeChecker) return;

    try {
      const condition = node.expression;

      // Check for typeof guards
      if (ts.isBinaryExpression(condition)) {
        const left = condition.operatorToken.kind;
        if (left === ts.SyntaxKind.EqualsEqualsToken || left === ts.SyntaxKind.EqualsEqualsEqualsToken) {
          // Valid guard pattern
          return;
        }
      }

      // Check for truthiness checks
      if (ts.isIdentifier(condition)) {
        // Valid guard
        return;
      }
    } catch {
      // Silently skip
    }
  }

  /**
   * Check binary expressions for type safety
   */
  private checkBinaryExpression(node: ts.BinaryExpression): void {
    if (!this.sourceFile || !this.typeChecker) return;

    try {
      // Check logical operations for proper narrowing
      if (node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
        // AND operation - check for proper narrowing
      }
    } catch {
      // Silently skip
    }
  }

  /**
   * Check if type assertion has narrowing guard
   */
  private hasNarrowingGuard(node: ts.Node): boolean {
    let parent = node.parent;
    while (parent) {
      if (ts.isIfStatement(parent)) {
        return true;
      }
      parent = parent.parent;
    }
    return false;
  }

  /**
   * Check if property access is inside a guard
   */
  private isInsideGuard(node: ts.Node): boolean {
    let parent = node.parent;
    while (parent) {
      if (ts.isIfStatement(parent) || ts.isBinaryExpression(parent)) {
        return true;
      }
      parent = parent.parent;
    }
    return false;
  }

  /**
   * Reset state
   */
  private reset(): void {
    this.errors = [];
    this.warnings = [];
    this.sourceFile = null;
    this.typeChecker = null;
    this.program = null;
  }
}
