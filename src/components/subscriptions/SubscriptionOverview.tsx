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

export interface SubscriptionOverviewProps {
  planName: string;
  seats: number;
  active: boolean;
  renewalDate: string;
}

export const SubscriptionOverview: React.FC<SubscriptionOverviewProps> = ({
  planName,
  seats,
  active,
  renewalDate,
}) => {
  return (
    <div className="p-6 border border-gray-200 rounded-md bg-white shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">
          {planName}
        </h3>
        <Chip
          label={active ? "Active" : "Inactive"}
          color={active ? "success" : "error"}
          size="small"
        />
      </div>
      <p className="text-sm text-gray-600 mb-2">
        Seats: {seats}
      </p>
      <p className="text-sm text-gray-600">
        Renewal Date: {renewalDate}
      </p>
    </div>
  );
};

export default SubscriptionOverview;