#!/usr/bin/env node

/**
 * Test script to demonstrate syntax error detection in CodeValidator
 * Shows how the enhanced validator catches syntax errors like TS1128
 */

import { CodeValidator } from '../src/lib/validation/codeValidator';

async function testSyntaxValidation() {
  const validator = new CodeValidator();

  console.log('🔍 Testing Enhanced CodeValidator with Syntax Error Detection\n');
  console.log('='.repeat(60));

  try {
    // Test 1: Validate a directory for syntax errors
    console.log('\n📂 Test 1: Directory validation (full codebase)');
    const result = await validator.validateDirectory('./src', ['.ts', '.tsx']);
    
    if (result.errors.length > 0) {
      const syntaxErrors = result.errors.filter(e => e.type === 'SYNTAX_ERROR');
      const compilerErrors = result.errors.filter(e => e.type === 'COMPILER_ERROR');
      
      console.log(`\n✅ Validation complete:`);
      console.log(`  • Syntax Errors:   ${syntaxErrors.length}`);
      console.log(`  • Compiler Errors: ${compilerErrors.length}`);
      console.log(`  • Other Issues:    ${result.errors.length - syntaxErrors.length - compilerErrors.length}`);

      if (syntaxErrors.length > 0) {
        console.log('\n🔴 Syntax Errors Found:');
        syntaxErrors.slice(0, 5).forEach(err => {
          console.log(`\n  File: ${err.file}`);
          console.log(`  Line: ${err.line}, Column: ${err.column}`);
          console.log(`  Code: ${err.code}`);
          console.log(`  Issue: ${err.message}`);
          console.log(`  Fix: ${err.suggestion}`);
        });

        if (syntaxErrors.length > 5) {
          console.log(`\n  ... and ${syntaxErrors.length - 5} more syntax errors`);
        }
      } else {
        console.log('\n✨ No syntax errors detected!');
      }
    }

    console.log(`\n📊 Statistics:`);
    console.log(`  • Total Methods: ${result.stats.totalMethods}`);
    console.log(`  • Total Calls: ${result.stats.totalCalls}`);
    console.log(`  • Validation Time: ${result.stats.duration}ms`);

  } catch (error) {
    console.error('❌ Validation failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Syntax validation test complete');
}

testSyntaxValidation();
