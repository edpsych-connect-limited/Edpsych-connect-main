/**
 * AI data-use policy (repo-enforced).
 *
 * This file exists to make key privacy claims *provable by repo*: we can anchor
 * video script statements to a concrete, reviewed policy constant and to CI
 * validations that enforce it.
 *
 * IMPORTANT:
 * - This codebase does not implement any training/fine-tuning pipelines using
 *   end-user queries.
 * - This policy is about *our* product behaviour. It does not attempt to restate
 *   or replace any third-party provider policy/terms.
 */

export const AI_DATA_USE_POLICY = {
  /**
   * End-user queries must not be used to train future AI models.
   *
   * If this ever changes, CI validation must be updated and scripts must be
   * re-audited; until then, any attempt to enable this should be treated as a
   * breaking governance change.
   */
  trainOnStudentQueries: false,
} as const;
