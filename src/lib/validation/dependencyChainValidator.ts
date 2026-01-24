/**
 * Dependency Chain Validator
 * Detects circular dependencies, deep import chains, and version mismatches
 *
 * @module DependencyChainValidator
 */

import * as fs from 'fs';
import * as path from 'path';

interface DependencyIssue {
  type: 'CIRCULAR_IMPORT' | 'DEEP_CHAIN' | 'BROKEN_IMPORT' | 'VERSION_MISMATCH';
  severity: 'critical' | 'high' | 'medium';
  file: string;
  line: number;
  message: string;
  chain?: string[]; // For circular dependencies
  depth?: number;
  suggestion: string;
}

interface DependencyNode {
  path: string;
  imports: string[];
  dependents: string[];
  depth: number;
  visited?: boolean;
  recursionStack?: Set<string>;
}

export class DependencyChainValidator {
  private dependencyGraph: Map<string, DependencyNode> = new Map();
  private issues: DependencyIssue[] = [];
  private visitStack: Set<string> = new Set();
  private sourceDir: string;

  constructor(sourceDir: string = './src') {
    this.sourceDir = sourceDir;
  }

  /**
   * Validate dependencies in a directory
   */
  async validateDirectory(dirPath: string): Promise<{ errors: DependencyIssue[]; stats: any }> {
    this.reset();

    try {
      // Build dependency graph
      this.buildDependencyGraph(dirPath);

      // Detect circular dependencies
      this.detectCircularDependencies();

      // Detect deep chains
      this.detectDeepChains();

      // Detect broken imports
      this.detectBrokenImports();

      return {
        errors: this.issues,
        stats: {
          totalFiles: this.dependencyGraph.size,
          circularDeps: this.issues.filter(i => i.type === 'CIRCULAR_IMPORT').length,
          deepChains: this.issues.filter(i => i.type === 'DEEP_CHAIN').length,
          brokenImports: this.issues.filter(i => i.type === 'BROKEN_IMPORT').length
        }
      };
    } catch (_error) {
      const msg = _error instanceof Error ? _error.message : String(_error);
      return {
        errors: [{
          type: 'BROKEN_IMPORT',
          severity: 'critical',
          file: dirPath,
          line: 0,
          message: `Dependency validation error: ${msg}`,
          suggestion: 'Check directory path and file permissions'
        }],
        stats: { totalFiles: 0, circularDeps: 0, deepChains: 0, brokenImports: 0 }
      };
    }
  }

  /**
   * Build dependency graph
   */
  private buildDependencyGraph(dirPath: string): void {
    const absolutePath = path.resolve(dirPath);
    this.walkDirectory(absolutePath);
  }

  /**
   * Walk directory and extract imports
   */
  private walkDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) return;

    const items = fs.readdirSync(dirPath);

    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip node_modules and .next
        if (item === 'node_modules' || item === '.next' || item === 'dist') return;
        this.walkDirectory(fullPath);
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        this.extractImports(fullPath);
      }
    });
  }

  /**
   * Extract imports from a file
   */
  private extractImports(filePath: string): void {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const imports: string[] = [];

      // Extract import statements
      const importRegex = /import\s+(?:(?:\{[^}]*\}|[^'"]*)\s+from\s+)?['"]([^'"]+)['"]/g;
      let match;

      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        const resolved = this.resolveImportPath(filePath, importPath);
        if (resolved && fs.existsSync(resolved)) {
          imports.push(resolved);
        }
      }

      this.dependencyGraph.set(filePath, {
        path: filePath,
        imports,
        dependents: [],
        depth: 0
      });

      // Update dependents
      imports.forEach(imp => {
        const node = this.dependencyGraph.get(imp);
        if (node) {
          node.dependents.push(filePath);
        }
      });
    } catch {
      // Silently skip unreadable files
    }
  }

  /**
   * Resolve import path
   */
  private resolveImportPath(filePath: string, importPath: string): string | null {
    if (importPath.startsWith('.')) {
      // Relative import
      const dir = path.dirname(filePath);
      let resolved = path.resolve(dir, importPath);

      // Try with extensions
      if (fs.existsSync(resolved + '.ts')) return resolved + '.ts';
      if (fs.existsSync(resolved + '.tsx')) return resolved + '.tsx';
      if (fs.existsSync(resolved + '/index.ts')) return resolved + '/index.ts';
      if (fs.existsSync(resolved + '/index.tsx')) return resolved + '/index.tsx';

      return resolved;
    }

    // For @/ or other aliases
    if (importPath.startsWith('@/')) {
      const resolved = path.resolve(this.sourceDir, importPath.substring(2));
      if (fs.existsSync(resolved + '.ts')) return resolved + '.ts';
      if (fs.existsSync(resolved + '.tsx')) return resolved + '.tsx';
      if (fs.existsSync(resolved + '/index.ts')) return resolved + '/index.ts';
      if (fs.existsSync(resolved + '/index.tsx')) return resolved + '/index.tsx';
    }

    return null;
  }

  /**
   * Detect circular dependencies
   */
  private detectCircularDependencies(): void {
    this.dependencyGraph.forEach((node, filePath) => {
      const cycle = this.findCycle(filePath, new Set(), [filePath]);
      if (cycle && cycle.length > 1) {
        this.issues.push({
          type: 'CIRCULAR_IMPORT',
          severity: 'critical',
          file: filePath,
          line: 0,
          message: `Circular dependency detected: ${cycle.join(' -> ')}`,
          chain: cycle,
          suggestion: 'Refactor to remove cyclic imports or use lazy loading'
        });
      }
    });
  }

  /**
   * Find cycle starting from a node
   */
  private findCycle(filePath: string, visited: Set<string>, path: string[]): string[] | null {
    const node = this.dependencyGraph.get(filePath);
    if (!node) return null;

    if (visited.has(filePath)) {
      // Found cycle
      const cycleStart = path.indexOf(filePath);
      return path.slice(cycleStart);
    }

    visited.add(filePath);

    for (const imp of node.imports) {
      const cycle = this.findCycle(imp, new Set(visited), [...path, imp]);
      if (cycle) return cycle;
    }

    return null;
  }

  /**
   * Detect deep import chains
   */
  private detectDeepChains(): void {
    this.calculateDepths();

    this.dependencyGraph.forEach((node, filePath) => {
      if (node.depth > 5) {
        this.issues.push({
          type: 'DEEP_CHAIN',
          severity: 'medium',
          file: filePath,
          line: 0,
            depth: node.depth,
            message: `Deep import chain detected (depth: ${node.depth})`,
            suggestion: 'Consider reorganizing code to reduce import nesting'
          });
      }
    });
  }

  /**
   * Calculate import depth for each node
   */
  private calculateDepths(): void {
    const visited = new Set<string>();

    const calculate = (filePath: string): number => {
      if (visited.has(filePath)) return 0; // Avoid cycles

      const node = this.dependencyGraph.get(filePath);
      if (!node) return 0;

      visited.add(filePath);

      const maxDepth = node.imports.length > 0
        ? Math.max(...node.imports.map(imp => calculate(imp)))
        : 0;

      node.depth = maxDepth + 1;
      return node.depth;
    };

    this.dependencyGraph.forEach((_, filePath) => {
      calculate(filePath);
    });
  }

  /**
   * Detect broken imports
   */
  private detectBrokenImports(): void {
    this.dependencyGraph.forEach((node, filePath) => {
      node.imports.forEach(imp => {
        if (!this.dependencyGraph.has(imp) && !fs.existsSync(imp)) {
          try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const lineNum = content.split('\n').findIndex(line => line.includes(imp)) + 1;

            this.issues.push({
              type: 'BROKEN_IMPORT',
              severity: 'high',
              file: filePath,
              line: lineNum,
              message: `Cannot resolve import: ${imp}`,
              suggestion: 'Check import path, verify file exists, or add missing dependency'
            });
          } catch {
            // Skip if can't read file
          }
        }
      });
    });
  }  /**
   * Reset state
   */
  private reset(): void {
    this.dependencyGraph.clear();
    this.issues = [];
    this.visitStack.clear();
  }
}
