/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Maintenance Page Route
 * Displays the maintenance page
 */

import MaintenancePage from '@/components/landing/MaintenancePage';

export const metadata = {
  title: 'Maintenance | EdPsych Connect',
  description: 'EdPsych Connect is temporarily unavailable while we perform maintenance.',
};

export default function Page() {
  return <MaintenancePage />;
}
