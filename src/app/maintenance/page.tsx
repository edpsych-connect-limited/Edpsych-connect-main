/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Maintenance Page Route
 * Displays the enhanced coming soon/maintenance page
 */

import MaintenancePage from '@/components/landing/MaintenancePage';

export const metadata = {
  title: 'Coming Soon | EdPsych Connect',
  description: 'EdPsych Connect is building the future of educational psychology. Join the movement.',
};

export default function Page() {
  return <MaintenancePage />;
}
