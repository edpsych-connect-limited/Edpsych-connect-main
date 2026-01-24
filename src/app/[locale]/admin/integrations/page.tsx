/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';
import IntegrationDashboard from '@/components/admin/integrations/IntegrationDashboard';

export const metadata = {
  title: 'Integrations | EdPsych Connect Admin',
  description: 'Manage ecosystem connections and data sync settings.',
};

export default function IntegrationsPage() {
  return <IntegrationDashboard />;
}
