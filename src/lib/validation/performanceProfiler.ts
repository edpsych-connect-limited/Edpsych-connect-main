/**
 * Performance Profiler
 * Analyzes code performance and detects bottlenecks
 *
 * @module PerformanceProfiler
 */

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Performance issue interface
 */
interface PerformanceIssue {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  file: string;
  line: number;
  message: string;
  impact: string;
  recommendation: string;
}

/**
 * Performance profile interface
 */
interface PerformanceProfile {
  file: string;
  metrics: {
    functionCount: number;
    complexFunctions: number;
    deepNesting: number;
    largeFiles: number;
    cyclomaticComplexity: number;
  };
}

/**
 * Performance scan result
 */
interface PerformanceScanResult {
  passed: boolean;
  issues: PerformanceIssue[];
  profiles: PerformanceProfile[];
  stats: {
    totalIssues: number;
    criticalCount: number;
    averageComplexity: number;
    filesScanned: number;
    slowFunctions: number;
    duration: number;
  };
  summary: string;
}

/**
 * Enterprise Performance Profiler
 */
export class PerformanceProfiler {
  private issues: PerformanceIssue[] = [];
  private profiles: PerformanceProfile[] = [];
  private filesScanned: number = 0;
  private startTime: number = 0;

  /**
   * Scan a file for performance issues
   *
   * @param {string} filePath - File path
   * @returns {Promise<PerformanceScanResult>} Scan result
   */
  async scanFile(filePath: string): Promise<PerformanceScanResult> {
    this.reset();
    this.startTime = Date.now();

    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const sourceFile = ts.createSourceFile(
        filePath,
        content,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS
      );

      this.analyzeFile(sourceFile, filePath, content);
      this.filesScanned++;

      return this.generateReport();
    } catch (_error) {
      const msg = _error instanceof Error ? _error.message : String(_error);
      this.issues.push({
        type: 'SCAN_ERROR',
        severity: 'high',
        file: filePath,
        line: 0,
        message: `Scan error: ${msg}`,
        impact: 'Unable to analyze file',
        recommendation: 'Check file accessibility and format'
      });
      return this.generateReport();
    }
  }

  /**
   * Scan a directory recursively
   *
   * @param {string} dirPath - Directory path
   * @returns {Promise<PerformanceScanResult>} Scan result
   */
  async scanDirectory(dirPath: string): Promise<PerformanceScanResult> {
    this.reset();
    this.startTime = Date.now();

    try {
      if (!fs.existsSync(dirPath)) {
        throw new Error(`Directory not found: ${dirPath}`);
      }

      this.walkDirectory(dirPath);
      return this.generateReport();
    } catch (_error) {
      const msg = _error instanceof Error ? _error.message : String(_error);
      this.issues.push({
        type: 'SCAN_ERROR',
        severity: 'high',
        file: dirPath,
        line: 0,
        message: `Directory scan error: ${msg}`,
        impact: 'Unable to scan directory',
        recommendation: 'Check directory path and permissions'
      });
      return this.generateReport();
    }
  }

  /**
   * Analyze file using TypeScript AST
   *
   * @private
   * @param {ts.SourceFile} sourceFile - Source file
   * @param {string} filePath - File path
   * @param {string} content - File content
   */
  private analyzeFile(sourceFile: ts.SourceFile, filePath: string, content: string): void {
    const _lines = content.split('\n');
    const fileSize = content.length;
    let functionCount = 0;
    let complexFunctions = 0;
    let deepNesting = 0;

    // Check file size
    if (fileSize > 5000) {
      this.issues.push({
        type: 'LARGE_FILE',
        severity: 'medium',
        file: filePath,
        line: 0,
        message: `File is ${(fileSize / 1024).toFixed(1)}KB (>5KB)`,
        impact: 'Large files are harder to maintain and slower to parse',
        recommendation: 'Consider splitting into smaller modules'
      });
    }

    // Analyze functions
    const visit = (node: ts.Node, depth: number = 0): void => {
      if (
        ts.isFunctionDeclaration(node) ||
        ts.isMethodDeclaration(node) ||
        ts.isArrowFunction(node)
      ) {
        functionCount++;

        // Calculate complexity (simplified)
        const complexity = this.calculateComplexity(node);
        if (complexity > 10) {
          complexFunctions++;

          const lineNum = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
          this.issues.push({
            type: 'HIGH_COMPLEXITY',
            severity: 'medium',
            file: filePath,
            line: lineNum,
            message: `Function has cyclomatic complexity of ${complexity}`,
            impact: 'High complexity makes code harder to test and maintain',
            recommendation: 'Refactor into smaller functions'
          });
        }
      }

      // Check nesting depth
      if (depth > 4) {
        deepNesting++;
        if (depth > 6) {
          const lineNum = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
          this.issues.push({
            type: 'DEEP_NESTING',
            severity: 'low',
            file: filePath,
            line: lineNum,
            message: `Code nesting depth is ${depth} levels (>6)`,
            impact: 'Deep nesting reduces readability',
            recommendation: 'Extract nested logic into separate functions'
          });
        }
      }

      // Check for performance anti-patterns
      if (ts.isCallExpression(node)) {
        const expression = node.expression;
        if (ts.isIdentifier(expression)) {
          const name = expression.getText();
          if (name === 'JSON.parse' || name === 'JSON.stringify') {
            const lineNum = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
            this.issues.push({
              type: 'JSON_OPERATION',
              severity: 'low',
              file: filePath,
              line: lineNum,
              message: `${name} called in loop-like context`,
              impact: 'JSON operations can be slow in tight loops',
              recommendation: 'Consider caching parsed results or using streaming'
            });
          }
        }
      }

      ts.forEachChild(node, child => visit(child, depth + 1));
    };

    visit(sourceFile);

    this.profiles.push({
      file: filePath,
      metrics: {
        functionCount,
        complexFunctions,
        deepNesting,
        largeFiles: fileSize > 5000 ? 1 : 0,
        cyclomaticComplexity: functionCount > 0 ? complexFunctions / functionCount : 0
      }
    });
  }

  /**
   * Calculate cyclomatic complexity (simplified)
   *
   * @private
   * @param {ts.Node} node - AST node
   * @returns {number} Complexity score
   */
  private calculateComplexity(node: ts.Node): number {
    let complexity = 1;
    const countNodes = (n: ts.Node): void => {
      switch (n.kind) {
        case ts.SyntaxKind.IfStatement:
        case ts.SyntaxKind.CaseClause:
        case ts.SyntaxKind.CatchClause:
        case ts.SyntaxKind.BinaryExpression:
          complexity++;
          break;
        case ts.SyntaxKind.ForStatement:
        case ts.SyntaxKind.ForInStatement:
        case ts.SyntaxKind.ForOfStatement:
        case ts.SyntaxKind.WhileStatement:
        case ts.SyntaxKind.DoStatement:
          complexity += 2;
          break;
      }
      ts.forEachChild(n, countNodes);
    };

    countNodes(node);
    return complexity;
  }

  /**
   * Walk directory recursively
   *
   * @private
   * @param {string} dir - Directory path
   */
  private walkDirectory(dir: string): void {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        if (!file.startsWith('.') && file !== 'node_modules') {
          this.walkDirectory(filePath);
        }
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const sourceFile = ts.createSourceFile(
            filePath,
            content,
            ts.ScriptTarget.Latest,
            true,
            ts.ScriptKind.TS
          );
          this.analyzeFile(sourceFile, filePath, content);
          this.filesScanned++;
        } catch {
          // Continue on error
        }
      }
    });
  }

  /**
   * Generate performance report
   *
   * @private
   * @returns {PerformanceScanResult} Report
   */
  private generateReport(): PerformanceScanResult {
    const duration = Date.now() - this.startTime;
    const criticalCount = this.issues.filter(i => i.severity === 'critical').length;
    const totalIssues = this.issues.length;
    const slowFunctions = this.issues.filter(i => i.type === 'HIGH_COMPLEXITY').length;

    const avgComplexity =
      this.profiles.length > 0
        ? this.profiles.reduce((sum, p) => sum + p.metrics.cyclomaticComplexity, 0) /
          this.profiles.length
        : 0;

    const passed = criticalCount === 0;

    let summary = `Performance scan ${passed ? 'PASSED' : 'FAILED'}`;
    if (slowFunctions > 0) {
      summary += ` - ${slowFunctions} high-complexity function(s)`;
    }

    return {
      passed,
      issues: this.issues,
      profiles: this.profiles,
      stats: {
        totalIssues,
        criticalCount,
        averageComplexity: parseFloat(avgComplexity.toFixed(2)),
        filesScanned: this.filesScanned,
        slowFunctions,
        duration
      },
      summary
    };
  }

  /**
   * Reset internal state
   *
   * @private
   */
  private reset(): void {
    this.issues = [];
    this.profiles = [];
    this.filesScanned = 0;
    this.startTime = 0;
  }

  /**
   * Format report as human-readable string
   *
   * @param {PerformanceScanResult} result - Scan result
   * @returns {string} Formatted report
   */
  formatReport(result: PerformanceScanResult): string {
    let report = '\n\n';
    report += `  PERFORMANCE PROFILE REPORT\n`;
    report += `\n\n`;

    report += `STATUS: ${result.passed ? 'OK PASSED' : 'WARNING  WARNING'}\n`;
    report += `Summary: ${result.summary}\n\n`;

    // Statistics
    report += `STATS METRICS:\n`;
    report += `  Files Scanned: ${result.stats.filesScanned}\n`;
    report += `  Total Issues: ${result.stats.totalIssues}\n`;
    report += `  High Complexity: ${result.stats.slowFunctions}\n`;
    report += `  Average Complexity: ${result.stats.averageComplexity.toFixed(2)}\n`;
    report += `  Duration: ${result.stats.duration}ms\n\n`;

    // Top issues
    if (result.stats.totalIssues > 0) {
      report += `WARNING  TOP ISSUES:\n`;
      result.issues
        .sort((a, b) => {
          const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return severityOrder[a.severity] - severityOrder[b.severity];
        })
        .slice(0, 5)
        .forEach((issue, idx) => {
          report += `  ${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.type}\n`;
          report += `     File: ${issue.file}:${issue.line}\n`;
          report += `     Message: ${issue.message}\n`;
          report += `     Recommendation: ${issue.recommendation}\n\n`;
        });
    }

    report += `\n`;

    return report;
  }
}

export default PerformanceProfiler;
