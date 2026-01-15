
import os

path = 'src/lib/interventions/intervention-library.ts'
new_content = """/**
 * Evidence-Based Intervention Library
 * Task 3.3.1: Intervention Designer - Comprehensive Intervention Database
 *
 * Features:
 * - 100+ research-backed interventions
 * - 5 primary categories (Academic, Behavioral, Social-Emotional, Communication, Sensory)
 * - Age-appropriate filtering (Early Years, Primary, Secondary, Post-16)
 * - Setting-based filtering (Classroom, Small Group, 1:1, Home)
 * - Evidence level rating (Tier 1, Tier 2, Tier 3)
 * - Implementation complexity rating
 * - Resource requirements
 * - Expected timeframe for impact
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type InterventionCategory =
  | 'academic'
  | 'behavioural'
  | 'social_emotional'
  | 'communication'
  | 'sensory';

export type AgeRange = 'early_years' | 'primary' | 'secondary' | 'post_16' | 'all';

export type Setting = 'classroom' | 'small_group' | 'one_to_one' | 'home' | 'mixed';

export type EvidenceLevel = 'tier_1' | 'tier_2' | 'tier_3';

export type Complexity = 'low' | 'medium' | 'high';

export interface InterventionTemplate {
  id: string;
  name: string;
  category: InterventionCategory;
  subcategory: string;
  description: string;
  targeted_needs: string[];

  // Evidence & Research
  evidence_level: EvidenceLevel;
  research_sources: string[];
  effect_size?: number;
  success_rate?: string;

  // Implementation Details
  age_range: AgeRange[];
  setting: Setting[];
  duration: string;
  frequency: string;
  session_length: string;
  total_sessions?: number;

  // Practical Information
  complexity: Complexity;
  staff_training_required: boolean;
  resources_needed: string[];
  cost_implications: string;

  // Fidelity & Monitoring
  key_components: string[];
  fidelity_checklist: string[];
  progress_indicators: string[];
  expected_outcomes: string[];

  // Customization
  adaptations: string[];
  contraindications: string[];
  complementary_interventions: string[];

  // Documentation
  implementation_guide: string;
  parent_information: string;
  useful_links: string[];

  // Metadata
  created_at: string;
  updated_at: string;
  tags: string[];
}

import interventionsData from './interventions-data.json';

// ============================================================================
// DATA IMPORT & RECONSTRUCTION
// ============================================================================

// Cast JSON data to strict types
const ALL_DATA = interventionsData as unknown as InterventionTemplate[];

// Reconstruct category arrays for statistics
const ACADEMIC_INTERVENTIONS = ALL_DATA.filter(i => i.category === 'academic');
const BEHAVIORAL_INTERVENTIONS = ALL_DATA.filter(i => i.category === 'behavioural');
const SOCIAL_EMOTIONAL_INTERVENTIONS = ALL_DATA.filter(i => i.category === 'social_emotional');
const COMMUNICATION_INTERVENTIONS = ALL_DATA.filter(i => i.category === 'communication');
const SENSORY_INTERVENTIONS = ALL_DATA.filter(i => i.category === 'sensory');

// Export the full library
export const INTERVENTION_LIBRARY: InterventionTemplate[] = ALL_DATA;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get interventions by category
 */
export function getInterventionsByCategory(category: InterventionCategory): InterventionTemplate[] {
  return INTERVENTION_LIBRARY.filter((i) => i.category === category);
}

/**
 * Get interventions by age range
 */
export function getInterventionsByAge(ageRange: AgeRange): InterventionTemplate[] {
  return INTERVENTION_LIBRARY.filter((i) => i.age_range.includes(ageRange) || i.age_range.includes('all'));
}

/**
 * Get interventions by evidence level
 */
export function getInterventionsByEvidenceLevel(level: EvidenceLevel): InterventionTemplate[] {
  return INTERVENTION_LIBRARY.filter((i) => i.evidence_level === level);
}

/**
 * Search interventions by keyword
 */
export function searchInterventions(query: string): InterventionTemplate[] {
  const lowerQuery = query.toLowerCase();
  return INTERVENTION_LIBRARY.filter(
    (i) =>
      i.name.toLowerCase().includes(lowerQuery) ||
      i.description.toLowerCase().includes(lowerQuery) ||
      i.targeted_needs.some((need) => need.toLowerCase().includes(lowerQuery)) ||
      i.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get intervention by ID
 */
export function getInterventionById(id: string): InterventionTemplate | undefined {
  return INTERVENTION_LIBRARY.find((i) => i.id === id);
}

/**
 * Get recommended interventions based on needs
 */
export function getRecommendedInterventions(
  targetedNeeds: string[],
  ageRange?: AgeRange,
  setting?: Setting
): InterventionTemplate[] {
  return INTERVENTION_LIBRARY.filter((intervention) => {
    // Check if intervention addresses any of the targeted needs
    const needsMatch = targetedNeeds.some((need) =>
      intervention.targeted_needs.some((interventionNeed) =>
        interventionNeed.toLowerCase().includes(need.toLowerCase())
      )
    );

    // Check age range filter
    const ageMatch = ageRange
      ? intervention.age_range.includes(ageRange) || intervention.age_range.includes('all')
      : true;

    // Check setting filter
    const settingMatch = setting ? intervention.setting.includes(setting) || intervention.setting.includes('mixed') : true;

    return needsMatch && ageMatch && settingMatch;
  }).sort((a, b) => {
    // Sort by evidence level (tier_1 > tier_2 > tier_3)
    const evidenceOrder = { tier_1: 3, tier_2: 2, tier_3: 1 };
    return (evidenceOrder[b.evidence_level] || 0) - (evidenceOrder[a.evidence_level] || 0);
  });
}

// ============================================================================
// STATISTICS
// ============================================================================

export const INTERVENTION_STATS = {
  total: INTERVENTION_LIBRARY.length,
  by_category: {
    academic: ACADEMIC_INTERVENTIONS.length,
    behavioural: BEHAVIORAL_INTERVENTIONS.length,
    social_emotional: SOCIAL_EMOTIONAL_INTERVENTIONS.length,
    communication: COMMUNICATION_INTERVENTIONS.length,
    sensory: SENSORY_INTERVENTIONS.length,
  },
  by_evidence: {
    tier_1: INTERVENTION_LIBRARY.filter((i) => i.evidence_level === 'tier_1').length,
    tier_2: INTERVENTION_LIBRARY.filter((i) => i.evidence_level === 'tier_2').length,
    tier_3: INTERVENTION_LIBRARY.filter((i) => i.evidence_level === 'tier_3').length,
  },
};
"""

with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Overwrote {path}")
