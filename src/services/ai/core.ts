import { logger } from "@/lib/logger";
/**
 * AI Service Core Module
 * 
 * This module provides core functionality for AI service integration,
 * including connections to OpenAI and Anthropic Claude services.
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

// Environment validation schema
const EnvSchema = z.object({
  OPENAI_API_KEY: z.string().optional(),
  CLAUDE_API_KEY: z.string().optional(),
  XAI_API_KEY: z.string().optional(),
});

// Validate environment variables
const env: z.infer<typeof EnvSchema> = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY,
  XAI_API_KEY: process.env.XAI_API_KEY,
};

// Initialize API clients
let openaiClient: OpenAI | null = null;
let anthropicClient: Anthropic | null = null;
let xaiClient: OpenAI | null = null;

try {
  if (env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  if (env.CLAUDE_API_KEY) {
    anthropicClient = new Anthropic({
      apiKey: env.CLAUDE_API_KEY,
    });
  }

  if (env.XAI_API_KEY) {
    xaiClient = new OpenAI({
      apiKey: env.XAI_API_KEY,
      baseURL: "https://api.x.ai/v1",
    });
  }
} catch (error) {
  console.error('Error initializing AI clients:', error);
}

// Response type definitions
export interface AIResponse {
  text: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  provider: 'openai' | 'anthropic' | 'xai';
}

// Parameter interfaces
export interface OpenAIParams {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface AnthropicParams {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  system?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

/**
 * Call OpenAI API
 */
export async function callOpenAI(params: OpenAIParams): Promise<AIResponse> {
  if (!openaiClient) {
    throw new Error('OpenAI client not initialized. Check your API key.');
  }

  try {
    const response = await openaiClient.chat.completions.create({
      model: params.model,
      messages: params.messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens,
      top_p: params.topP,
      frequency_penalty: params.frequencyPenalty,
      presence_penalty: params.presencePenalty,
    });

    return {
      text: response.choices[0]?.message?.content || '',
      model: params.model,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
      provider: 'openai',
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
}

/**
 * Call Anthropic Claude API
 */
export async function callAnthropic(params: AnthropicParams): Promise<AIResponse> {
  if (!anthropicClient) {
    throw new Error('Anthropic client not initialized. Check your API key.');
  }

  try {
    const systemPrompt = params.system || '';
    const response = await anthropicClient.messages.create({
      model: params.model,
      messages: params.messages,
      system: systemPrompt,
      temperature: params.temperature ?? undefined,
      max_tokens: params.maxTokens ?? 1000, // Provide a default value to avoid undefined
      top_p: params.topP ?? undefined,
      top_k: params.topK ?? undefined,
    });

    // Extract text safely from the content blocks
    let responseText = '';
    if (response.content && response.content.length > 0) {
      const contentBlock = response.content[0];
      // Check if it's a TextBlock (has 'text' property)
      if (contentBlock && typeof contentBlock === 'object' && 'text' in contentBlock) {
        responseText = contentBlock.text;
      }
    }

    return {
      text: responseText,
      model: params.model,
      usage: {
        promptTokens: response.usage?.input_tokens || 0,
        completionTokens: response.usage?.output_tokens || 0,
        totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
      },
      provider: 'anthropic',
    };
  } catch (error) {
    console.error('Anthropic API Error:', error);
    throw error;
  }
}

/**
 * Call xAI API
 */
export async function callXAI(params: OpenAIParams): Promise<AIResponse> {
  if (!xaiClient) {
    throw new Error('xAI client not initialized. Check your API key.');
  }

  try {
    const response = await xaiClient.chat.completions.create({
      model: params.model,
      messages: params.messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens,
      top_p: params.topP,
      frequency_penalty: params.frequencyPenalty,
      presence_penalty: params.presencePenalty,
    });

    return {
      text: response.choices[0]?.message?.content || '',
      model: params.model,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
      provider: 'xai',
    };
  } catch (error) {
    console.error('xAI API Error:', error);
    throw error;
  }
}

/**
 * Get available models
 */
export function getAvailableModels() {
  const models = {
    openai: openaiClient 
      ? ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'] 
      : [],
    anthropic: anthropicClient 
      ? ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'] 
      : [],
    xai: xaiClient
      ? ['grok-beta']
      : [],
  };
  
  return models;
}

/**
 * Check if AI services are available
 */
export function checkAIServicesAvailable() {
  return {
    openai: !!openaiClient,
    anthropic: !!anthropicClient,
    xai: !!xaiClient,
  };
}

/**
 * AI Service class for generating responses
 */
export class AIService {
  /**
   * Generate response using AI
   */
  async generateResponse({
    prompt,
    id,
    subscriptionTier = 'standard',
    useCase = 'general',
    maxTokens = 500,
    temperature = 0.7
  }: {
    prompt: string;
    id?: string;
    subscriptionTier?: 'standard' | 'premium' | 'enterprise';
    useCase?: string;
    maxTokens?: number;
    temperature?: number;
  }): Promise<{ content: string }> {
    try {
      // Determine which provider to use based on subscription tier
      const useAnthropic = subscriptionTier === 'enterprise' || subscriptionTier === 'premium';
      
      if (useAnthropic && anthropicClient) {
        // Use Anthropic for premium/enterprise tiers
        const model = subscriptionTier === 'enterprise'
          ? 'claude-3-opus-20240229'
          : 'claude-3-sonnet-20240229';
        
        const response = await callAnthropic({
          model,
          messages: [{ role: 'user', content: prompt }],
          maxTokens,
          temperature
        });
        
        return { content: response.text };
      } else if (xaiClient && useCase === 'research') {
        // Use xAI (Grok) for research tasks if available
        const response = await callXAI({
          model: 'grok-beta',
          messages: [{ role: 'user', content: prompt }],
          maxTokens,
          temperature
        });
        return { content: response.text };
      } else if (openaiClient) {
        // Fall back to OpenAI
        const model = subscriptionTier === 'premium'
          ? 'gpt-4o'
          : 'gpt-3.5-turbo';
        
        const response = await callOpenAI({
          model,
          messages: [{ role: 'user', content: prompt }],
          maxTokens,
          temperature
        });
        
        return { content: response.text };
      }
      
      // Fallback if no clients are available
      throw new Error('No AI service providers are available');
    } catch (error) {
      console.error('Error generating AI response:', error);
      return { content: 'Error generating response. Please try again later.' };
    }
  }
}

// Export singleton instance
export const aiService = new AIService();