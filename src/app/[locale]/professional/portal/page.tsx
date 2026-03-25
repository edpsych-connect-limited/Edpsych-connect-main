import React from 'react';
import ProfessionalContributionPortal from '@/components/ehcp/ProfessionalContributionPortal';

export const metadata = {
  title: 'Professional Portal | EdPsych Connect',
  description: 'Professional Contribution Portal - Submit EHCP contributions and manage assigned cases',
};

export default function ProfessionalPortalPage() {
  // Auth and role check handled by ProfessionalContributionPortal component
  return <ProfessionalContributionPortal />;
}
