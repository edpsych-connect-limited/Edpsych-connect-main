'use client'

import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;
import React from 'react';
import TutoringInterface from '@/components/ai-agents/TutoringInterface';

export default function AIAgentsPage() {
  return (
    <main className="p-6">
      <TutoringInterface />
    </main>
  );
}