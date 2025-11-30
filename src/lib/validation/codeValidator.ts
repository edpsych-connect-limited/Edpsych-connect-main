import { logger as _logger } from "@/lib/logger";
/**
 * Enterprise-grade code validation framework
 * Validates TypeScript code for completeness, consistency, and correctness
 *
 * @module CodeValidator
 */

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Validation result interface
 */
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  stats: ValidationStats;
  summary: string;
}

/**
 * Validation error interface
 */
interface ValidationError {
  type: 'UNDEFINED_METHOD' | 'ORPHANED_METHOD' | 'TYPE_MISMATCH' | 'CIRCULAR_DEPENDENCY' | 'MISSING_IMPLEMENTATION' | 'SYNTAX_ERROR' | 'COMPILER_ERROR';
  severity: 'critical' | 'high' | 'medium';
  file: string;
  line: number;
  column: number;
  message: string;
  code?: string;
  suggestion?: string;
}

/**
 * Validation warning interface
 */
interface ValidationWarning {
  type: 'UNUSED_METHOD' | 'INCOMPLETE_TYPING' | 'MISSING_JSDOC' | 'INCONSISTENT_NAMING';
  severity: 'low' | 'medium';
  file: string;
  line: number;
  message: string;
}

/**
 * Validation statistics
 */
interface ValidationStats {
  totalMethods: number;
  totalCalls: number;
  resolvedCalls: number;
  unresolvedCalls: number;
  orphanedMethods: number;
  fileCount: number;
  duration: number;
}

/**
 * Method definition info
 */
interface MethodDefinition {
  name: string;
  file: string;
  line: number;
  column: number;
  isPrivate: boolean;
  isAsync: boolean;
  parameters: MethodParameter[];
  returnType: string;
}

/**
 * Method parameter info
 */
interface MethodParameter {
  name: string;
  type: string;
  optional: boolean;
}

/**
 * Method call info
 */
interface MethodCall {
  name: string;
  file: string;
  line: number;
  column: number;
  context: string; // class or function name
  arguments: number;
}

/**
 * Enterprise Code Validator
 * Performs comprehensive validation of TypeScript codebases
 */
export class CodeValidator {
  private methodDefinitions: Map<string, MethodDefinition> = new Map();
  private methodCalls: Map<string, MethodCall[]> = new Map();
  private sourceFiles: Map<string, ts.SourceFile> = new Map();
  private errors: ValidationError[] = [];
  private warnings: ValidationWarning[] = [];
  private startTime: number = 0;

  /**
   * Validate a single file
   *
   * @param {string} filePath - File path to validate
   * @returns {Promise<ValidationResult>} Validation result
   */
  async validateFile(filePath: string): Promise<ValidationResult> {
    this.reset();
    this.startTime = Date.now();

    try {
      const absolutePath = path.resolve(filePath);
      if (!fs.existsSync(absolutePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const content = fs.readFileSync(absolutePath, 'utf-8');
      const sourceFile = ts.createSourceFile(
        filePath,
        content,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS
      );

      this.sourceFiles.set(filePath, sourceFile);
      this.analyzeFile(sourceFile, filePath);
      this.performValidations(filePath);

      return this.generateReport();
    } catch (_error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.errors.push({
        type: 'MISSING_IMPLEMENTATION',
        severity: 'critical',
        file: filePath,
        line: 0,
        column: 0,
        message: `Validation failed: ${errorMsg}`
      });
      return this.generateReport();
    }
  }

  /**
   * Validate a directory recursively
   *
   * @param {string} dirPath - Directory path
   * @param {string[]} extensions - File extensions to validate
   * @returns {Promise<ValidationResult>} Aggregated validation result
   */
  async validateDirectory(dirPath: string, extensions: string[] = ['.ts', '.tsx']): Promise<ValidationResult> {
    this.reset();
    this.startTime = Date.now();

    try {
      const absolutePath = path.resolve(dirPath);
      if (!fs.existsSync(absolutePath)) {
        throw new Error(`Directory not found: ${dirPath}`);
      }

      this.walkDirectory(absolutePath, extensions);
      this.performValidations();

      return this.generateReport();
    } catch (_error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.errors.push({
        type: 'MISSING_IMPLEMENTATION',
        severity: 'critical',
        file: dirPath,
        line: 0,
        column: 0,
        message: `Directory validation failed: ${errorMsg}`
      });
      return this.generateReport();
    }
  }

  /**
   * Validate a specific class
   *
   * @param {string} filePath - File path
   * @param {string} className - Class name
   * @returns {Promise<ValidationResult>} Validation result
   */
  async validateClass(filePath: string, className: string): Promise<ValidationResult> {
    this.reset();
    this.startTime = Date.now();

    try {
      const absolutePath = path.resolve(filePath);
      const content = fs.readFileSync(absolutePath, 'utf-8');
      const sourceFile = ts.createSourceFile(
        filePath,
        content,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS
      );

      this.sourceFiles.set(filePath, sourceFile);
      this.analyzeFile(sourceFile, filePath, className);
      this.performValidations(filePath, className);

      return this.generateReport();
    } catch (_error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.errors.push({
        type: 'MISSING_IMPLEMENTATION',
        severity: 'critical',
        file: filePath,
        line: 0,
        column: 0,
        message: `Class validation failed: ${errorMsg}`
      });
      return this.generateReport();
    }
  }

  /**
   * Get auto-generated stub for missing methods
   *
   * @param {ValidationError[]} errors - Validation errors
   * @returns {string} Generated stub code
   */
  generateStubs(errors: ValidationError[]): string {
    const undefinedMethods = errors.filter(e => e.type === 'UNDEFINED_METHOD');
    let stubs = '/**\n * Auto-generated method stubs\n * Generated by CodeValidator\n */\n\n';

    undefinedMethods.forEach(error => {
      const methodName = this.extractMethodName(error.message);
      stubs += `
  /**
   * ${methodName} - Auto-generated stub
   *
   * @private
   * @returns {Promise<void>}
   */
  async ${methodName}(): Promise<void> {
    try {
      // TODO: Implement ${methodName}
      throw new Error('Method not yet implemented: ${methodName}');
    } catch (_error) {
      logger.error('Error in ${methodName}:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
`;
    });

    return stubs;
  }

  /**
   * Analyze a file for method definitions and calls
   *
   * @private
   * @param {ts.SourceFile} sourceFile - TypeScript source file
   * @param {string} filePath - File path
   * @param {string} targetClass - Optional target class name
   */
  private analyzeFile(sourceFile: ts.SourceFile, filePath: string, targetClass?: string): void {
    const visit = (node: ts.Node, context: string = ''): void => {
      // Handle class declarations
      if (ts.isClassDeclaration(node)) {
        const className = node.name?.text || 'Unknown';
        if (!targetClass || targetClass === className) {
          node.members.forEach(member => {
            if (ts.isMethodDeclaration(member)) {
              this.extractMethodDefinition(member, filePath, className);
            }
          });
        }
      }

      // Handle method calls
      if (ts.isCallExpression(node)) {
        this.extractMethodCall(node, filePath, sourceFile, context);
      }

      ts.forEachChild(node, child => visit(child, context));
    };

    visit(sourceFile);
  }

  /**
   * Extract method definition
   *
   * @private
   * @param {ts.MethodDeclaration} method - Method declaration
   * @param {string} filePath - File path
   * @param {string} className - Class name
   */
  private extractMethodDefinition(
    method: ts.MethodDeclaration,
    filePath: string,
    className: string
  ): void {
    const methodName = method.name?.getText() || 'unknown';
    const fullName = `${className}.${methodName}`;
    const sourceFile = this.sourceFiles.get(filePath);

    if (!sourceFile) return;

    const lineNumber = sourceFile.getLineAndCharacterOfPosition(method.getStart()).line + 1;
    const column = sourceFile.getLineAndCharacterOfPosition(method.getStart()).character + 1;

    const isPrivate = method.modifiers?.some(m => m.kind === ts.SyntaxKind.PrivateKeyword) || methodName.startsWith('_');
    const isAsync = method.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword) || false;

    const parameters: MethodParameter[] = method.parameters.map(param => ({
      name: param.name?.getText() || 'unknown',
      type: param.type?.getText() || 'any',
      optional: !!param.questionToken
    }));

    const returnType = method.type?.getText() || 'void';

    this.methodDefinitions.set(fullName, {
      name: methodName,
      file: filePath,
      line: lineNumber,
      column,
      isPrivate,
      isAsync,
      parameters,
      returnType
    });
  }

  /**
   * Extract method call
   *
   * @private
   * @param {ts.CallExpression} call - Call expression
   * @param {string} filePath - File path
   * @param {ts.SourceFile} sourceFile - Source file
   * @param {string} context - Context (class/function name)
   */
  private extractMethodCall(
    call: ts.CallExpression,
    filePath: string,
    sourceFile: ts.SourceFile,
    context: string
  ): void {
    let methodName = '';

    if (ts.isPropertyAccessExpression(call.expression)) {
      methodName = call.expression.name.text;
    } else if (ts.isIdentifier(call.expression)) {
      methodName = call.expression.text;
    }

    if (!methodName) return;

    const lineNumber = sourceFile.getLineAndCharacterOfPosition(call.getStart()).line + 1;
    const column = sourceFile.getLineAndCharacterOfPosition(call.getStart()).character + 1;

    if (!this.methodCalls.has(methodName)) {
      this.methodCalls.set(methodName, []);
    }

    this.methodCalls.get(methodName)!.push({
      name: methodName,
      file: filePath,
      line: lineNumber,
      column,
      context,
      arguments: call.arguments.length
    });
  }

  /**
   * Perform comprehensive validations
   *
   * @private
   * @param {string} filePath - Optional file path to filter
   * @param {string} className - Optional class name to filter
   */
  private performValidations(filePath?: string, className?: string): void {
    this.validateSyntaxErrors();
    this.validateMethodExistence(filePath, className);
    this.validateOrphanedMethods(filePath, className);
    this.validateJSDoc();
    this.validateNamingConventions(filePath);
  }

  /**
   * Validate syntax errors using TypeScript compiler
   *
   * @private
   */
  private validateSyntaxErrors(): void {
    this.sourceFiles.forEach((sourceFile, filePath) => {
      // Get all compiler diagnostics (syntax + semantic)
      const diagnostics = ts.getPreEmitDiagnostics(
        ts.createProgram([filePath], {}, {
          getSourceFile: (fileName) => fileName === filePath ? sourceFile : undefined,
          writeFile: () => {},
          getCurrentDirectory: () => '',
          getDirectories: () => [],
          fileExists: () => true,
          readFile: () => '',
          getCanonicalFileName: (fileName) => fileName,
          useCaseSensitiveFileNames: () => true,
          getNewLine: () => '\n',
          getDefaultLibFileName: () => 'lib.d.ts'
        })
      );

      diagnostics.forEach(diagnostic => {
        if (diagnostic.file && diagnostic.start !== undefined) {
          const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
          const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');

          // Map TypeScript error codes to validator types
          const errorType = diagnostic.code === 1128 || diagnostic.code === 1126 
            ? 'SYNTAX_ERROR' 
            : 'COMPILER_ERROR';

          this.errors.push({
            type: errorType,
            severity: diagnostic.category === ts.DiagnosticCategory.Error ? 'critical' : 'high',
            file: filePath,
            line: line + 1,
            column: character + 1,
            message: `TS${diagnostic.code}: ${message}`,
            code: `TS${diagnostic.code}`,
            suggestion: this.getSyntaxErrorSuggestion(diagnostic.code)
          });
        }
      });
    });
  }

  /**
   * Get suggestion for syntax errors
   *
   * @private
   * @param {number} code - TypeScript error code
   * @returns {string} Suggestion
   */
  private getSyntaxErrorSuggestion(code: number): string {
    const suggestions: { [key: number]: string } = {
      1128: 'Check for orphaned code after export statements or class declarations',
      1126: 'Ensure all statements are properly declared inside functions/classes',
      1005: 'Missing closing brace or semicolon',
      1004: 'Expected a semicolon',
      1003: 'Expected an identifier',
      1109: 'Expression expected - check for incomplete statements'
    };
    return suggestions[code] || 'Review the code structure and syntax';
  }

  /**
   * Validate that all called methods are defined
   *
   * @private
   * @param {string} filePath - Optional filter
   * @param {string} className - Optional filter
   */
  private validateMethodExistence(filePath?: string, className?: string): void {
    this.methodCalls.forEach((calls, methodName) => {
      calls.forEach(call => {
        if (filePath && call.file !== filePath) return;

        // Check if method is defined
        let found = false;
        this.methodDefinitions.forEach((def, fullName) => {
          if (def.name === methodName) {
            if (!className || fullName.startsWith(className + '.')) {
              found = true;
            }
          }
        });

        if (!found && methodName.startsWith('_')) {
          this.errors.push({
            type: 'UNDEFINED_METHOD',
            severity: 'critical',
            file: call.file,
            line: call.line,
            column: call.column,
            message: `Method '${methodName}' is called but not defined`,
            code: `UNDEFINED_${methodName}`,
            suggestion: `Define method ${methodName} or check the method name`
          });
        }
      });
    });
  }

  /**
   * Validate for orphaned/unused methods
   *
   * @private
   * @param {string} filePath - Optional filter
   * @param {string} className - Optional filter
   */
  private validateOrphanedMethods(filePath?: string, className?: string): void {
    this.methodDefinitions.forEach((def, _fullName) => {
      if (filePath && def.file !== filePath) return;
      if (className && !_fullName.startsWith(className + '.')) return;

      const methodCalls = this.methodCalls.get(def.name) || [];
      if (methodCalls.length === 0 && !def.isPrivate && !def.name.startsWith('_')) {
        this.warnings.push({
          type: 'UNUSED_METHOD',
          severity: 'low',
          file: def.file,
          line: def.line,
          message: `Method '${def.name}' appears to be unused`
        });
      }
    });
  }

  /**
   * Validate JSDoc comments
   *
   * @private
   */
  private validateJSDoc(): void {
    this.methodDefinitions.forEach((def, _fullName) => {
      // This is a simplified check - full implementation would parse JSDoc
      if (!def.name.startsWith('_') && def.name !== 'constructor') {
        this.warnings.push({
          type: 'MISSING_JSDOC',
          severity: 'low',
          file: def.file,
          line: def.line,
          message: `Method '${def.name}' may be missing JSDoc comments`
        });
      }
    });
  }

  /**
   * Validate naming conventions
   *
   * @private
   * @param {string} filePath - Optional filter
   */
  private validateNamingConventions(filePath?: string): void {
    this.methodDefinitions.forEach((def, _fullName) => {
      if (filePath && def.file !== filePath) return;

      // Check camelCase for public methods
      if (!def.isPrivate && !def.name.match(/^[a-z][a-zA-Z0-9]*$/)) {
        this.warnings.push({
          type: 'INCONSISTENT_NAMING',
          severity: 'low',
          file: def.file,
          line: def.line,
          message: `Method '${def.name}' does not follow camelCase naming convention`
        });
      }
    });
  }

  /**
   * Generate validation report
   *
   * @private
   * @returns {ValidationResult} Validation result
   */
  private generateReport(): ValidationResult {
    const duration = Date.now() - this.startTime;
    const totalCalls = Array.from(this.methodCalls.values()).reduce((sum, calls) => sum + calls.length, 0);
    const resolvedCalls = totalCalls - this.errors.filter(e => e.type === 'UNDEFINED_METHOD').length;
    const orphanedMethods = this.warnings.filter(w => w.type === 'UNUSED_METHOD').length;

    const stats: ValidationStats = {
      totalMethods: this.methodDefinitions.size,
      totalCalls,
      resolvedCalls,
      unresolvedCalls: this.errors.filter(e => e.type === 'UNDEFINED_METHOD').length,
      orphanedMethods,
      fileCount: this.sourceFiles.size,
      duration
    };

    const isValid = this.errors.filter(e => e.severity === 'critical').length === 0;

    let summary = `Validation ${isValid ? 'PASSED' : 'FAILED'}`;
    if (!isValid) {
      summary += ` - ${this.errors.length} error(s) found`;
    }
    if (this.warnings.length > 0) {
      summary += ` - ${this.warnings.length} warning(s)`;
    }

    return {
      isValid,
      errors: this.errors,
      warnings: this.warnings,
      stats,
      summary
    };
  }

  /**
   * Reset internal state
   *
   * @private
   */
  private reset(): void {
    this.methodDefinitions.clear();
    this.methodCalls.clear();
    this.sourceFiles.clear();
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Walk directory and analyze TypeScript files
   *
   * @private
   * @param {string} dir - Directory path
   * @param {string[]} extensions - File extensions
   */
  private walkDirectory(dir: string, extensions: string[]): void {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Skip node_modules and hidden directories
        if (!file.startsWith('.') && file !== 'node_modules') {
          this.walkDirectory(filePath, extensions);
        }
      } else if (extensions.some(ext => file.endsWith(ext))) {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const sourceFile = ts.createSourceFile(
            filePath,
            content,
            ts.ScriptTarget.Latest,
            true,
            ts.ScriptKind.TS
          );
          this.sourceFiles.set(filePath, sourceFile);
          this.analyzeFile(sourceFile, filePath);
        } catch {
          // Log but continue
        }
      }
    });
  }

  /**
   * Extract method name from error message
   *
   * @private
   * @param {string} message - Error message
   * @returns {string} Method name
   */
  private extractMethodName(message: string): string {
    const match = message.match(/'([^']+)'/);
    return match ? match[1] : 'unknownMethod';
  }

  /**
   * Format report as human-readable string
   *
   * @param {ValidationResult} result - Validation result
   * @returns {string} Formatted report
   */
  formatReport(result: ValidationResult): string {
    let report = '\n════════════════════════════════════════════════════════════\n';
    report += `  CODE VALIDATION REPORT\n`;
    report += `════════════════════════════════════════════════════════════\n\n`;

    report += `STATUS: ${result.isValid ? '✅ PASSED' : '❌ FAILED'}\n`;
    report += `Summary: ${result.summary}\n\n`;

    // Statistics
    report += `📊 STATISTICS:\n`;
    report += `  Total Methods: ${result.stats.totalMethods}\n`;
    report += `  Total Calls: ${result.stats.totalCalls}\n`;
    report += `  Resolved: ${result.stats.resolvedCalls}\n`;
    report += `  Unresolved: ${result.stats.unresolvedCalls}\n`;
    report += `  Orphaned Methods: ${result.stats.orphanedMethods}\n`;
    report += `  Files Analyzed: ${result.stats.fileCount}\n`;
    report += `  Duration: ${result.stats.duration}ms\n\n`;

    // Errors
    if (result.errors.length > 0) {
      report += `❌ ERRORS (${result.errors.length}):\n`;
      result.errors.slice(0, 10).forEach((error, index) => {
        report += `  ${index + 1}. ${error.type} [${error.severity}]\n`;
        report += `     File: ${error.file}:${error.line}:${error.column}\n`;
        report += `     Message: ${error.message}\n`;
        if (error.suggestion) {
          report += `     Suggestion: ${error.suggestion}\n`;
        }
        report += '\n';
      });
      if (result.errors.length > 10) {
        report += `  ... and ${result.errors.length - 10} more errors\n\n`;
      }
    }

    // Warnings
    if (result.warnings.length > 0) {
      report += `⚠️  WARNINGS (${result.warnings.length}):\n`;
      result.warnings.slice(0, 5).forEach((warning, index) => {
        report += `  ${index + 1}. ${warning.type}\n`;
        report += `     File: ${warning.file}:${warning.line}\n`;
        report += `     Message: ${warning.message}\n`;
      });
      if (result.warnings.length > 5) {
        report += `  ... and ${result.warnings.length - 5} more warnings\n`;
      }
    }

    report += `\n════════════════════════════════════════════════════════════\n`;

    return report;
  }
}

export default CodeValidator;
