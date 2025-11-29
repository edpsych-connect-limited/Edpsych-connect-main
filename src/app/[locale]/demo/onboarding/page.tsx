import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';
import OnboardingSandbox from '@/components/demo/OnboardingSandbox';

export const metadata = {
  title: 'Zero-Touch Onboarding | EdPsych Connect',
  description: 'AI-Powered Forensic Audit Demo',
};

export default function OnboardingPage() {
  return <OnboardingSandbox />;
}
