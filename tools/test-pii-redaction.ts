/* eslint-disable no-console */
import assert from 'node:assert/strict';
import { redactPII } from '../src/lib/security/pii-redaction';

function run(): void {
  // Email
  {
    const r = redactPII('Contact: teacher@school.gov.uk');
    assert.equal(r.redactedText.includes('[EMAIL]'), true, 'Email should be redacted');
    assert.equal((r.redactionCounts['[EMAIL]'] || 0) >= 1, true, 'Email count should increment');
  }

  // Phone (UK-ish)
  {
    const r = redactPII('Call 07700 900123 for support');
    assert.equal(r.redactedText.includes('[PHONE]'), true, 'Phone should be redacted');
  }

  // Postcode
  {
    const r = redactPII('Address: London SW1A 1AA');
    assert.equal(r.redactedText.includes('[POSTCODE]'), true, 'Postcode should be redacted');
  }

  // National Insurance
  {
    // Use a valid-looking NI number format (note: some prefixes are invalid by spec).
    const r = redactPII('NI: AB 12 34 56 C');
    assert.equal(r.redactedText.includes('[NATIONAL_INSURANCE]'), true, 'NI should be redacted');
  }

  // Date formats
  {
    const r = redactPII('DOB 01/02/2012');
    assert.equal(r.redactedText.includes('[DATE]'), true, 'Date should be redacted');
  }

  // Explicit entities
  {
    const r = redactPII('Student name: Emma Thompson', { entities: ['Emma Thompson'] });
    assert.equal(r.redactedText.includes('[REDACTED]'), true, 'Explicit entity should be redacted');
  }

  // Empty
  {
    const r = redactPII('');
    assert.equal(r.redactedText, '');
  }

  console.log('OK: PII redaction tests passed');
}

run();
