import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';
import GoldenThreadDashboard from '@/components/demo/GoldenThreadDashboard';

export const metadata = {
  title: 'Autonomous Educational Intelligence | EdPsych Connect',
  description: 'The Golden Thread: From Audit to Intervention',
};

export default function GoldenThreadPage() {
  return <GoldenThreadDashboard />;
}
