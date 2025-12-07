/**
 * Lesson Personalization Engine
 * 
 * AI-driven adaptive learning system that personalises educational content
 * based on student learning profiles, SEND requirements, and performance data.
 * 
 * Features:
 * - Learning style detection (visual, auditory, kinesthetic, reading)
 * - SEND accommodation engine (dyslexia, dyscalculia, ADHD, ASD, VI, HI)
 * - Cognitive load management
 * - Dynamic difficulty adjustment
 * - Content variant generation
 * - Scaffolding system with hints and worked examples
 * - Text-to-speech support
 * - Extended time calculations
 * 
 * @module LessonPersonalizationEngine
 * @version 1.0.0
 * Zero Gap Project - Sprint 3
 */

import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export type PersonalizationDimension = 
  | 'LEARNING_STYLE' 
  | 'DIFFICULTY_LEVEL' 
  | 'SEND_ACCESSIBILITY' 
  | 'COGNITIVE_LOAD' 
  | 'LANGUAGE_SUPPORT';

export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'reading';

export interface StudentAdaptiveProfileInput {
  studentId: number;
  tenantId: number;
  visualPreference?: number;
  auditoryPreference?: number;
  kinestheticPreference?: number;
  readingPreference?: number;
  processingSpeed?: 'slow' | 'average' | 'fast';
  workingMemory?: 'low' | 'average' | 'high';
  attentionSpanMinutes?: number;
  dyslexiaSupport?: boolean;
  dyscalculiaSupport?: boolean;
  adhdSupport?: boolean;
  asdSupport?: boolean;
  visualImpairment?: boolean;
  hearingImpairment?: boolean;
  preferredFontSize?: number;
  preferredColorScheme?: string;
}

export interface PersonalizedLessonContent {
  lessonId: string;
  studentId: number;
  variantName: string;
  adaptations: ContentAdaptation[];
  scaffolding: ScaffoldingOptions;
  accessibilityFeatures: AccessibilityFeatures;
  timing: TimingAdjustments;
  recommendedApproach: string;
}

export interface ContentAdaptation {
  type: string;
  description: string;
  applied: boolean;
  reason: string;
}

export interface ScaffoldingOptions {
  extraHints: string[];
  workedExamples: string[];
  sentenceStarters: string[];
  visualAidsUrls: string[];
  chunkedContent: boolean;
}

export interface AccessibilityFeatures {
  hasTextToSpeech: boolean;
  ttsVoice?: string;
  ttsSpeed?: number;
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
  captionsEnabled: boolean;
}

export interface TimingAdjustments {
  extendedTimeMultiplier: number;
  breakReminders: boolean;
  breakIntervalMinutes?: number;
  suggestedDurationMinutes: number;
}

// SEND-specific content adaptations
export const SEND_ADAPTATIONS = {
  dyslexia: {
    name: 'Dyslexia Support',
    adaptations: [
      { type: 'font', description: 'Use dyslexia-friendly font (OpenDyslexic)', default: true },
      { type: 'spacing', description: 'Increased line and letter spacing', default: true },
      { type: 'color', description: 'Cream/pastel background colour', default: true },
      { type: 'chunking', description: 'Break text into smaller chunks', default: true },
      { type: 'audio', description: 'Enable text-to-speech for all text', default: true },
      { type: 'vocabulary', description: 'Simplified vocabulary with definitions', default: false },
      { type: 'visuals', description: 'Add visual cues and icons', default: true },
    ],
  },
  dyscalculia: {
    name: 'Dyscalculia Support',
    adaptations: [
      { type: 'visuals', description: 'Visual representations of numbers', default: true },
      { type: 'manipulatives', description: 'Virtual manipulatives for calculations', default: true },
      { type: 'steps', description: 'Break calculations into smaller steps', default: true },
      { type: 'concrete', description: 'Link numbers to real-world examples', default: true },
      { type: 'charts', description: 'Number lines and reference charts always visible', default: true },
      { type: 'time', description: 'Extra time for numerical tasks', default: true },
    ],
  },
  adhd: {
    name: 'ADHD Support',
    adaptations: [
      { type: 'chunking', description: 'Break content into short, focused sections', default: true },
      { type: 'breaks', description: 'Regular break reminders (every 10-15 minutes)', default: true },
      { type: 'gamification', description: 'Increased gamification elements', default: true },
      { type: 'progress', description: 'Clear progress indicators', default: true },
      { type: 'rewards', description: 'Immediate feedback and rewards', default: true },
      { type: 'distractions', description: 'Minimized page distractions', default: true },
      { type: 'checklist', description: 'Step-by-step checklist format', default: true },
    ],
  },
  asd: {
    name: 'ASD Support',
    adaptations: [
      { type: 'structure', description: 'Clear, predictable structure', default: true },
      { type: 'explicit', description: 'Explicit instructions (no implied meanings)', default: true },
      { type: 'visuals', description: 'Visual schedules and timers', default: true },
      { type: 'consistency', description: 'Consistent layout and navigation', default: true },
      { type: 'sensory', description: 'Option to disable animations/sounds', default: true },
      { type: 'social', description: 'Social stories for group activities', default: false },
      { type: 'transitions', description: 'Clear transition warnings', default: true },
    ],
  },
  visualImpairment: {
    name: 'Visual Impairment Support',
    adaptations: [
      { type: 'screenReader', description: 'Full screen reader compatibility', default: true },
      { type: 'largeText', description: 'Large text option (min 18pt)', default: true },
      { type: 'highContrast', description: 'High contrast colour scheme', default: true },
      { type: 'altText', description: 'Detailed alt text for all images', default: true },
      { type: 'audio', description: 'Audio descriptions for visual content', default: true },
      { type: 'magnification', description: 'Built-in magnification tools', default: false },
    ],
  },
  hearingImpairment: {
    name: 'Hearing Impairment Support',
    adaptations: [
      { type: 'captions', description: 'Captions for all audio/video content', default: true },
      { type: 'transcripts', description: 'Full transcripts available', default: true },
      { type: 'visuals', description: 'Visual cues for audio notifications', default: true },
      { type: 'bsl', description: 'BSL video interpretation option', default: false },
      { type: 'noAudio', description: 'Content works fully without audio', default: true },
    ],
  },
} as const;

// UK English TTS voices
export const UK_TTS_VOICES = [
  { id: 'en-GB-Neural2-A', name: 'British Male', accent: 'Southern English' },
  { id: 'en-GB-Neural2-B', name: 'British Female', accent: 'Southern English' },
  { id: 'en-GB-Neural2-C', name: 'British Male', accent: 'Received Pronunciation' },
  { id: 'en-GB-Neural2-D', name: 'British Female', accent: 'Welsh' },
  { id: 'en-GB-Neural2-F', name: 'British Female', accent: 'Scottish' },
] as const;

// ============================================================================
// LESSON PERSONALIZATION ENGINE CLASS
// ============================================================================

export class LessonPersonalizationEngine {
  private tenantId: number;

  constructor(tenantId: number) {
    this.tenantId = tenantId;
  }

  // ==========================================================================
  // STUDENT PROFILE MANAGEMENT
  // ==========================================================================

  /**
   * Create or update a student's adaptive learning profile
   */
  async upsertStudentProfile(input: StudentAdaptiveProfileInput): Promise<string> {
    const existing = await prisma.studentAdaptiveProfile.findUnique({
      where: { student_id: input.studentId },
    });

    const data = {
      tenant_id: input.tenantId,
      visual_preference: input.visualPreference ?? 50,
      auditory_preference: input.auditoryPreference ?? 50,
      kinesthetic_preference: input.kinestheticPreference ?? 50,
      reading_preference: input.readingPreference ?? 50,
      processing_speed: input.processingSpeed ?? 'average',
      working_memory: input.workingMemory ?? 'average',
      attention_span_minutes: input.attentionSpanMinutes ?? 20,
      dyslexia_support: input.dyslexiaSupport ?? false,
      dyscalculia_support: input.dyscalculiaSupport ?? false,
      adhd_support: input.adhdSupport ?? false,
      asd_support: input.asdSupport ?? false,
      visual_impairment: input.visualImpairment ?? false,
      hearing_impairment: input.hearingImpairment ?? false,
      preferred_font_size: input.preferredFontSize ?? 1.0,
      preferred_color_scheme: input.preferredColorScheme ?? 'default',
    };

    if (existing) {
      await prisma.studentAdaptiveProfile.update({
        where: { id: existing.id },
        data: { ...data, last_profile_update: new Date() },
      });
      return existing.id;
    }

    const profile = await prisma.studentAdaptiveProfile.create({
      data: {
        student_id: input.studentId,
        ...data,
      },
    });

    logger.info(`[Personalization] Created adaptive profile for student ${input.studentId}`);
    return profile.id;
  }

  /**
   * Get a student's adaptive profile
   */
  async getStudentProfile(studentId: number) {
    return prisma.studentAdaptiveProfile.findUnique({
      where: { student_id: studentId },
      include: {
        student: {
          select: {
            first_name: true,
            last_name: true,
            year_group: true,
            sen_status: true,
          },
        },
      },
    });
  }

  // ==========================================================================
  // PERSONALIZATION GENERATION
  // ==========================================================================

  /**
   * Generate personalized lesson content for a student
   */
  async generatePersonalizedLesson(
    lessonId: string,
    studentId: number
  ): Promise<PersonalizedLessonContent> {
    // Get student profile
    const profile = await this.getStudentProfile(studentId);
    
    if (!profile) {
      // Create default profile if none exists
      await this.upsertStudentProfile({
        studentId,
        tenantId: this.tenantId,
      });
      
      // Return default personalization
      return this.generateDefaultPersonalization(lessonId, studentId);
    }

    // Get lesson details
    const lesson = await prisma.nCLesson.findUnique({
      where: { id: lessonId },
      include: {
        personalizations: true,
      },
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Determine primary learning style
    const learningStyle = this.determinePrimaryLearningStyle(profile);

    // Build adaptations based on SEND requirements
    const adaptations = this.buildSENDAdaptations(profile);

    // Calculate timing adjustments
    const timing = this.calculateTimingAdjustments(profile, lesson.duration_minutes);

    // Build scaffolding options
    const scaffolding = this.buildScaffoldingOptions(profile, lesson);

    // Build accessibility features
    const accessibilityFeatures = this.buildAccessibilityFeatures(profile);

    // Determine variant name
    const variantName = this.determineVariantName(profile, learningStyle);

    // Generate recommended approach
    const recommendedApproach = this.generateRecommendedApproach(
      profile,
      learningStyle,
      adaptations
    );

    // Record the adaptation
    await this.recordLearningAdaptation(studentId, lessonId, variantName, adaptations);

    return {
      lessonId,
      studentId,
      variantName,
      adaptations,
      scaffolding,
      accessibilityFeatures,
      timing,
      recommendedApproach,
    };
  }

  /**
   * Generate default personalization for students without profiles
   */
  private generateDefaultPersonalization(
    lessonId: string,
    studentId: number
  ): PersonalizedLessonContent {
    return {
      lessonId,
      studentId,
      variantName: 'default',
      adaptations: [],
      scaffolding: {
        extraHints: [],
        workedExamples: [],
        sentenceStarters: [],
        visualAidsUrls: [],
        chunkedContent: false,
      },
      accessibilityFeatures: {
        hasTextToSpeech: false,
        highContrast: false,
        largeText: false,
        reducedMotion: false,
        screenReaderOptimized: false,
        captionsEnabled: false,
      },
      timing: {
        extendedTimeMultiplier: 1.0,
        breakReminders: false,
        suggestedDurationMinutes: 45,
      },
      recommendedApproach: 'Standard delivery with regular check-ins.',
    };
  }

  /**
   * Determine the student's primary learning style
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private determinePrimaryLearningStyle(profile: any): LearningStyle {
    const styles = [
      { style: 'visual' as LearningStyle, score: profile.visual_preference },
      { style: 'auditory' as LearningStyle, score: profile.auditory_preference },
      { style: 'kinesthetic' as LearningStyle, score: profile.kinesthetic_preference },
      { style: 'reading' as LearningStyle, score: profile.reading_preference },
    ];

    styles.sort((a, b) => b.score - a.score);
    return styles[0].style;
  }

  /**
   * Build SEND adaptations based on student profile
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private buildSENDAdaptations(profile: any): ContentAdaptation[] {
    const adaptations: ContentAdaptation[] = [];

    if (profile.dyslexia_support) {
      for (const adaptation of SEND_ADAPTATIONS.dyslexia.adaptations) {
        if (adaptation.default) {
          adaptations.push({
            type: `dyslexia_${adaptation.type}`,
            description: adaptation.description,
            applied: true,
            reason: 'Dyslexia support enabled',
          });
        }
      }
    }

    if (profile.dyscalculia_support) {
      for (const adaptation of SEND_ADAPTATIONS.dyscalculia.adaptations) {
        if (adaptation.default) {
          adaptations.push({
            type: `dyscalculia_${adaptation.type}`,
            description: adaptation.description,
            applied: true,
            reason: 'Dyscalculia support enabled',
          });
        }
      }
    }

    if (profile.adhd_support) {
      for (const adaptation of SEND_ADAPTATIONS.adhd.adaptations) {
        if (adaptation.default) {
          adaptations.push({
            type: `adhd_${adaptation.type}`,
            description: adaptation.description,
            applied: true,
            reason: 'ADHD support enabled',
          });
        }
      }
    }

    if (profile.asd_support) {
      for (const adaptation of SEND_ADAPTATIONS.asd.adaptations) {
        if (adaptation.default) {
          adaptations.push({
            type: `asd_${adaptation.type}`,
            description: adaptation.description,
            applied: true,
            reason: 'ASD support enabled',
          });
        }
      }
    }

    if (profile.visual_impairment) {
      for (const adaptation of SEND_ADAPTATIONS.visualImpairment.adaptations) {
        if (adaptation.default) {
          adaptations.push({
            type: `vi_${adaptation.type}`,
            description: adaptation.description,
            applied: true,
            reason: 'Visual impairment support enabled',
          });
        }
      }
    }

    if (profile.hearing_impairment) {
      for (const adaptation of SEND_ADAPTATIONS.hearingImpairment.adaptations) {
        if (adaptation.default) {
          adaptations.push({
            type: `hi_${adaptation.type}`,
            description: adaptation.description,
            applied: true,
            reason: 'Hearing impairment support enabled',
          });
        }
      }
    }

    return adaptations;
  }

  /**
   * Calculate timing adjustments based on student needs
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private calculateTimingAdjustments(profile: any, baseDuration: number): TimingAdjustments {
    let multiplier = 1.0;
    let breakReminders = false;
    let breakInterval: number | undefined;

    // Processing speed adjustment
    if (profile.processing_speed === 'slow') {
      multiplier += 0.5; // 50% extra time
    }

    // Working memory adjustment
    if (profile.working_memory === 'low') {
      multiplier += 0.25; // 25% extra time
    }

    // SEND adjustments
    if (profile.dyslexia_support) {
      multiplier += 0.25;
    }

    if (profile.dyscalculia_support) {
      multiplier += 0.25;
    }

    if (profile.adhd_support) {
      breakReminders = true;
      breakInterval = Math.min(profile.attention_span_minutes, 15);
    }

    if (profile.visual_impairment) {
      multiplier += 0.5;
    }

    // Calculate suggested duration
    const suggestedDuration = Math.ceil(baseDuration * multiplier);

    return {
      extendedTimeMultiplier: Math.round(multiplier * 10) / 10,
      breakReminders,
      breakIntervalMinutes: breakInterval,
      suggestedDurationMinutes: suggestedDuration,
    };
  }

  /**
   * Build scaffolding options
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private buildScaffoldingOptions(profile: any, lesson: any): ScaffoldingOptions {
    const options: ScaffoldingOptions = {
      extraHints: [],
      workedExamples: [],
      sentenceStarters: [],
      visualAidsUrls: [],
      chunkedContent: false,
    };

    // Dyslexia support - sentence starters
    if (profile.dyslexia_support) {
      options.sentenceStarters = [
        'The first step is to...',
        'Next, I need to...',
        'This means that...',
        'I can see that...',
        'The answer is... because...',
      ];
      options.chunkedContent = true;
    }

    // Low working memory - extra hints and worked examples
    if (profile.working_memory === 'low') {
      options.extraHints.push(
        'Take your time with each step',
        'Write down key information as you go',
        'Use the scratch pad to make notes'
      );
    }

    // ADHD support - chunked content
    if (profile.adhd_support) {
      options.chunkedContent = true;
    }

    // Visual learners - visual aids
    if (profile.visual_preference >= 70) {
      options.visualAidsUrls = lesson.resources_urls || [];
    }

    return options;
  }

  /**
   * Build accessibility features
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private buildAccessibilityFeatures(profile: any): AccessibilityFeatures {
    return {
      hasTextToSpeech: profile.dyslexia_support || profile.visual_impairment,
      ttsVoice: profile.dyslexia_support || profile.visual_impairment 
        ? UK_TTS_VOICES[0].id 
        : undefined,
      ttsSpeed: profile.processing_speed === 'slow' ? 0.8 : 1.0,
      highContrast: profile.visual_impairment,
      largeText: profile.visual_impairment || profile.preferred_font_size === 'large',
      reducedMotion: profile.asd_support,
      screenReaderOptimized: profile.visual_impairment,
      captionsEnabled: profile.hearing_impairment,
    };
  }

  /**
   * Determine variant name based on profile
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private determineVariantName(profile: any, learningStyle: LearningStyle): string {
    const parts: string[] = [learningStyle];

    if (profile.dyslexia_support) parts.push('dyslexia');
    if (profile.dyscalculia_support) parts.push('dyscalculia');
    if (profile.adhd_support) parts.push('adhd');
    if (profile.asd_support) parts.push('asd');
    if (profile.visual_impairment) parts.push('vi');
    if (profile.hearing_impairment) parts.push('hi');

    if (profile.processing_speed === 'slow') parts.push('extended');
    
    return parts.join('_');
  }

  /**
   * Generate recommended approach text for teachers
   */
  private generateRecommendedApproach(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    profile: any,
    learningStyle: LearningStyle,
    _adaptations: ContentAdaptation[]
  ): string {
    const recommendations: string[] = [];

    // Learning style recommendation
    switch (learningStyle) {
      case 'visual':
        recommendations.push('Use diagrams, flowcharts, and visual demonstrations');
        break;
      case 'auditory':
        recommendations.push('Provide verbal explanations and encourage discussion');
        break;
      case 'kinesthetic':
        recommendations.push('Include hands-on activities and physical computing tasks');
        break;
      case 'reading':
        recommendations.push('Provide written instructions and encourage note-taking');
        break;
    }

    // SEND recommendations
    if (profile.dyslexia_support) {
      recommendations.push('Allow extra reading time and provide printed materials in dyslexia-friendly format');
    }

    if (profile.adhd_support) {
      recommendations.push(`Schedule breaks every ${profile.attention_span_minutes} minutes`);
      recommendations.push('Use immediate positive reinforcement');
    }

    if (profile.asd_support) {
      recommendations.push('Maintain consistent routines and give advance notice of any changes');
    }

    // Processing speed
    if (profile.processing_speed === 'slow') {
      recommendations.push('Allow additional processing time and avoid rushing responses');
    }

    return recommendations.join('. ') + '.';
  }

  /**
   * Record the learning adaptation for analytics
   */
  private async recordLearningAdaptation(
    studentId: number,
    lessonId: string,
    variantName: string,
    adaptations: ContentAdaptation[]
  ): Promise<void> {
    const profile = await prisma.studentAdaptiveProfile.findUnique({
      where: { student_id: studentId }
    });

    if (!profile) {
      logger.warn(`Profile not found for student ${studentId}`);
      return;
    }

    await prisma.studentLearningAdaptation.create({
      data: {
        student_id: studentId,
        profile_id: profile.id,
        content_type: 'lesson',
        content_id: lessonId,
        personalization_dimension: adaptations.map(a => a.type).join(','),
        personalization_variant: variantName,
        student_rating: null,
      },
    });
  }

  // ==========================================================================
  // ANALYTICS AND EFFECTIVENESS
  // ==========================================================================

  /**
   * Update the effectiveness rating for an adaptation
   */
  async updateEffectivenessRating(
    studentId: number,
    lessonId: string,
    rating: number,
    feedback?: string
  ): Promise<void> {
    const adaptation = await prisma.studentLearningAdaptation.findFirst({
      where: {
        student_id: studentId,
        content_id: lessonId,
        content_type: 'lesson',
      },
      orderBy: { applied_at: 'desc' },
    });

    if (adaptation) {
      await prisma.studentLearningAdaptation.update({
        where: { id: adaptation.id },
        data: {
          student_rating: rating,
          helpful: feedback ? true : undefined,
        },
      });
    }
  }

  /**
   * Get adaptation analytics for a student
   */
  async getAdaptationAnalytics(studentId: number) {
    const adaptations = await prisma.studentLearningAdaptation.findMany({
      where: { student_id: studentId },
      orderBy: { applied_at: 'desc' },
    });

    // Calculate average effectiveness by adaptation type
    const effectivenessByType: Record<string, { total: number; count: number }> = {};

    for (const adaptation of adaptations) {
      if (adaptation.student_rating !== null) {
        const types = adaptation.personalization_dimension.split(',');
        for (const type of types) {
          if (!effectivenessByType[type]) {
            effectivenessByType[type] = { total: 0, count: 0 };
          }
          effectivenessByType[type].total += adaptation.student_rating;
          effectivenessByType[type].count += 1;
        }
      }
    }

    const averageEffectiveness: Record<string, number> = {};
    for (const [type, data] of Object.entries(effectivenessByType)) {
      averageEffectiveness[type] = Math.round((data.total / data.count) * 10) / 10;
    }

    return {
      totalAdaptations: adaptations.length,
      ratedAdaptations: adaptations.filter(a => a.student_rating !== null).length,
      averageEffectiveness,
      recentAdaptations: adaptations.slice(0, 10),
    };
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createPersonalizationEngine(tenantId: number): LessonPersonalizationEngine {
  return new LessonPersonalizationEngine(tenantId);
}

export default LessonPersonalizationEngine;
