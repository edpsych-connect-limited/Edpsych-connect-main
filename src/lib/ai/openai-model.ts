/**
 * Central OpenAI model selection.
 *
 * Default is GPT-5.2 (Preview) per platform policy.
 * Override with OPENAI_MODEL when needed.
 */

export function getDefaultOpenAIModel(): string {
  return process.env.OPENAI_MODEL || 'gpt-5.2-preview';
}
