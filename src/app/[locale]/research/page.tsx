/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 * 
 * Enhanced Research & Validation Hub
 * Features video explainers, interactive frameworks, publications, and data access.
 */

import EnhancedResearchHub from '@/components/research/EnhancedResearchHub';
import { getResearchStudies } from '@/app/actions/research';

export const metadata = {
  title: 'Research & Validation Hub | EdPsych Connect',
  description: 'Evidence-based educational psychology research. Explore peer-reviewed studies, validation frameworks, and ongoing research initiatives.',
};

export default async function ResearchPage() {
  const studies = await getResearchStudies();
  
  return <EnhancedResearchHub initialStudies={studies} />;
}