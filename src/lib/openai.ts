import { logger } from "@/lib/logger";
/**
 * OpenAI Module
 * Provides OpenAI API client instance for AI operations
 */

import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn('OPENAI_API_KEY environment variable is not set');
}

export const openai = new OpenAI({
  apiKey: apiKey || 'sk-test',
});
