import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';
import EHCPSandbox from '@/components/demo/EHCPSandbox';

export const metadata = {
  title: 'EHCP Wizard Sandbox | EdPsych Connect',
  description: 'Experience our streamlined EHCP creation workflow.',
};

export default function EHCPSandboxPage() {
  return <EHCPSandbox />;
}
