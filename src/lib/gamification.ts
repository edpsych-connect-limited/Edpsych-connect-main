/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

// PHASE 1: Clean implementation with all old problematic code removed

// Define component types locally to avoid missing import errors
export interface AchievementCardProps {
  id: string;
  title: string;
  description: string;
  icon?: string;
  rarity?: string;
  unlockedAt?: Date;
  isActive?: boolean;
}

export interface ChallengeCardProps {
  id: string;
  title: string;
  description: string;
  type?: string;
  difficulty?: string;
  points?: number;
  completed?: boolean;
  deadline?: Date;
}

export interface LeaderboardEntryProps {
  id: string;
  username: string;
  score: number;
  level: number;
  institution?: string;
  rank: number;
  avatar?: string;
}

import { aiService } from "./ai-integration";
import { logger } from "@/lib/logger";

// Use environment variable with fallback
const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/gamification`
  : "/api/gamification";

// Timeout for fetch requests (5 seconds)
const FETCH_TIMEOUT = 5000;

// Enhanced error handling with retry logic
async function handleResponse(res: Response, endpoint: string) {
  if (!res.ok) {
    const error = await res.text();
    logger.error(`Gamification API request failed: ${endpoint}`, {
      status: res.status,
      statusText: res.statusText,
      error
    });
    throw new Error(error || `Gamification API request failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// Add timeout to fetch requests
const fetchWithTimeout = async (url: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const { signal } = controller;

  const timeout = setTimeout(() => {
    controller.abort();
  }, FETCH_TIMEOUT);

  try {
    const response = await fetch(url, { ...options, signal });
    clearTimeout(timeout);
    return response;
  } catch (_error) {
    clearTimeout(timeout);
    throw _error;
  }
};

// Maximum number of retry attempts for API calls
const MAX_RETRIES = 2;

// Retry function with exponential backoff
const retryFetch = async <T>(
  endpoint: string,
  fetchFn: () => Promise<Response>
): Promise<T> => {
  let lastError;
  let retries = 0;

  while (retries <= MAX_RETRIES) {
    try {
      const res = await fetchFn();
      return await handleResponse(res, endpoint);
    } catch (_error) {
      lastError = _error;
      retries++;

      if (retries <= MAX_RETRIES) {
        const delay = Math.pow(2, retries - 1) * 1000;
        logger.warn(`Retrying ${endpoint} (attempt ${retries}/${MAX_RETRIES}) after ${delay}ms`, { _error });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

// PHASE 1: New implementation with completely different name
export const GamificationSystem = {
  async getChallenges(): Promise<ChallengeCardProps[]> {
    const endpoint = `${API_BASE}/challenges`;
    try {
      return await retryFetch<ChallengeCardProps[]>(
        endpoint,
        () => fetchWithTimeout(endpoint, { credentials: "include" })
      );
    } catch (_error) {
      logger.warn("Falling back to AI-generated challenges", { _error });
      const response = await aiService.processRequest({
        prompt: "Generate 3 personalized gamification challenges for educational psychology learners.",
        id: "system",
        subscriptionTier: "standard",
        useCase: "gamification"
      });
      try {
        const parsed = JSON.parse(response.response);
        if (Array.isArray(parsed)) {
          return parsed as ChallengeCardProps[];
        }
        throw new Error("AI response invalid for challenges");
      } catch {
        throw new Error("Unable to load challenges from API or AI.");
      }
    }
  },

  async getAchievements(): Promise<AchievementCardProps[]> {
    const endpoint = `${API_BASE}/achievements`;
    try {
      return await retryFetch<AchievementCardProps[]>(
        endpoint,
        () => fetchWithTimeout(endpoint, { credentials: "include" })
      );
    } catch (_error) {
      logger.warn("Falling back to AI-generated achievements", { _error });
      const response = await aiService.processRequest({
        prompt: "Generate 3 educational gamification achievements with title, description, icon, and rarity.",
        id: "system",
        subscriptionTier: "standard",
        useCase: "gamification"
      });
      try {
        return JSON.parse(response.response) as AchievementCardProps[];
      } catch {
        throw new Error("Unable to load achievements from API or AI.");
      }
    }
  },

  async getLeaderboard(): Promise<LeaderboardEntryProps[]> {
    const endpoint = `${API_BASE}/leaderboard`;
    try {
      return await retryFetch<LeaderboardEntryProps[]>(
        endpoint,
        () => fetchWithTimeout(endpoint, { credentials: "include" })
      );
    } catch (_error) {
      logger.warn("Falling back to AI-generated leaderboard", { _error });
      const response = await aiService.processRequest({
        prompt: "Generate a leaderboard with 5 fictional educational psychology learners including id, username, score, level, institution, and rank.",
        id: "system",
        subscriptionTier: "standard",
        useCase: "gamification"
      });
      try {
        return JSON.parse(response.response) as LeaderboardEntryProps[];
      } catch {
        throw new Error("Unable to load leaderboard from API or AI.");
      }
    }
  },

  async completeChallenge(id: string): Promise<void> {
    const endpoint = `${API_BASE}/challenges/${id}/complete`;
    try {
      await retryFetch<void>(
        endpoint,
        () => fetchWithTimeout(endpoint, {
          method: "POST",
          credentials: "include",
          headers: {
            'Content-Type': 'application/json',
          }
        })
      );
    } catch (_error) {
      logger._error(`Failed to complete challenge ${id}`, { _error });
      throw new Error("Unable to complete challenge. Please try again later.");
    }
  },

  async checkHealth(): Promise<boolean> {
    const endpoint = `${API_BASE}/health`;
    try {
      const res = await fetchWithTimeout(endpoint, {
        method: "GET",
        credentials: "include"
      });
      return res.ok;
    } catch (_error) {
      logger._error("Gamification API health check failed", { _error });
      return false;
    }
  }
};

// Export for backward compatibility
export const GamificationAPI = GamificationSystem;