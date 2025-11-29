import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';
import AssessmentSandboxWizard from '@/components/demo/AssessmentSandboxWizard';

export const metadata = {
  title: 'Assessment Sandbox | EdPsych Connect',
  description: 'Try the EdPsych Connect assessment workflow in a sandbox environment.',
};

export default function AssessmentDemoPage() {
  return <AssessmentSandboxWizard />;
}
