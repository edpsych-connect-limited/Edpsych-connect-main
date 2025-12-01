/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

// This is a central export file for the Gamification API
// All implementations should reference this file

import { GamificationImpl } from './gamificationImpl';
import { logger } from "@/lib/logger";

// Add the methods needed by AdvancedAnalyticsDashboard
const enhancedApi = {
  ...GamificationImpl,
  
  // Add methods referenced in components
  getChallenges: async () => {
    logger.info('Getting challenges');
    return [];
  },
  
  getAchievements: async () => {
    logger.info('Getting achievements');
    return [];
  }
};

// Export as the standard name used throughout the application
export const GamificationAPI = enhancedApi;
