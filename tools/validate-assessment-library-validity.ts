/**
 * Deterministic validator for the Assessment Library “validity / clinical-grade capture” posture.
 *
 * This is NOT a psychometrics validator.
 * It only asserts repo-verifiable engineering properties:
 * - the copyright-safe disclaimer remains present
 * - the exported library exists and has expected minimum structure
 * - templates include qualification gating + references
 *
 * Run:
 *   npx tsx tools/validate-assessment-library-validity.ts
 */

import fs from 'node:fs';
import path from 'node:path';

import { ASSESSMENT_LIBRARY } from '../src/lib/assessments/assessment-library';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function nonEmptyString(x: unknown): x is string {
  return typeof x === 'string' && x.trim().length > 0;
}

function main(): void {
  const libraryPath = path.resolve(process.cwd(), 'src/lib/assessments/assessment-library.ts');
  const text = fs.readFileSync(libraryPath, 'utf8');

  // Hard requirements: the disclaimer text that protects against implying we ship copyrighted instruments.
  assert(
    text.includes('IMPORTANT: These are assessment frameworks and recording tools'),
    'Missing required disclaimer: "IMPORTANT: These are assessment frameworks and recording tools"'
  );
  assert(
    text.toLowerCase().includes('not copyrighted assessment instruments'.toLowerCase()),
    'Missing required disclaimer: "not copyrighted assessment instruments"'
  );

  // Basic structural checks on the library export.
  assert(Array.isArray(ASSESSMENT_LIBRARY), 'ASSESSMENT_LIBRARY must be an array');
  assert(ASSESSMENT_LIBRARY.length >= 20, 'ASSESSMENT_LIBRARY unexpectedly small (< 20 templates)');

  for (const tmpl of ASSESSMENT_LIBRARY) {
    assert(nonEmptyString(tmpl.id), 'Template missing id');
    assert(nonEmptyString(tmpl.name), `Template ${tmpl.id || '(unknown)'} missing name`);

    // Qualification gating is a core part of “clinical-grade capture” in engineering terms.
    assert(
      nonEmptyString((tmpl as any).qualification_required),
      `Template ${tmpl.id} missing qualification_required`
    );

    // References should exist to keep the template grounded.
    assert(Array.isArray(tmpl.references), `Template ${tmpl.id} references must be an array`);
    assert(tmpl.references.length > 0, `Template ${tmpl.id} references must not be empty`);
    assert(
      tmpl.references.every(nonEmptyString),
      `Template ${tmpl.id} references contain empty/invalid entries`
    );

    // Guardrails: these booleans should exist on every template.
    assert(typeof tmpl.is_standardized === 'boolean', `Template ${tmpl.id} missing is_standardized boolean`);
    assert(typeof tmpl.norm_referenced === 'boolean', `Template ${tmpl.id} missing norm_referenced boolean`);
  }

  // Success marker consumed by the script-code audit tool.
  // (Do not change without also updating tools/audit-video-scripts-against-code.ts)
  // eslint-disable-next-line no-console
  console.log('OK: assessment library validity checks passed');
}

main();
