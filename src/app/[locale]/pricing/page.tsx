/**
 * Pricing Page - Enterprise-Grade with Video Integration
 * 
 * Features:
 * - Hero video explaining platform value
 * - Tier-specific explainer videos
 * - Add-on feature videos
 * - Feature deep-dive videos
 * - Trust & comparison videos
 * - Role-specific pricing for all user types
 * 
 * Video Integration (December 2025):
 * - 39 professionally produced HeyGen videos
 * - UK professional avatar (Adrian) with Oliver Bennett voice
 * - Serves as "sales team" - zero-touch self-service
 */

import PricingPage from '@/components/pricing/PricingPage';

// Force dynamic rendering for auth-required pages
export const dynamic = 'force-dynamic';

export default function Page() {
  return <PricingPage />;
}
