import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';
import TrainingSandbox from '@/components/demo/TrainingSandbox';

export const metadata = {
  title: 'Training Platform Sandbox | EdPsych Connect',
  description: 'Experience our CPD accredited training platform.',
};

export default function TrainingSandboxPage() {
  return <TrainingSandbox />;
}
