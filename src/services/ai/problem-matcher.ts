import { logger } from "@/lib/logger";
/**
 * 🤖 INTELLIGENT PROBLEM MATCHER
 * Revolutionary AI system that analyzes educational challenges in real-time
 * and provides personalized solutions from EdPsych Connect's 1,247+ features
 *
 * This is the core of the "invisible intelligence" - users describe problems
 * in natural language and get instant, relevant solutions.
 */

import { aiService } from './core';

interface ProblemAnalysis {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  rootCause: string;
  immediateImpact: string;
  longTermImpact: string;
  recommendedSolutions: Solution[];
  estimatedTimeSavings: number;
  relevantFeatures: Feature[];
  implementationComplexity: 'simple' | 'moderate' | 'complex';
}

interface Solution {
  id: string;
  title: string;
  description: string;
  featureIds: string[];
  expectedOutcome: string;
  timeToImplement: string;
  costBenefit: 'high' | 'medium' | 'low';
  prerequisites: string[];
}

interface Feature {
  id: string;
  name: string;
  category: string;
  description: string;
  userRoles: string[];
  subscriptionTiers: string[];
  url: string;
}

export class IntelligentProblemMatcher {
  private featureDatabase: Feature[] = [];
  private solutionTemplates: Map<string, Solution[]> = new Map();

  constructor() {
    this.initializeFeatureDatabase();
    this.initializeSolutionTemplates();
    logger.debug('🎯 Intelligent Problem Matcher initialized');
  }

  /**
   * Analyze a problem described in natural language
   */
  async analyzeProblem(problemDescription: string): Promise<ProblemAnalysis> {
    logger.debug(`🔍 Analyzing problem: "${problemDescription}"`);

    try {
      // Use AI to classify and analyze the problem
      const analysis = await this.performAIProblemAnalysis(problemDescription);

      // Match against our feature database
      const relevantFeatures = this.findRelevantFeatures(analysis);

      // Generate personalized solutions
      const solutions = await this.generateSolutions(analysis, relevantFeatures);

      // Calculate impact metrics
      const impactMetrics = this.calculateImpactMetrics(analysis, solutions);

      return {
        ...analysis,
        // Ensure required properties are always defined
        category: analysis.category || 'other',
        severity: analysis.severity || 'medium',
        confidence: analysis.confidence || 50,
        rootCause: analysis.rootCause || 'Unknown',
        immediateImpact: analysis.immediateImpact || 'No immediate impact specified',
        longTermImpact: analysis.longTermImpact || 'No long-term impact specified',
        recommendedSolutions: solutions,
        relevantFeatures,
        estimatedTimeSavings: impactMetrics.timeSavings,
        implementationComplexity: this.assessComplexity(solutions)
      };

    } catch (_error) {
      console.error('❌ Problem analysis failed:', _error);
      throw new Error('Unable to analyze problem. Please try rephrasing your challenge.');
    }
  }

  /**
   * Perform AI-powered problem analysis
   */
  private async performAIProblemAnalysis(problemDescription: string): Promise<Partial<ProblemAnalysis>> {
    const prompt = `
      You are an expert educational consultant analyzing a teacher's challenge.

      Problem Description: "${problemDescription}"

      Analyze this problem and provide a structured response in JSON format:

      {
        "category": "Choose from: workload, engagement, assessment, behavior, communication, planning, resources, compliance, technology, other",
        "severity": "low|medium|high|critical based on impact on teaching and learning",
        "confidence": "percentage 0-100 of how confident you are in this analysis",
        "rootCause": "What is the underlying cause of this problem?",
        "immediateImpact": "How does this affect daily teaching?",
        "longTermImpact": "What are the long-term consequences if not addressed?"
      }

      Be specific, actionable, and focus on educational outcomes.
    `;

    const response = await aiService.generateResponse({
      prompt,
      id: 'system',
      subscriptionTier: 'enterprise',
      useCase: 'problem_matching',
      maxTokens: 800,
      temperature: 0.3
    });

    return JSON.parse(response.content);
  }

  /**
   * Find relevant features from our database
   */
  private findRelevantFeatures(analysis: Partial<ProblemAnalysis>): Feature[] {
    const relevantFeatures: Feature[] = [];

    // Keyword matching against feature database
    const keywords = this.extractKeywords(analysis);

    for (const feature of this.featureDatabase) {
      const relevanceScore = this.calculateFeatureRelevance(feature, keywords, analysis);

      if (relevanceScore > 0.3) { // 30% relevance threshold
        relevantFeatures.push({
          ...feature,
          relevanceScore
        } as Feature);
      }
    }

    // Sort by relevance and return top matches
    return relevantFeatures
      .sort((a, b) => (b as any).relevanceScore - (a as any).relevanceScore)
      .slice(0, 10);
  }

  /**
   * Generate personalized solutions
   * Note: This method has template-based and AI-generated solutions
   */
  private async generateSolutions(analysis: Partial<ProblemAnalysis>, features: Feature[]): Promise<Solution[]> {
    const solutions: Solution[] = [];

    // Get solution templates for this category
    const templates = this.solutionTemplates.get(analysis.category || 'other') || [];

    for (const template of templates) {
      const personalizedSolution = this.personalizeSolution(template, analysis, features);
      if (personalizedSolution) {
        solutions.push(personalizedSolution);
      }
    }

    try {
      // Generate AI-powered custom solutions
      const customSolutions = await this.generateCustomSolutions(analysis, features);
      solutions.push(...customSolutions);
    } catch (_error) {
      console.warn('Error generating custom solutions:', _error);
      // Continue with template solutions only
    }

    return solutions.slice(0, 5); // Return top 5 solutions
  }

  /**
   * Calculate impact metrics
   */
  private calculateImpactMetrics(analysis: Partial<ProblemAnalysis>, solutions: Solution[]): any {
    const timeSavings = this.estimateTimeSavings(solutions);
    const costBenefit = this.calculateCostBenefit(solutions);
    const implementationComplexity = this.assessComplexity(solutions);

    return {
      timeSavings,
      costBenefit,
      implementationEffort: implementationComplexity, // Use the complexity as effort
      overallImpact: this.calculateOverallImpact(analysis, timeSavings, costBenefit)
    };
  }

  /**
   * Initialize feature database with EdPsych Connect's 1,247+ features
   */
  private initializeFeatureDatabase(): void {
    // This would be loaded from a database in production
    this.featureDatabase = [
      {
        id: 'ai-report-writer',
        name: 'AI Report Writer Agent',
        category: 'assessment',
        description: 'Autonomous AI agent that generates professional, personalized student reports',
        userRoles: ['teacher', 'admin'],
        subscriptionTiers: ['professional', 'enterprise'],
        url: '/features/ai-agents/report-writer'
      },
      {
        id: 'lesson-planner',
        name: 'Intelligent Lesson Planner',
        category: 'planning',
        description: 'AI-powered lesson planning with curriculum alignment and differentiation',
        userRoles: ['teacher'],
        subscriptionTiers: ['standard', 'professional', 'enterprise'],
        url: '/features/lesson-planning'
      },
      {
        id: 'behavior-analyzer',
        name: 'Behaviour Pattern Analysis',
        category: 'behavior',
        description: 'AI system that identifies patterns in student behaviour and suggests interventions',
        userRoles: ['teacher', 'admin'],
        subscriptionTiers: ['professional', 'enterprise'],
        url: '/features/behavior-analysis'
      },
      {
        id: 'parent-communication',
        name: 'Automated Parent Communication',
        category: 'communication',
        description: 'AI-generated parent emails and progress updates with professional tone',
        userRoles: ['teacher'],
        subscriptionTiers: ['standard', 'professional', 'enterprise'],
        url: '/features/parent-communication'
      },
      {
        id: 'workflow-automation',
        name: '24 Automated Workflows',
        category: 'workload',
        description: 'Pre-built automation for common teaching tasks and administrative processes',
        userRoles: ['teacher', 'admin'],
        subscriptionTiers: ['professional', 'enterprise'],
        url: '/features/workflows'
      }
    ];
  }

  /**
   * Initialize solution templates by category
   */
  private initializeSolutionTemplates(): void {
    this.solutionTemplates.set('workload', [
      {
        id: 'automate-reporting',
        title: 'Automate Report Writing',
        description: 'Use AI Report Writer to generate personalized student reports in minutes',
        featureIds: ['ai-report-writer'],
        expectedOutcome: 'Save 3-5 hours per week on report writing',
        timeToImplement: '5 minutes to set up, instant results',
        costBenefit: 'high',
        prerequisites: ['Student data in system']
      },
      {
        id: 'workflow-automation',
        title: 'Implement Workflow Automation',
        description: 'Set up automated workflows for routine tasks',
        featureIds: ['workflow-automation'],
        expectedOutcome: 'Reduce administrative tasks by 60%',
        timeToImplement: '10 minutes to configure',
        costBenefit: 'high',
        prerequisites: ['None - works immediately']
      }
    ]);

    this.solutionTemplates.set('engagement', [
      {
        id: 'gamification-system',
        title: 'Implement Gamification',
        description: 'Use the battle royale educational gaming system to boost engagement',
        featureIds: ['gamification-engine'],
        expectedOutcome: 'Increase student participation by 80%',
        timeToImplement: '1 day to set up',
        costBenefit: 'high',
        prerequisites: ['Student accounts created']
      }
    ]);

    this.solutionTemplates.set('assessment', [
      {
        id: 'ai-assessment-generation',
        title: 'AI-Generated Assessments',
        description: 'Create personalized assessments with AI-powered marking',
        featureIds: ['assessment-generator'],
        expectedOutcome: 'Save 2-3 hours per week on assessment creation',
        timeToImplement: 'Immediate',
        costBenefit: 'high',
        prerequisites: ['Curriculum objectives defined']
      }
    ]);

    this.solutionTemplates.set('behavior', [
      {
        id: 'behavior-pattern-analysis',
        title: 'Analyze Behavior Patterns',
        description: 'Use AI to identify and address behavior patterns early',
        featureIds: ['behavior-analyzer'],
        expectedOutcome: 'Reduce behavior incidents by 40%',
        timeToImplement: '1 week to see patterns',
        costBenefit: 'high',
        prerequisites: ['Behavior data logging enabled']
      }
    ]);

    this.solutionTemplates.set('communication', [
      {
        id: 'automated-parent-updates',
        title: 'Automated Parent Communication',
        description: 'Set up AI-generated parent communications',
        featureIds: ['parent-communication'],
        expectedOutcome: 'Improve parent satisfaction by 90%',
        timeToImplement: '5 minutes to configure',
        costBenefit: 'high',
        prerequisites: ['Parent contact information']
      }
    ]);

    this.solutionTemplates.set('planning', [
      {
        id: 'intelligent-lesson-planning',
        title: 'AI-Powered Lesson Planning',
        description: 'Generate differentiated lesson plans aligned to curriculum',
        featureIds: ['lesson-planner'],
        expectedOutcome: 'Save 4-6 hours per week on planning',
        timeToImplement: 'Immediate',
        costBenefit: 'high',
        prerequisites: ['Subject and year group specified']
      }
    ]);
  }

  /**
   * Extract keywords from problem analysis
   */
  private extractKeywords(analysis: Partial<ProblemAnalysis>): string[] {
    const text = `${analysis.rootCause} ${analysis.immediateImpact} ${analysis.longTermImpact}`.toLowerCase();
    const keywords = [
      'time', 'hours', 'workload', 'administrative', 'reports', 'planning', 'assessment',
      'marking', 'behavior', 'engagement', 'communication', 'parents', 'students',
      'resources', 'compliance', 'data', 'tracking', 'monitoring', 'feedback'
    ];

    return keywords.filter(keyword => text.includes(keyword));
  }

  /**
   * Calculate feature relevance score
   */
  private calculateFeatureRelevance(feature: Feature, keywords: string[], analysis: Partial<ProblemAnalysis>): number {
    let score = 0;

    // Keyword matching
    const featureText = `${feature.name} ${feature.description} ${feature.category}`.toLowerCase();
    const keywordMatches = keywords.filter(keyword => featureText.includes(keyword)).length;
    score += keywordMatches * 0.3;

    // Category matching
    if (feature.category === analysis.category) {
      score += 0.4;
    }

    // User role matching (if we had user context)
    score += 0.1;

    return Math.min(score, 1.0);
  }

  /**
   * Personalize solution template
   */
  private personalizeSolution(template: Solution, analysis: Partial<ProblemAnalysis>, features: Feature[]): Solution | null {
    // Check if required features are available
    const availableFeatureIds = features.map(f => f.id);
    const hasRequiredFeatures = template.featureIds.every(id => availableFeatureIds.includes(id));

    if (!hasRequiredFeatures) {
      return null;
    }

    // Personalize description based on analysis
    let personalizedDescription = template.description;

    if (analysis.severity === 'critical') {
      personalizedDescription += ' This addresses your critical challenge immediately.';
    } else if (analysis.severity === 'high') {
      personalizedDescription += ' This will significantly improve your situation.';
    }

    return {
      ...template,
      description: personalizedDescription
    };
  }

  /**
   * Generate custom solutions using AI
   */
  private async generateCustomSolutions(analysis: Partial<ProblemAnalysis>, features: Feature[]): Promise<Solution[]> {
    const prompt = `
      Based on this educational problem analysis:
      ${JSON.stringify(analysis, null, 2)}

      Available features:
      ${JSON.stringify(features.slice(0, 5), null, 2)}

      Generate 1-2 custom solutions that combine multiple features to address this specific challenge.
      Focus on practical, implementable solutions with clear outcomes.

      Return as JSON array of solution objects with:
      - id: unique identifier
      - title: descriptive title
      - description: how it solves the problem
      - featureIds: which features to use
      - expectedOutcome: specific measurable result
      - timeToImplement: how long to set up
      - costBenefit: high/medium/low
      - prerequisites: what's needed
    `;

    try {
      const response = await aiService.generateResponse({
        prompt,
        id: 'system',
        subscriptionTier: 'enterprise',
        useCase: 'problem_matching',
        maxTokens: 600,
        temperature: 0.4
      });

      return JSON.parse(response.content);
    } catch (_error) {
      console.warn('Failed to generate custom solutions:', _error);
      return [];
    }
  }

  /**
   * Estimate time savings from solutions
   */
  private estimateTimeSavings(solutions: Solution[]): number {
    const timeEstimates: Record<string, number> = {
      'automate-reporting': 5, // hours per week
      'workflow-automation': 10,
      'ai-assessment-generation': 3,
      'intelligent-lesson-planning': 6,
      'automated-parent-updates': 2,
      'behavior-pattern-analysis': 4
    };

    let totalSavings = 0;
    for (const solution of solutions) {
      for (const featureId of solution.featureIds) {
        totalSavings += timeEstimates[featureId] || 0;
      }
    }

    return totalSavings;
  }

  /**
   * Calculate cost benefit
   */
  private calculateCostBenefit(solutions: Solution[]): 'high' | 'medium' | 'low' {
    const highBenefitSolutions = solutions.filter(s => s.costBenefit === 'high').length;
    const ratio = highBenefitSolutions / solutions.length;

    if (ratio >= 0.7) return 'high';
    if (ratio >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Assess implementation complexity
   */
  private assessComplexity(solutions: Solution[]): 'simple' | 'moderate' | 'complex' {
    const complexities = solutions.map(s => {
      if (s.timeToImplement.includes('Immediate') || s.timeToImplement.includes('5 minutes')) return 1;
      if (s.timeToImplement.includes('day') || s.timeToImplement.includes('week')) return 3;
      return 2;
    });

    const avgComplexity = complexities.reduce((a, b) => a + b, 0) / complexities.length;

    if (avgComplexity <= 1.5) return 'simple';
    if (avgComplexity <= 2.5) return 'moderate';
    return 'complex';
  }

  /**
   * Calculate overall impact score
   */
  private calculateOverallImpact(analysis: Partial<ProblemAnalysis>, timeSavings: number, costBenefit: string): number {
    const severityScore = { low: 1, medium: 2, high: 3, critical: 4 }[analysis.severity || 'medium'] || 2;
    // Ensure costBenefit is a valid key and provide default
    const validBenefit = (costBenefit === 'low' || costBenefit === 'medium' || costBenefit === 'high') ? costBenefit : 'medium';
    const benefitScore = { low: 1, medium: 2, high: 3 }[validBenefit];
    const timeSavingsScore = Math.min(timeSavings / 10, 3); // Cap at 3

    return (severityScore * 0.4) + (benefitScore * 0.3) + (timeSavingsScore * 0.3);
  }

  /**
   * Get problem categories and their descriptions
   */
  getProblemCategories(): any {
    return {
      workload: 'Administrative burden and time management issues',
      engagement: 'Student motivation and participation challenges',
      assessment: 'Testing, grading, and feedback processes',
      behavior: 'Classroom management and student conduct',
      communication: 'Parent-teacher and stakeholder interactions',
      planning: 'Lesson preparation and curriculum design',
      resources: 'Access to materials and educational tools',
      compliance: 'Regulatory and reporting requirements',
      technology: 'Technical issues and system usage',
      other: 'Miscellaneous educational challenges'
    };
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): any {
    return {
      totalFeatures: this.featureDatabase.length,
      solutionTemplates: this.solutionTemplates.size,
      categories: Array.from(this.solutionTemplates.keys())
    };
  }
}

let _problemMatcher: IntelligentProblemMatcher | null = null;

/**
 * Lazily create the matcher.
 *
 * Important: do NOT instantiate at module load time, because Next.js may import
 * route modules during build/static analysis which would otherwise create noisy
 * side effects in Vercel build logs.
 */
export function getProblemMatcher(): IntelligentProblemMatcher {
  if (!_problemMatcher) {
    _problemMatcher = new IntelligentProblemMatcher();
  }
  return _problemMatcher;
}
