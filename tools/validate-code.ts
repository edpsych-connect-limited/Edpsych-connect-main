#!/usr/bin/env node

/**
 * Enterprise Code Validation CLI
 * Command-line interface for code validation
 *
 * Usage:
 *   npx validate-code [command] [options]
 *
 * Commands:
 *   validate-file <path>      Validate a single file
 *   validate-service <path> <class>  Validate a service class
 *   validate-dir <path>       Validate a directory
 *   validate-build <path>     Validate for build (strict mode)
 *   report <path>             Generate validation report
 *
 * Options:
 *   --strict                  Enable strict mode (fail on warnings)
 *   --stubs                   Auto-generate method stubs
 *   --format <type>           Report format: text, json, html
 */

import CodeValidator from '../src/lib/validation/codeValidator';
import ValidationService from '../src/lib/validation/validationService';

const args = process.argv.slice(2);

if (args.length === 0) {
  printHelp();
  process.exit(1);
}

const command = args[0];
const options = {
  strictMode: args.includes('--strict'),
  autoGenerateStubs: args.includes('--stubs'),
  reportFormat: (args.find(arg => arg.startsWith('--format='))?.split('=')[1] || 'text') as 'json' | 'text' | 'html'
};

/**
 * Print help information
 */
function printHelp(): void {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║         Enterprise Code Validation CLI                        ║
╚════════════════════════════════════════════════════════════════╝

USAGE:
  npx validate-code [command] [options]

COMMANDS:
  validate-file <path>
    Validate a single TypeScript file
    Example: npx validate-code validate-file src/lib/services/myService.ts

  validate-service <path> <class>
    Validate a specific service class
    Example: npx validate-code validate-service src/lib/services/myService.ts MyService

  validate-dir <path>
    Validate an entire directory recursively
    Example: npx validate-code validate-dir src/lib/services

  validate-build <path>
    Strict validation for build (fails on critical errors)
    Example: npx validate-code validate-build src

  report <path>
    Generate detailed validation report
    Example: npx validate-code report src/lib/services

OPTIONS:
  --strict                Enable strict mode (fail on warnings)
  --stubs                 Auto-generate method stubs for missing methods
  --format=<type>         Report format: text (default), json, html

EXAMPLES:
  # Validate a single file
  npx validate-code validate-file src/lib/services/predictiveAnalyticsService.ts

  # Validate entire service layer with strict mode
  npx validate-code validate-dir src/lib/services --strict

  # Generate report in JSON format
  npx validate-code report src --format=json

  # Auto-generate stubs for missing methods
  npx validate-code validate-service src/lib/services/myService.ts MyService --stubs
  `);
}

/**
 * Run validation command
 */
async function runValidation(): Promise<void> {
  try {
    const validator = new CodeValidator();
    const service = new ValidationService(options);

    switch (command) {
      case 'validate-file': {
        if (!args[1]) {
          console.error('❌ Error: File path required');
          process.exit(1);
        }
        const result = await validator.validateFile(args[1]);
        console.log(validator.formatReport(result));
        process.exit(result.isValid ? 0 : 1);
        break;
      }

      case 'validate-service': {
        if (!args[1] || !args[2]) {
          console.error('❌ Error: File path and class name required');
          process.exit(1);
        }
        const result = await service.validateService(args[1], args[2]);
        console.log(validator.formatReport(result));
        if (result.generatedStubs) {
          console.log('\n📝 Generated Method Stubs:\n');
          console.log(result.generatedStubs);
        }
        process.exit(result.isValid ? 0 : 1);
        break;
      }

      case 'validate-dir': {
        if (!args[1]) {
          console.error('❌ Error: Directory path required');
          process.exit(1);
        }
        const result = await validator.validateDirectory(args[1]);
        console.log(validator.formatReport(result));
        process.exit(result.isValid ? 0 : 1);
        break;
      }

      case 'validate-build': {
        if (!args[1]) {
          console.error('❌ Error: Directory path required');
          process.exit(1);
        }
        const passed = await service.buildTimeValidation(args[1]);
        process.exit(passed ? 0 : 1);
        break;
      }

      case 'report': {
        if (!args[1]) {
          console.error('❌ Error: Directory path required');
          process.exit(1);
        }
        const report = await service.generateReport(args[1]);
        console.log(report);
        process.exit(0);
        break;
      }

      case '--help':
      case '-h':
      case 'help': {
        printHelp();
        process.exit(0);
        break;
      }

      default: {
        console.error(`❌ Unknown command: ${command}`);
        printHelp();
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('❌ Validation error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

runValidation();
