import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from "react";
import { Chip } from "@mui/material";

export interface AchievementCardProps {
  title: string;
  description: string;
  points: number;
  achieved: boolean;
}

const SimplePointDisplay: React.FC<{points: number, size?: "sm" | "md" | "lg"}> = ({
  points,
  size = "md"
}) => {
  const fontSize = size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-lg";
  
  return (
    <div className="flex items-center gap-2">
      <span className={`${fontSize}`}>⭐</span>
      <span className={`font-bold ${fontSize} text-gray-700`}>
        {points}
      </span>
    </div>
  );
};

export const AchievementCard: React.FC<AchievementCardProps> = ({
  title,
  description,
  points,
  achieved,
}) => {
  return (
    <div
      className={`p-4 rounded-md border transition-all ${
        achieved
          ? "border-green-400 bg-green-50 shadow-md"
          : "border-gray-200 bg-white shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏆</span>
          <h4 className="font-bold text-lg text-gray-800">
            {title}
          </h4>
        </div>
        {achieved && <Chip label="Achieved" color="success" size="small" />}
      </div>
      <p className="text-sm text-gray-600 mb-3">
        {description}
      </p>
      <SimplePointDisplay points={points} size="sm" />
    </div>
  );
};

// For components that might be explicitly importing SimpleAchievementCard
export const SimpleAchievementCard = AchievementCard;