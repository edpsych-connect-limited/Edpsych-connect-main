import { 
  INTERVENTION_LIBRARY, 
  InterventionTemplate, 
  InterventionCategory, 
  EvidenceLevel 
} from '../interventions/intervention-library';

// ============================================================================
// ENTERPRISE TYPES & INTERFACES
// ============================================================================

export type NeedSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface StudentProfile {
  id: string;
  age_years: number;
  presenting_needs: string[];
  severity: NeedSeverity;
  setting?: 'classroom' | 'home' | '1:1';
  diagnosis_tags?: string[]; // e.g., 'adhd', 'dyslexia'
}

export interface MatchFactor {
  factor: string; // e.g., "Keyword Match", "Severity Alignment"
  weight: number; // 0.0 to 1.0
  description: string;
}

export interface RecommendationResult {
  intervention: InterventionTemplate;
  confidence_score: number; // 0 to 100
  match_factors: MatchFactor[];
  suitability_reasoning: string;
  routing_action: 'recommend' | 'consult_specialist' | 'emergency_review';
}

// ============================================================================
// ADVICE ENGINE SERVICE
// ============================================================================

/**
 * Enterprise-grade Advice Engine for matching student needs to clinical interventions.
 * Uses a weighted heuristic algorithm to maximize specificity and safety.
 */
export class RecommendationEngine {
  private static instance: RecommendationEngine;
  private readonly CACHE_TTL = 3600; // 1 hour (mock)

  private constructor() {
    // Singleton initialization (e.g., load models, indexes)
    console.log('[AdviceEngine] Service initialized. Indexing ' + INTERVENTION_LIBRARY.length + ' interventions.');
  }

  public static getInstance(): RecommendationEngine {
    if (!RecommendationEngine.instance) {
      RecommendationEngine.instance = new RecommendationEngine();
    }
    return RecommendationEngine.instance;
  }

  /**
   * Main entry point for generating recommendations.
   * @param profile StudentProfile object containing needs and context
   * @param limit Max number of recommendations to return
   */
  public generateRecommendations(profile: StudentProfile, limit: number = 3): RecommendationResult[] {
    const scored = INTERVENTION_LIBRARY.map(intervention => this.scoreIntervention(intervention, profile));
    
    // Sort by score descending
    const ranked = scored.filter(r => r.confidence_score > 0).sort((a, b) => b.confidence_score - a.confidence_score);

    // Apply safety filter: If no high confidence matches, trigger fallback
    if (ranked.length > 0 && ranked[0].confidence_score < 40) {
        // In a real enterprise app, this would log a 'Miss' to analytics
        console.warn(`[AdviceEngine] Low confidence match for student ${profile.id}. Highest: ${ranked[0].confidence_score}`);
    }

    return ranked.slice(0, limit);
  }

  /**
   * Scoring algorithm core.
   * Calculates fit based on text vectors, explicit tags, and severity/evidence alignment.
   */
  private scoreIntervention(intervention: InterventionTemplate, profile: StudentProfile): RecommendationResult {
    let score = 0;
    const factors: MatchFactor[] = [];
    const reasons: string[] = [];

    // 1. Tag & Keyword Exact Matching (High Weight)
    const profileTerms = [...profile.presenting_needs, ...(profile.diagnosis_tags || [])].map(t => t.toLowerCase());
    const interventionTags = intervention.tags || [];
    const interventionNeeds = intervention.targeted_needs || [];
    
    let keywordMatches = 0;
    
    profileTerms.forEach(term => {
      // Check Tags
      if (interventionTags.includes(term) || interventionTags.some(t => t.includes(term))) {
        score += 25;
        keywordMatches++;
        // Don't duplicate factor logging for every tag
      }
      
      // Check Targeted Needs descriptions
      if (interventionNeeds.some(n => n.toLowerCase().includes(term))) {
        score += 20;
        keywordMatches++;
      }
    });

    if (keywordMatches > 0) {
      factors.push({ factor: 'Keyword Alignment', weight: Math.min(keywordMatches * 0.2, 1.0), description: `Matched ${keywordMatches} specific terms.` });
      reasons.push('Directly addresses reported needs.');
    }

    // 2. Severity Alignment (Safety Check)
    // Critical cases should favor Tier 2/3 interventions or specialized support
    if (profile.severity === 'high' || profile.severity === 'critical') {
      if (intervention.evidence_level === 'tier_3' || intervention.complexity === 'high') {
         score += 15;
         factors.push({ factor: 'Severity Match', weight: 0.15, description: 'Intervention intensity matches high need severity.' });
      } else if (intervention.evidence_level === 'tier_1' && intervention.complexity === 'low') {
         // Slight penalty for suggesting "light" touch for critical needs vs specialized
         score -= 5; 
      }
    }

    // 3. Setting Appropriateness
    if (profile.setting && intervention.setting.includes(profile.setting as any)) {
      score += 10;
      factors.push({ factor: 'Context Fit', weight: 0.1, description: `Suitable for ${profile.setting} delivery.` });
    }

    // 4. Evidence Bonus (Enterprise Standard: Favor Strong Evidence)
    if (intervention.evidence_level === 'tier_1') {
      score += 15;
      factors.push({ factor: 'Gold Standard Evidence', weight: 0.15, description: 'Backed by robust Tier 1 research.' });
    }

    // Normalize Score (Cap at 99 to reserve 100 for human override)
    score = Math.min(score, 99);

    // Determine Action based on score thresholds
    let action: RecommendationResult['routing_action'] = 'recommend';
    if (score < 50) action = 'consult_specialist';
    if (profile.severity === 'critical' && score < 80) action = 'emergency_review';

    return {
      intervention,
      confidence_score: score,
      match_factors: factors,
      suitability_reasoning: reasons.join(' ') || 'General category match.',
      routing_action: action
    };
  }
}
