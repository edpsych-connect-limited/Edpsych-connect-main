/**
 * PII Redaction Utility
 *
 * Purpose:
 * - Reduce accidental leakage of PII to third-party providers (e.g. LLM APIs).
 * - Provide deterministic, auditable redaction behavior.
 *
 * Notes:
 * - This is heuristic redaction (regex + optional explicit entity list).
 * - It is intentionally conservative and should be treated as a safety layer,
 *   not a guarantee that all PII is removed.
 */

export type RedactionToken =
  | '[EMAIL]'
  | '[PHONE]'
  | '[DOB]'
  | '[DATE]'
  | '[POSTCODE]'
  | '[NATIONAL_INSURANCE]'
  | '[STUDENT]'
  | '[STAFF]'
  | '[REDACTED]';

export interface PIIRedactionOptions {
  /**
   * Explicit entities (names/identifiers) to redact.
   * Example: student full name from a record ("Emma Thompson").
   */
  entities?: string[];
  /**
   * When true, uses broader date patterns (may over-redact).
   * Defaults to true.
   */
  aggressiveDates?: boolean;
}

export interface PIIRedactionResult {
  redactedText: string;
  redactionCounts: Record<string, number>;
}

function escapeRegExp(literal: string): string {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceWithCount(input: string, pattern: RegExp, token: RedactionToken, counts: Record<string, number>): string {
  let count = 0;
  const next = input.replace(pattern, () => {
    count += 1;
    return token;
  });
  if (count > 0) counts[token] = (counts[token] || 0) + count;
  return next;
}

/**
 * Redact likely PII from free-text.
 */
export function redactPII(text: string, options: PIIRedactionOptions = {}): PIIRedactionResult {
  const counts: Record<string, number> = {};
  if (!text) return { redactedText: '', redactionCounts: counts };

  const aggressiveDates = options.aggressiveDates !== false;
  let out = text;

  // Emails
  out = replaceWithCount(
    out,
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    '[EMAIL]',
    counts
  );

  // UK phone-ish (very heuristic; catches many formats)
  out = replaceWithCount(
    out,
    /\b(?:\+?44\s?\(0\)\s?|\+?44\s?|0)(?:\d\s?){9,10}\b/g,
    '[PHONE]',
    counts
  );

  // UK postcodes (broad but acceptable)
  out = replaceWithCount(
    out,
    /\b([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})\b/gi,
    '[POSTCODE]',
    counts
  );

  // National Insurance (UK)
  out = replaceWithCount(
    out,
    /\b(?!BG)(?!GB)(?!NK)(?!KN)(?!TN)(?!NT)(?!ZZ)(?:[A-CEGHJ-PR-TW-Z]{2})\s?\d{2}\s?\d{2}\s?\d{2}\s?[A-D]\b/gi,
    '[NATIONAL_INSURANCE]',
    counts
  );

  // Dates (DOB/Date) - dd/mm/yyyy or dd-mm-yyyy
  out = replaceWithCount(
    out,
    /\b(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[0-2])[\/\-](?:\d{2}|\d{4})\b/g,
    '[DATE]',
    counts
  );

  // Month name dates (aggressive option)
  if (aggressiveDates) {
    out = replaceWithCount(
      out,
      /\b(0?[1-9]|[12][0-9]|3[01])\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/gi,
      '[DATE]',
      counts
    );
  }

  // Explicit entities (names/identifiers we already know) - strongest signal.
  if (options.entities && options.entities.length > 0) {
    for (const entity of options.entities) {
      const trimmed = entity?.trim();
      if (!trimmed) continue;
      // Replace whole-word occurrences, case-insensitive.
      const entityRe = new RegExp(`\\b${escapeRegExp(trimmed)}\\b`, 'gi');
      out = replaceWithCount(out, entityRe, '[REDACTED]', counts);
    }
  }

  return { redactedText: out, redactionCounts: counts };
}
