/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from "react";

// Define the interface for achievement card props
export interface AchievementCardProps {
  id: string;
  title: string;
  description: string;
  icon?: string;
  rarity?: string;
  unlockedAt?: Date;
  isActive?: boolean;
}

// Simple achievement card component
export const SimpleAchievementCard: React.FC<AchievementCardProps> = ({
  id: _id,
  title,
  description,
  icon,
  rarity,
  unlockedAt,
  isActive = false,
}) => {
  const rarityColor = rarity === 'legendary' ? 'gold' :
                     rarity === 'epic' ? 'purple' :
                     rarity === 'rare' ? 'blue' : 'gray';

  return (
    <div
      className={`p-4 border rounded-lg shadow-sm transition-all duration-200 ${
        isActive ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon || 'TROPHY'}</span>
          <h3 className="font-bold text-lg text-gray-800">{title}</h3>
        </div>
        {rarity && (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              rarityColor === 'gold' ? 'bg-yellow-100 text-yellow-800' :
              rarityColor === 'purple' ? 'bg-purple-100 text-purple-800' :
              rarityColor === 'blue' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}
          >
            {rarity}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      {unlockedAt && (
        <p className="text-xs text-gray-500">
          Unlocked: {unlockedAt.toLocaleDateString()}
        </p>
      )}
    </div>
  );
};
