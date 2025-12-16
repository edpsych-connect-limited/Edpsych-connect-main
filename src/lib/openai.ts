/**
 * OpenAI Module
 * Provides OpenAI API client instance for AI operations
 */

import OpenAI from 'openai';

import { getDefaultOpenAIModel } from '@/lib/ai/openai-model';

const apiKey = process.env.OPENAI_API_KEY;

let _client: OpenAI | null = null;

export const DEFAULT_OPENAI_MODEL = getDefaultOpenAIModel();

export function getOpenAIClient(): OpenAI {
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  if (_client) return _client;
  _client = new OpenAI({ apiKey });
  return _client;
}

// Convenience export for call sites that can tolerate missing keys.
// Prefer `getOpenAIClient()` so missing keys fail fast.
export const openai: OpenAI | null = apiKey ? getOpenAIClient() : null;
