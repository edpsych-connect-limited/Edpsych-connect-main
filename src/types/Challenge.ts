/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

// Challenge type definition
export interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  difficulty: string;
  category: string;
  completedAt?: string;
  isCompleted?: boolean;
}
