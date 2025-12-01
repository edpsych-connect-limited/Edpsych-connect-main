/**
 * Security Scanner
 * Detects security vulnerabilities in TypeScript code
 *
 * @module SecurityScanner
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Security issue interface
 */
interface SecurityIssue {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  file: string;
  line: number;
  column: number;
  message: string;
  cveId?: string;
  remediation: string;
}

/**
 * Security scan result
 */
interface SecurityScanResult {
  passed: boolean;
  issues: SecurityIssue[];
  stats: {
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    totalIssues: number;
    filesScanned: number;
    duration: number;
  };
  summary: string;
}

/**
 * Enterprise Security Scanner
 */
export class SecurityScanner {
  private issues: SecurityIssue[] = [];
  private filesScanned: number = 0;
  private startTime: number = 0;

  /**
   * Security patterns to check
   */
  private securityPatterns = [
    {
      name: 'SQL_INJECTION',
      pattern: /query\s*\(\s*['"]\s*SELECT|query\s*\(\s*\$\d+/g,
      severity: 'critical' as const,
      message: 'Potential SQL injection vulnerability',
      remediation: 'Use parameterized queries or prepared statements'
    },
    {
      name: 'XSS_VULNERABILITY',
      pattern: /innerHTML\s*=|dangerouslySetInnerHTML/g,
      severity: 'high' as const,
      message: 'Potential XSS vulnerability',
      remediation: 'Use textContent or sanitize with DOMPurify'
    },
    {
      name: 'HARDCODED_SECRETS',
      pattern: /(password|secret|api_key|apiKey|token)\s*[:=]\s*['"][^'"]{8,}/gi,
      severity: 'critical' as const,
      message: 'Hardcoded secret or password detected',
      remediation: 'Move to environment variables or secure vault'
    },
    {
      name: 'EVAL_USAGE',
      pattern: /\beval\s*\(/g,
      severity: 'critical' as const,
      message: 'Use of eval() detected',
      remediation: 'Avoid eval(). Use alternatives like Function constructor with validation'
    },
    {
      name: 'INSECURE_RANDOM',
      pattern: /Math\.random\s*\(\)|random\s*\(\)/g,
      severity: 'high' as const,
      message: 'Insecure random number generation for security purposes',
      remediation: 'Use crypto.getRandomValues() for security-sensitive operations'
    },
    {
      name: 'WEAK_CRYPTO',
      pattern: /md5|sha1|RC4|DES/gi,
      severity: 'high' as const,
      message: 'Weak cryptographic algorithm detected',
      remediation: 'Use SHA-256 or stronger algorithms (SHA-384, SHA-512)'
    },
    {
      name: 'MISSING_CSRF_PROTECTION',
      pattern: /POST|PUT|DELETE/g,
      severity: 'medium' as const,
      message: 'API endpoint may lack CSRF protection',
      remediation: 'Implement CSRF tokens or use SameSite cookies'
    },
    {
      name: 'DEBUG_CODE',
      pattern: /console\.(log|debug|info)\s*\(/g,
      severity: 'low' as const,
      message: 'Debug console statements left in code',
      remediation: 'Remove console statements from production code'
    }
  ];

  /**
   * Scan a file for security issues
   *
   * @param {string} filePath - File path
   * @returns {Promise<SecurityScanResult>} Scan result
   */
  async scanFile(filePath: string): Promise<SecurityScanResult> {
    this.reset();
    this.startTime = Date.now();

    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      this.analyzeContent(content, filePath);
      this.filesScanned++;

      return this.generateReport();
    } catch (_error) {
      const msg = _error instanceof Error ? _error.message : String(_error);
      this.issues.push({
        type: 'SCAN_ERROR',
        severity: 'high',
        file: filePath,
        line: 0,
        column: 0,
        message: `Scan _error: ${msg}`,
        remediation: 'Check file accessibility and format'
      });
      return this.generateReport();
    }
  }

  /**
   * Scan a directory recursively
   *
   * @param {string} dirPath - Directory path
   * @param {string[]} extensions - File extensions to scan
   * @returns {Promise<SecurityScanResult>} Scan result
   */
  async scanDirectory(
    dirPath: string,
    extensions: string[] = ['.ts', '.tsx', '.js', '.jsx']
  ): Promise<SecurityScanResult> {
    this.reset();
    this.startTime = Date.now();

    try {
      if (!fs.existsSync(dirPath)) {
        throw new Error(`Directory not found: ${dirPath}`);
      }

      this.walkDirectory(dirPath, extensions);
      return this.generateReport();
    } catch (_error) {
      const msg = _error instanceof Error ? _error.message : String(_error);
      this.issues.push({
        type: 'SCAN_ERROR',
        severity: 'high',
        file: dirPath,
        line: 0,
        column: 0,
        message: `Directory scan _error: ${msg}`,
        remediation: 'Check directory path and permissions'
      });
      return this.generateReport();
    }
  }

  /**
   * Analyze content for security issues
   *
   * @private
   * @param {string} content - File content
   * @param {string} filePath - File path
   */
  private analyzeContent(content: string, filePath: string): void {
    const lines = content.split('\n');

    this.securityPatterns.forEach(pattern => {
      let match;
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);

      lines.forEach((line, lineIndex) => {
        while ((match = regex.exec(line)) !== null) {
          this.issues.push({
            type: pattern.name,
            severity: pattern.severity,
            file: filePath,
            line: lineIndex + 1,
            column: match.index + 1,
            message: pattern.message,
            remediation: pattern.remediation
          });
        }
      });
    });
  }

  /**
   * Walk directory recursively
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
        if (!file.startsWith('.') && file !== 'node_modules') {
          this.walkDirectory(filePath, extensions);
        }
      } else if (extensions.some(ext => file.endsWith(ext))) {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          this.analyzeContent(content, filePath);
          this.filesScanned++;
        } catch {
          // Continue on error
        }
      }
    });
  }

  /**
   * Generate security report
   *
   * @private
   * @returns {SecurityScanResult} Report
   */
  private generateReport(): SecurityScanResult {
    const duration = Date.now() - this.startTime;
    const criticalCount = this.issues.filter(i => i.severity === 'critical').length;
    const highCount = this.issues.filter(i => i.severity === 'high').length;
    const mediumCount = this.issues.filter(i => i.severity === 'medium').length;
    const lowCount = this.issues.filter(i => i.severity === 'low').length;

    const passed = criticalCount === 0;

    let summary = `Security scan ${passed ? 'PASSED' : 'FAILED'}`;
    if (!passed) {
      summary += ` - ${criticalCount} critical issue(s)`;
    }
    if (highCount > 0) {
      summary += ` - ${highCount} high issue(s)`;
    }

    return {
      passed,
      issues: this.issues,
      stats: {
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
        totalIssues: this.issues.length,
        filesScanned: this.filesScanned,
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
    this.filesScanned = 0;
    this.startTime = 0;
  }

  /**
   * Format report as human-readable string
   *
   * @param {SecurityScanResult} result - Scan result
   * @returns {string} Formatted report
   */
  formatReport(result: SecurityScanResult): string {
    let report = '\n════════════════════════════════════════════════════════════\n';
    report += `  SECURITY SCAN REPORT\n`;
    report += `════════════════════════════════════════════════════════════\n\n`;

    report += `STATUS: ${result.passed ? '✅ PASSED' : '🚨 FAILED'}\n`;
    report += `Summary: ${result.summary}\n\n`;

    // Statistics
    report += `📊 STATISTICS:\n`;
    report += `  Critical Issues: ${result.stats.criticalCount}\n`;
    report += `  High Issues: ${result.stats.highCount}\n`;
    report += `  Medium Issues: ${result.stats.mediumCount}\n`;
    report += `  Low Issues: ${result.stats.lowCount}\n`;
    report += `  Total Issues: ${result.stats.totalIssues}\n`;
    report += `  Files Scanned: ${result.stats.filesScanned}\n`;
    report += `  Duration: ${result.stats.duration}ms\n\n`;

    // Issues by severity
    if (result.stats.criticalCount > 0) {
      report += `🚨 CRITICAL (${result.stats.criticalCount}):\n`;
      result.issues
        .filter(i => i.severity === 'critical')
        .slice(0, 5)
        .forEach((issue, idx) => {
          report += `  ${idx + 1}. ${issue.type}\n`;
          report += `     File: ${issue.file}:${issue.line}:${issue.column}\n`;
          report += `     Message: ${issue.message}\n`;
          report += `     Fix: ${issue.remediation}\n\n`;
        });
      if (result.stats.criticalCount > 5) {
        report += `  ... and ${result.stats.criticalCount - 5} more critical issues\n\n`;
      }
    }

    if (result.stats.highCount > 0) {
      report += `⚠️  HIGH (${result.stats.highCount}):\n`;
      result.issues
        .filter(i => i.severity === 'high')
        .slice(0, 3)
        .forEach((issue, idx) => {
          report += `  ${idx + 1}. ${issue.type}\n`;
          report += `     File: ${issue.file}:${issue.line}\n`;
          report += `     Message: ${issue.message}\n\n`;
        });
    }

    report += `════════════════════════════════════════════════════════════\n`;

    return report;
  }
}

export default SecurityScanner;
