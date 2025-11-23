import React from 'react';
import IntegrationDashboard from '@/components/admin/integrations/IntegrationDashboard';

export const metadata = {
  title: 'Integrations | EdPsych Connect Admin',
  description: 'Manage ecosystem connections and data sync settings.',
};

export default function IntegrationsPage() {
  return <IntegrationDashboard />;
}
