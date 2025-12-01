/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from "react";
import { FaStar } from "react-icons/fa";

export interface PointDisplayProps {
  points: number;
  size?: "sm" | "md" | "lg";
}

export const PointDisplay: React.FC<PointDisplayProps> = ({ points, size = "md" }) => {
  const fontSize = size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-lg";
  const iconSize = size === "sm" ? "text-xs" : size === "lg" ? "text-2xl" : "text-base";

  return (
    <div className="flex items-center gap-2">
      <FaStar className={`text-yellow-400 ${iconSize}`} />
      <span className={`font-bold ${fontSize} text-gray-700`}>
        {points}
      </span>
    </div>
  );
};
