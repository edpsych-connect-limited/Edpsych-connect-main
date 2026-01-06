/**
 * Intervention Recommendation Engine
 * Task 3.3.2: AI-Powered Recommendations (Backend Only - Never Exposed to UI)
 *
 * Features:
 * - Intelligent matching of interventions to student needs
 * - Assessment data analysis
 * - Evidence-based ranking
 * - Contextual factors consideration
 * - Confidence scoring
 * - Multi-dimensional matching
 *
 * IMPORTANT: This module uses sophisticated algorithms. The UI displays results as
 * "Evidence-Based Recommendations" or "Suggested Interventions" - NEVER mentioning
 * AI, machine learning, or algorithmic selection.
 */

import {
  INTERVENTION_LIBRARY,
  InterventionTemplate,
  InterventionCategory as _InterventionCategory,
  AgeRange,
  Setting,
  EvidenceLevel,
  getRecommendedInterventions as _getRecommendedInterventions,
} from './intervention-library';

// ============================================================================
// TYPES
// ============================================================================

export interface StudentProfile {
  student_id: string;
  age: number;
  year_group: string;

  // Academic profile
  reading_level?: string;
  maths_level?: string;
  writing_level?: string;

  // Identified needs
  primary_sen_category?: string;
  secondary_sen_categories?: string[];
  specific_difficulties?: string[];

  // Settings & context
  current_setting: 'mainstream' | 'special' | 'resourced' | 'alternative';
  available_settings_for_intervention: Setting[];

  // Support history
  previous_interventions?: string[];
  effective_strategies?: string[];
  ineffective_strategies?: string[];

  // Preferences & strengths
  interests?: string[];
  learning_strengths?: string[];
  motivators?: string[];
}

export interface AssessmentData {
  assessment_id: string;
  assessment_type: string;
  date: string;

  // Cognitive profile
  cognitive_scores?: {
    verbal_comprehension?: number;
    perceptual_reasoning?: number;
    working_memory?: number;
    processing_speed?: number;
    full_scale_iq?: number;
  };

  // Academic scores
  reading_scores?: {
    decoding?: number;
    fluency?: number;
    comprehension?: number;
  };

  maths_scores?: {
    calculation?: number;
    reasoning?: number;
  };

  writing_scores?: {
    spelling?: number;
    composition?: number;
  };

  // Behavioral/social-emotional
  behavioral_observations?: {
    attention_concerns?: boolean;
    hyperactivity?: boolean;
    impulsivity?: boolean;
    anxiety?: number; // 0-10 scale
    social_skills_deficit?: boolean;
  };

  // Key findings
  strengths_identified?: string[];
  weaknesses_identified?: string[];
  diagnostic_impressions?: string[];
}

export interface RecommendationRequest {
  student_profile: StudentProfile;
  assessment_data?: AssessmentData;
  target_areas: string[]; // e.g., ['reading_comprehension', 'math_calculation', 'attention']
  priority_level: 'high' | 'medium' | 'low';
  resource_constraints?: {
    max_cost?: number;
    training_available?: boolean;
    specialist_support_available?: boolean;
  };
}

export interface InterventionRecommendation {
  intervention: InterventionTemplate;
  confidence_score: number; // 0-100
  match_reasons: string[];
  implementation_considerations: string[];
  expected_timeline: string;
  resource_requirements: string[];
  compatibility_with_other_recommendations: string[];
}

export interface RecommendationResponse {
  recommendations: InterventionRecommendation[];
  rationale: string;
  implementation_order: string[];
  monitoring_plan: string;
  review_timeline: string;
}

// ============================================================================
// CORE RECOMMENDATION ENGINE
// ============================================================================

/**
 * Generate intervention recommendations based on student profile and assessment
 * This is the main "AI" function - sophisticated matching algorithm
 */
export function generateRecommendations(
  request: RecommendationRequest
): RecommendationResponse {
  // Step 1: Filter interventions by relevance
  const relevantInterventions = filterByRelevance(request);

  // Step 2: Score each intervention
  const scoredRecommendations = scoreInterventions(relevantInterventions, request);

  // Step 3: Rank and select top recommendations
  const topRecommendations = rankRecommendations(scoredRecommendations, 5);

  // Step 4: Generate rationale and implementation guidance
  const rationale = generateRationale(request, topRecommendations);
  const implementation_order = determineImplementationOrder(topRecommendations);
  const monitoring_plan = generateMonitoringPlan(topRecommendations);
  const review_timeline = calculateReviewTimeline(topRecommendations);

  return {
    recommendations: topRecommendations,
    rationale,
    implementation_order,
    monitoring_plan,
    review_timeline,
  };
}

// ============================================================================
// FILTERING & MATCHING
// ============================================================================

/**
 * Filter interventions by basic relevance criteria
 */
function filterByRelevance(request: RecommendationRequest): InterventionTemplate[] {
  const { student_profile, target_areas } = request;

  // Determine age range
  const ageRange: AgeRange = getAgeRange(student_profile.age);

  // Start with all interventions
  let relevant = [...INTERVENTION_LIBRARY];

  // Filter by age appropriateness
  relevant = relevant.filter(
    (i) => i.age_range.includes(ageRange) || i.age_range.includes('all')
  );

  // Filter by setting availability
  if (student_profile.available_settings_for_intervention.length > 0) {
    relevant = relevant.filter((i) =>
      i.setting.some(
        (s) =>
          student_profile.available_settings_for_intervention.includes(s) ||
          s === 'mixed'
      )
    );
  }

  // Filter by target areas (map to needs)
  const targetNeeds = mapTargetAreasToNeeds(target_areas);
  relevant = relevant.filter((i) =>
    i.targeted_needs.some((need) =>
      targetNeeds.some((target) => need.toLowerCase().includes(target.toLowerCase()))
    )
  );

  // Exclude previously ineffective interventions
  if (student_profile.ineffective_strategies) {
    relevant = relevant.filter(
      (i) =>
        !student_profile.ineffective_strategies!.some((ineffective) =>
          i.name.toLowerCase().includes(ineffective.toLowerCase())
        )
    );
  }

  // Resource constraints
  if (request.resource_constraints) {
    const constraints = request.resource_constraints;

    // Filter by training requirements
    if (constraints.training_available === false) {
      relevant = relevant.filter((i) => !i.staff_training_required);
    }

    // Filter by complexity (if no specialist support)
    if (constraints.specialist_support_available === false) {
      relevant = relevant.filter((i) => i.complexity !== 'high');
    }
  }

  return relevant;
}

/**
 * Score each intervention based on multiple factors
 */
function scoreInterventions(
  interventions: InterventionTemplate[],
  request: RecommendationRequest
): InterventionRecommendation[] {
  return interventions.map((intervention) => {
    let confidenceScore = 0;
    const matchReasons: string[] = [];
    const implementationConsiderations: string[] = [];

    // Evidence level scoring (max 30 points)
    const evidenceScore = scoreEvidence(intervention.evidence_level);
    confidenceScore += evidenceScore;
    if (evidenceScore >= 25) {
      matchReasons.push(
        `Strong research evidence (${intervention.evidence_level.replace('_', ' ').toUpperCase()}) with effect size of ${intervention.effect_size || 'significant'}`
      );
    }

    // Need alignment scoring (max 30 points)
    const needScore = scoreNeedAlignment(
      intervention,
      request.target_areas,
      request.student_profile,
      request.assessment_data
    );
    confidenceScore += needScore;

    // Context appropriateness (max 20 points)
    const contextScore = scoreContext(intervention, request.student_profile);
    confidenceScore += contextScore;

    // Student-specific factors (max 20 points)
    const studentScore = scoreStudentFactors(
      intervention,
      request.student_profile,
      request.assessment_data
    );
    confidenceScore += studentScore;

    // Add match reasons based on student profile
    addStudentMatchReasons(intervention, request, matchReasons);

    // Add implementation considerations
    addImplementationConsiderations(intervention, request, implementationConsiderations);

    // Resource requirements
    const resourceRequirements = extractResourceRequirements(intervention);

    // Expected timeline
    const expectedTimeline = intervention.duration;

    // Compatibility notes
    const compatibility = analyzeCompatibility(intervention, interventions);

    return {
      intervention,
      confidence_score: Math.min(100, Math.round(confidenceScore)),
      match_reasons: matchReasons,
      implementation_considerations: implementationConsiderations,
      expected_timeline: expectedTimeline,
      resource_requirements: resourceRequirements,
      compatibility_with_other_recommendations: compatibility,
    };
  });
}

/**
 * Rank recommendations and select top N
 */
function rankRecommendations(
  recommendations: InterventionRecommendation[],
  topN: number
): InterventionRecommendation[] {
  return recommendations
    .sort((a, b) => b.confidence_score - a.confidence_score)
    .slice(0, topN);
}

// ============================================================================
// SCORING FUNCTIONS
// ============================================================================

/**
 * Score based on evidence level
 */
function scoreEvidence(evidenceLevel: EvidenceLevel): number {
  const scores = {
    tier_1: 30,
    tier_2: 20,
    tier_3: 10,
  };
  return scores[evidenceLevel] || 10;
}

/**
 * Score alignment with targeted needs
 */
function scoreNeedAlignment(
  intervention: InterventionTemplate,
  targetAreas: string[],
  studentProfile: StudentProfile,
  assessmentData?: AssessmentData
): number {
  let score = 0;

  // Direct target area match
  const needsKeywords = mapTargetAreasToNeeds(targetAreas);
  const directMatches = intervention.targeted_needs.filter((need) =>
    needsKeywords.some((keyword) => need.toLowerCase().includes(keyword.toLowerCase()))
  );

  score += directMatches.length * 10; // 10 points per direct match

  // Assessment data alignment
  if (assessmentData) {
    // Check if intervention addresses identified weaknesses
    const weaknessMatch = assessmentData.weaknesses_identified?.some((weakness) =>
      intervention.targeted_needs.some((need) =>
        need.toLowerCase().includes(weakness.toLowerCase())
      )
    );
    if (weaknessMatch) score += 5;

    // Check diagnostic impressions
    const diagnosticMatch = assessmentData.diagnostic_impressions?.some((diagnosis) =>
      intervention.targeted_needs.some((need) =>
        need.toLowerCase().includes(diagnosis.toLowerCase())
      )
    );
    if (diagnosticMatch) score += 5;
  }

  // SEN category alignment
  if (studentProfile.primary_sen_category) {
    const senMatch = intervention.targeted_needs.some((need) =>
      need.toLowerCase().includes(studentProfile.primary_sen_category!.toLowerCase())
    );
    if (senMatch) score += 5;
  }

  return Math.min(30, score);
}

/**
 * Score based on contextual appropriateness
 */
function scoreContext(
  intervention: InterventionTemplate,
  studentProfile: StudentProfile
): number {
  let score = 20; // Start with max

  // Complexity consideration
  if (intervention.complexity === 'high' && studentProfile.current_setting === 'mainstream') {
    score -= 5; // Reduce score if high complexity in mainstream
  }

  // Setting appropriateness
  const settingMatch = intervention.setting.some((s) =>
    studentProfile.available_settings_for_intervention.includes(s)
  );
  if (!settingMatch && !intervention.setting.includes('mixed')) {
    score -= 10;
  }

  // Previous success with similar interventions
  if (studentProfile.effective_strategies) {
    const similarApproach = studentProfile.effective_strategies.some((effective) =>
      intervention.tags.some((tag) => effective.toLowerCase().includes(tag.toLowerCase()))
    );
    if (similarApproach) score += 5;
  }

  return Math.max(0, score);
}

/**
 * Score based on student-specific factors
 */
function scoreStudentFactors(
  intervention: InterventionTemplate,
  studentProfile: StudentProfile,
  assessmentData?: AssessmentData
): number {
  let score = 0;

  // Motivation & interests alignment
  if (studentProfile.interests) {
    // Check if intervention can incorporate interests
    const interestKeywords = ['high-interest', 'choice', 'student-led', 'engaging'];
    const engagementFriendly = interestKeywords.some((keyword) =>
      intervention.implementation_guide.toLowerCase().includes(keyword)
    );
    if (engagementFriendly) score += 5;
  }

  // Learning strengths alignment
  if (studentProfile.learning_strengths) {
    const strengths = studentProfile.learning_strengths;

    // Visual learners
    if (strengths.includes('visual') && intervention.adaptations.some((a) => a.toLowerCase().includes('visual'))) {
      score += 5;
    }

    // Hands-on learners
    if (strengths.includes('kinaesthetic') && intervention.key_components.some((c) => c.toLowerCase().includes('manipulative') || c.toLowerCase().includes('physical'))) {
      score += 5;
    }
  }

  // Cognitive profile considerations
  if (assessmentData?.cognitive_scores) {
    const { working_memory, processing_speed } = assessmentData.cognitive_scores;

    // If working memory low, prefer interventions with visual supports
    if (working_memory && working_memory < 85) {
      if (intervention.adaptations.some((a) => a.toLowerCase().includes('visual') || a.toLowerCase().includes('graphic organizer'))) {
        score += 5;
      }
    }

    // If processing speed low, prefer interventions that allow extended time
    if (processing_speed && processing_speed < 85) {
      if (intervention.adaptations.some((a) => a.toLowerCase().includes('time') || a.toLowerCase().includes('pace'))) {
        score += 5;
      }
    }
  }

  return Math.min(20, score);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Determine age range from age
 */
function getAgeRange(age: number): AgeRange {
  if (age <= 5) return 'early_years';
  if (age <= 11) return 'primary';
  if (age <= 16) return 'secondary';
  return 'post_16';
}

/**
 * Map target areas to intervention needs keywords
 */
function mapTargetAreasToNeeds(targetAreas: string[]): string[] {
  const mapping: Record<string, string[]> = {
    reading_decoding: ['reading', 'phonics', 'decoding', 'dyslexia'],
    reading_fluency: ['fluency', 'reading speed', 'dyslexia'],
    reading_comprehension: ['comprehension', 'understanding'],
    writing: ['writing', 'dysgraphia', 'composition', 'spelling'],
    maths: ['math', 'dyscalculia', 'numeracy', 'calculation'],
    attention: ['attention', 'ADHD', 'focus', 'concentration'],
    behavior: ['behavior', 'conduct', 'non-compliance', 'aggression'],
    social_skills: ['social skills', 'friendship', 'peer relationships', 'autism'],
    emotional_regulation: ['emotional', 'anxiety', 'self-regulation', 'anger'],
    communication: ['communication', 'language', 'speech', 'AAC'],
    sensory: ['sensory', 'sensory processing', 'autism'],
    executive_function: ['executive', 'organization', 'planning', 'working memory'],
  };

  const needs: string[] = [];
  targetAreas.forEach((area) => {
    if (mapping[area]) {
      needs.push(...mapping[area]);
    } else {
      needs.push(area); // Use as-is if no mapping
    }
  });

  return needs;
}

/**
 * Add match reasons based on student profile
 */
function addStudentMatchReasons(
  intervention: InterventionTemplate,
  request: RecommendationRequest,
  matchReasons: string[]
): void {
  const { student_profile, assessment_data } = request;

  // Age appropriateness
  const ageRange = getAgeRange(student_profile.age);
  matchReasons.push(`Age-appropriate for ${ageRange.replace('_', ' ')} students`);

  // Setting match
  if (intervention.setting.includes('classroom')) {
    matchReasons.push('Can be delivered in classroom setting');
  } else if (intervention.setting.includes('small_group')) {
    matchReasons.push('Small group format for intensive support');
  } else if (intervention.setting.includes('one_to_one')) {
    matchReasons.push('Individualised 1:1 support format');
  }

  // Complexity
  if (intervention.complexity === 'low') {
    matchReasons.push('Easy to implement with minimal training required');
  }

  // Assessment alignment
  if (assessment_data) {
    if (assessment_data.weaknesses_identified) {
      const matchingWeakness = assessment_data.weaknesses_identified.find((w) =>
        intervention.targeted_needs.some((need) => need.toLowerCase().includes(w.toLowerCase()))
      );
      if (matchingWeakness) {
        matchReasons.push(`Directly addresses identified weakness: ${matchingWeakness}`);
      }
    }
  }

  // Success rate
  if (intervention.success_rate) {
    matchReasons.push(`${intervention.success_rate} success rate reported in research`);
  }
}

/**
 * Add implementation considerations
 */
function addImplementationConsiderations(
  intervention: InterventionTemplate,
  request: RecommendationRequest,
  considerations: string[]
): void {
  // Training requirements
  if (intervention.staff_training_required) {
    considerations.push(`Staff training required before implementation`);
  } else {
    considerations.push(`No specialized training required`);
  }

  // Time commitment
  considerations.push(
    `Time commitment: ${intervention.frequency}, ${intervention.session_length} per session for ${intervention.duration}`
  );

  // Resource needs
  if (intervention.cost_implications.toLowerCase().includes('minimal') || intervention.cost_implications.toLowerCase().includes('£0-')) {
    considerations.push(`Low cost implementation: ${intervention.cost_implications}`);
  } else {
    considerations.push(`Resource requirements: ${intervention.cost_implications}`);
  }

  // Complexity warning
  if (intervention.complexity === 'high') {
    considerations.push(
      `High complexity intervention - may require specialist support or supervision`
    );
  }

  // Parent involvement
  if (intervention.parent_information.length > 100) {
    considerations.push(`Parent involvement recommended for generalization`);
  }

  // Assessment data considerations
  if (request.assessment_data?.cognitive_scores) {
    const { working_memory, processing_speed } = request.assessment_data.cognitive_scores;

    if (working_memory && working_memory < 85 && intervention.key_components.some(c => c.includes('memory'))) {
      considerations.push(
        `Student has low working memory (${working_memory}) - provide additional visual supports and reduce verbal instructions`
      );
    }

    if (processing_speed && processing_speed < 85) {
      considerations.push(
        `Student has low processing speed (${processing_speed}) - allow extended time and reduce time pressure`
      );
    }
  }
}

/**
 * Extract resource requirements
 */
function extractResourceRequirements(intervention: InterventionTemplate): string[] {
  const requirements: string[] = [];

  // Staff
  if (intervention.staff_training_required) {
    requirements.push('Trained staff member');
  }

  // Materials
  if (intervention.resources_needed.length > 0) {
    requirements.push(...intervention.resources_needed.slice(0, 3)); // Top 3
  }

  // Time
  requirements.push(`${intervention.frequency} for ${intervention.duration}`);

  // Setting
  if (intervention.setting.includes('one_to_one')) {
    requirements.push('Quiet space for 1:1 work');
  } else if (intervention.setting.includes('small_group')) {
    requirements.push('Small group teaching space');
  }

  return requirements;
}

/**
 * Analyze compatibility with other interventions
 */
function analyzeCompatibility(
  intervention: InterventionTemplate,
  allInterventions: InterventionTemplate[]
): string[] {
  const compatibility: string[] = [];

  // Check complementary interventions
  if (intervention.complementary_interventions.length > 0) {
    const complementaryIds = intervention.complementary_interventions;
    complementaryIds.forEach((comp) => {
      const match = allInterventions.find((i) =>
        i.name.toLowerCase().includes(comp.toLowerCase()) ||
        i.subcategory.toLowerCase().includes(comp.toLowerCase())
      );
      if (match) {
        compatibility.push(`Works well alongside: ${match.name}`);
      } else {
        compatibility.push(`Consider also implementing: ${comp}`);
      }
    });
  }

  // Category-specific compatibility
  if (intervention.category === 'academic' && intervention.subcategory === 'reading_decoding') {
    compatibility.push('Can be combined with reading fluency and comprehension interventions');
  }

  if (intervention.category === 'behavioural') {
    compatibility.push('Should be implemented alongside any academic interventions');
  }

  return compatibility.length > 0 ? compatibility : ['Can be implemented independently'];
}

// ============================================================================
// RATIONALE & GUIDANCE GENERATION
// ============================================================================

/**
 * Generate overall rationale for recommendations
 */
function generateRationale(
  request: RecommendationRequest,
  recommendations: InterventionRecommendation[]
): string {
  const { student_profile, assessment_data, target_areas, priority_level: _priority_level } = request;

  let rationale = '';

  // Student context
  rationale += `Based on the student profile (${getAgeRange(student_profile.age).replace('_', ' ')}, Year ${student_profile.year_group}), `;

  // Assessment findings
  if (assessment_data?.weaknesses_identified && assessment_data.weaknesses_identified.length > 0) {
    rationale += `assessment findings identifying weaknesses in ${assessment_data.weaknesses_identified.join(', ')}, `;
  }

  // Target areas
  rationale += `and focus on addressing ${target_areas.join(', ')}, `;

  // Recommendation approach
  rationale += `the following evidence-based interventions are recommended. `;

  // Evidence emphasis
  const tier1Count = recommendations.filter((r) => r.intervention.evidence_level === 'tier_1').length;
  if (tier1Count > 0) {
    rationale += `${tier1Count} of these interventions have strong research evidence (Tier 1), with proven effectiveness. `;
  }

  // Implementation note
  rationale += `These interventions are sequenced to build foundational skills first, with complementary approaches that can be implemented concurrently. `;

  // Monitoring emphasis
  rationale += `Progress monitoring is essential to determine effectiveness and make data-driven adjustments.`;

  return rationale;
}

/**
 * Determine implementation order
 */
function determineImplementationOrder(
  recommendations: InterventionRecommendation[]
): string[] {
  const order: string[] = [];

  // Sort by priority: foundational skills first, then higher-level skills
  const sorted = [...recommendations].sort((a, b) => {
    // Academic foundational (phonics, number sense) before higher-level
    if (
      a.intervention.category === 'academic' &&
      (a.intervention.subcategory === 'reading_decoding' || a.intervention.subcategory === 'mathematics')
    ) {
      return -1;
    }

    // Behavioral/regulation before academic (can't learn if not regulated)
    if (a.intervention.category === 'behavioural' || a.intervention.category === 'sensory') {
      return -1;
    }

    // Otherwise maintain confidence score order
    return b.confidence_score - a.confidence_score;
  });

  sorted.forEach((rec, index) => {
    const position = index + 1;
    let orderString = `${position}. ${rec.intervention.name}`;

    if (position === 1) {
      orderString += ' - Start here: addresses foundational skills';
    } else if (rec.intervention.complementary_interventions.some((comp) =>
      recommendations.some((r) => r.intervention.name.toLowerCase().includes(comp.toLowerCase()))
    )) {
      orderString += ' - Implement concurrently with other recommendations';
    } else {
      orderString += ' - Begin after initial data from earlier interventions';
    }

    order.push(orderString);
  });

  return order;
}

/**
 * Generate monitoring plan
 */
function generateMonitoringPlan(recommendations: InterventionRecommendation[]): string {
  let plan = 'Progress Monitoring Plan:\n\n';

  recommendations.forEach((rec, index) => {
    plan += `${index + 1}. ${rec.intervention.name}:\n`;
    plan += `   - Monitor: ${rec.intervention.progress_indicators.slice(0, 3).join(', ')}\n`;
    plan += `   - Frequency: Weekly data collection\n`;
    plan += `   - Review: Formal review after ${rec.intervention.duration.split(' ')[0]} weeks\n`;
    plan += `   - Decision point: If insufficient progress after 6 weeks, consider modifications or alternative interventions\n\n`;
  });

  plan += 'General Monitoring Principles:\n';
  plan += '- Collect baseline data before starting interventions\n';
  plan += '- Use consistent measurement tools\n';
  plan += '- Graph data to visualize trends\n';
  plan += '- Team review meetings every 6 weeks\n';
  plan += '- Involve student in progress review\n';
  plan += '- Communicate regularly with parents';

  return plan;
}

/**
 * Calculate review timeline
 */
function calculateReviewTimeline(recommendations: InterventionRecommendation[]): string {
  // Extract weeks from duration strings
  const durations = recommendations.map((rec) => {
    const match = rec.intervention.duration.match(/(\d+)-?(\d+)?/);
    if (match) {
      return parseInt(match[1]); // Take lower bound
    }
    return 8; // Default
  });

  const shortestDuration = Math.min(...durations);
  const longestDuration = Math.max(...durations);

  let timeline = 'Review Timeline:\n\n';
  timeline += `- Initial review: After ${Math.ceil(shortestDuration / 2)} weeks (mid-point of shortest intervention)\n`;
  timeline += `- Comprehensive review: After ${shortestDuration} weeks (completion of initial interventions)\n`;
  timeline += `- Final review: After ${longestDuration} weeks (completion of all interventions)\n`;
  timeline += `- If progress insufficient: Consider intensifying, modifying, or changing approach\n`;
  timeline += `- If progress strong: Consider fading support and monitoring maintenance`;

  return timeline;
}

// ============================================================================
// EXPORT CONVENIENCE FUNCTION
// ============================================================================

/**
 * Simplified recommendation function for common use case
 */
export function getInterventionRecommendations(
  studentAge: number,
  targetNeeds: string[],
  availableSettings: Setting[] = ['classroom', 'small_group'],
  assessmentWeaknesses?: string[]
): InterventionRecommendation[] {
  const request: RecommendationRequest = {
    student_profile: {
      student_id: 'unknown',
      age: studentAge,
      year_group: 'unknown',
      current_setting: 'mainstream',
      available_settings_for_intervention: availableSettings,
    },
    target_areas: targetNeeds,
    priority_level: 'high',
  };

  if (assessmentWeaknesses) {
    request.assessment_data = {
      assessment_id: 'unknown',
      assessment_type: 'unknown',
      date: new Date().toISOString(),
      weaknesses_identified: assessmentWeaknesses,
    };
  }

  const response = generateRecommendations(request);
  return response.recommendations;
}
