import { logger } from "@/lib/logger";
/**
 * Assessment Framework Type Definitions
 * EdPsych Connect World - Phase 3
 */

export interface AssessmentFramework {
  id: string;
  name: string;
  abbreviation: string;
  version: string;
  domain: string;
  description: string;
  purpose: string;
  age_range_min?: number;
  age_range_max?: number;
  evidence_base: EvidenceBase;
  theoretical_frameworks: string[];
  administration_guide: AdministrationGuide;
  time_estimate_minutes?: number;
  interpretation_guide: InterpretationGuide;
  qualitative_descriptors: QualitativeDescriptors;
  domains: AssessmentDomainDefinition[];
  status: string;
  is_proprietary: boolean;
  copyright_holder: string;
}

export interface EvidenceBase {
  primary_research: ResearchCitation[];
  supporting_research: ResearchCitation[];
}

export interface ResearchCitation {
  citation: string;
  relevance: string;
}

export interface AdministrationGuide {
  overview: string;
  steps: AdministrationStep[];
  materials_needed: string[];
  important_notes: string[];
}

export interface AdministrationStep {
  step: number;
  title: string;
  description: string;
  time_estimate: string;
  key_actions: string[];
}

export interface InterpretationGuide {
  principles: InterpretationPrinciple[];
  red_flags: string[];
  common_pitfalls: string[];
}

export interface InterpretationPrinciple {
  title: string;
  description: string;
}

export interface QualitativeDescriptors {
  strength_levels: DescriptorLevel[];
  need_levels: DescriptorLevel[];
}

export interface DescriptorLevel {
  level: string;
  description: string;
  indicators: string[];
}

export interface AssessmentDomainDefinition {
  id: string;
  name: string;
  description: string;
  order_index: number;
  observation_prompts: ObservationPrompts;
  task_suggestions: TaskSuggestion[];
  key_indicators: KeyIndicators;
  parent_questions: CollaborativeQuestion[];
  teacher_questions: CollaborativeQuestion[];
  child_prompts: ChildPrompt[];
  interpretation_guidance: InterpretationGuidanceDetail;
  strength_descriptors: string[];
  need_descriptors: string[];
  suggested_interventions: InterventionSuggestion[];
}

export interface ObservationPrompts {
  key_questions: string[];
  observation_contexts: string[];
  what_to_notice: string[];
}

export interface TaskSuggestion {
  task: string;
  description: string;
  age_appropriate: string;
  materials: string;
  dynamic_component: string;
}

export interface KeyIndicators {
  strengths: string[];
  needs: string[];
}

export interface CollaborativeQuestion {
  question: string;
  response_type: string;
  prompts: string[];
}

export interface ChildPrompt {
  prompt: string;
  age_range: string;
  method: string;
}

export interface InterpretationGuidanceDetail {
  patterns_to_consider: string[];
  theoretical_links: string[];
  functional_implications: string[];
}

export interface InterventionSuggestion {
  intervention: string;
  evidence_base: string;
  description: string;
  suitability: string;
}
