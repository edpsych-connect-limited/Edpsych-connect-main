/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';
import EnterpriseHelpCenter from '@/components/help/EnterpriseHelpCenter';

export const metadata = {
  title: 'Help Centre | EdPsych Connect World',
  description: 'Enterprise-grade support centre with AI-powered assistance, comprehensive guides, video tutorials, and 24/7 help for EdPsych Connect World platform.',
  keywords: ['help', 'support', 'tutorials', 'guides', 'FAQ', 'EdPsych Connect', 'AI assistant'],
};

export default function HelpPage() {
  return <EnterpriseHelpCenter />;
}