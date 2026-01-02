/**
 * EdPsych Connect - Advanced AI Integration System
 * Claude + OpenAI integration for 24 autonomous agents
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { Redis } from '@upstash/redis';
import { createHash } from 'crypto';
import { aiAuditService } from './audit/ai-audit-service';
import { getDefaultOpenAIModel } from '@/lib/ai/openai-model';
import { redactPII } from '@/lib/security/pii-redaction';
import { AI_DATA_USE_POLICY } from '@/lib/ai/data-use-policy';
import { getDemoResponse } from '@/lib/ai/demo-data';

export interface AIRequest {
  prompt: string;
  context?: Record<string, unknown>;
  id: string;
  tenantId?: string; // Added for auditing
  autonomyLevel?: 'advisory' | 'autonomous'; // Added for safety
  subscriptionTier: string;
  useCase: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
  /**
   * When true, redact likely PII before sending to third-party AI providers.
   * Defaults to true in production.
   */
  redactPII?: boolean;
  /**
   * Optional explicit entity strings (names/identifiers) to redact.
   */
  piiEntities?: string[];
}

export interface AIResponse {
  response: string;
  model: string;
  cost: number;
  tokens: number;
  fromCache: boolean;
  processingTime: number;
}

export interface AgentConfig {
  name: string;
  description: string;
  capabilities: string[];
  model: 'claude' | 'openai' | 'hybrid' | 'xai';
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
}

class AIIntegrationService {
  private anthropic: Anthropic | null = null;
  private openai: OpenAI | null = null;
  private xai: OpenAI | null = null;
  private gemini: OpenAI | null = null;
  private redis: Redis | null = null;
  private dailyUsage: Map<string, number> = new Map();
  private dailyBudget: number;

  constructor() {
    // Initialize Anthropic client if API key is available
    if (process.env.CLAUDE_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.CLAUDE_API_KEY,
      });
    }

    // Initialize OpenAI client if API key is available
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    // Initialize xAI client if API key is available
    if (process.env.XAI_API_KEY) {
      this.xai = new OpenAI({
        apiKey: process.env.XAI_API_KEY,
        baseURL: "https://api.x.ai/v1",
      });
    }

    // Initialize Gemini client if API key is available
    if (process.env.GEMINI_API_KEY) {
      this.gemini = new OpenAI({
        apiKey: process.env.GEMINI_API_KEY,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      });
    }

    // Initialize Redis only if environment variables are present
    try {
      if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        this.redis = Redis.fromEnv();
      } else {
        this.redis = null;
        // console.warn('Redis not configured - AI caching and rate limiting disabled');
      }
    } catch (_error) {
      this.redis = null;
      // console.warn('Failed to initialize Redis:', _error);
    }
    
    this.dailyBudget = parseFloat(process.env.AI_DAILY_BUDGET_USD || '50');
  }

  // 24 Autonomous Agents Configuration
  private agents: Record<string, AgentConfig> = {
    reportWriter: {
      name: 'Report Writer Agent',
      description: 'AI-powered student report generation',
      capabilities: ['report_generation', 'assessment_analysis', 'progress_tracking'],
      model: 'claude',
      maxTokens: 800,
      temperature: 0.7,
      systemPrompt: `You are an experienced educational psychologist helping teachers write comprehensive student reports. Focus on:
      - Highlighting student progress and achievements
      - Providing constructive, sensitive feedback
      - Using appropriate educational terminology
      - Maintaining an encouraging, supportive tone
      - Including specific, actionable next steps`
    },

    lessonPlanner: {
      name: 'Lesson Planner Agent',
      description: 'Intelligent lesson planning assistant',
      capabilities: ['curriculum_design', 'differentiation', 'assessment_creation'],
      model: 'claude',
      maxTokens: 1500,
      temperature: 0.8,
      systemPrompt: `You are an expert curriculum designer and educational technologist. Create engaging, differentiated lesson plans that:
      - Align with current curriculum standards
      - Include multiple learning pathways
      - Incorporate digital-native engagement strategies
      - Provide assessment for learning opportunities
      - Support diverse learning needs`
    },

    behaviorAnalyst: {
      name: 'Behaviour Analyst Agent',
      description: 'Pattern recognition and behaviour analysis',
      capabilities: ['pattern_recognition', 'behavior_analysis', 'intervention_planning'],
      model: 'claude',
      maxTokens: 1000,
      temperature: 0.6,
      systemPrompt: `You are a specialist in educational psychology and behaviour analysis. Analyse behaviour patterns to:
      - Identify triggers and underlying causes
      - Recognise early warning signs
      - Suggest evidence-based interventions
      - Focus on understanding and support over punishment
      - Recommend when to involve additional professionals`
    },

    parentCommunicator: {
      name: 'Parent Communication Agent',
      description: 'Professional parent communication',
      capabilities: ['email_composition', 'tone_adaptation', 'relationship_building'],
      model: 'claude',
      maxTokens: 400,
      temperature: 0.7,
      systemPrompt: `You are a skilled educational communicator specializing in parent-teacher relationships. Write communications that:
      - Use appropriate professional tone
      - Focus on partnership and support
      - Provide specific, actionable information
      - Maintain confidentiality and sensitivity
      - Encourage ongoing dialogue`
    },

    assessmentEvaluator: {
      name: 'Assessment Evaluator Agent',
      description: 'Intelligent assessment and feedback',
      capabilities: ['assessment_analysis', 'feedback_generation', 'progress_evaluation'],
      model: 'hybrid',
      maxTokens: 600,
      temperature: 0.5,
      systemPrompt: `You are an assessment specialist with deep knowledge of educational measurement. Provide:
      - Accurate, reliable assessment results
      - Constructive, personalized feedback
      - Clear learning objective alignment
      - Growth mindset encouragement
      - Specific improvement strategies`
    },

    curriculumAdvisor: {
      name: 'Curriculum Advisor Agent',
      description: 'Personalized curriculum recommendations',
      capabilities: ['curriculum_mapping', 'personalization', 'progression_planning'],
      model: 'claude',
      maxTokens: 800,
      temperature: 0.6,
      systemPrompt: `You are a curriculum specialist who understands individual learning needs. Recommend:
      - Personalized learning pathways
      - Appropriate challenge levels
      - Prerequisite skill development
      - Interest-based learning opportunities
      - Long-term progression planning`
    },

    accessibilitySpecialist: {
      name: 'Accessibility Specialist Agent',
      description: 'Universal accessibility solutions',
      capabilities: ['accessibility_audit', 'accommodation_planning', 'inclusive_design'],
      model: 'claude',
      maxTokens: 500,
      temperature: 0.4,
      systemPrompt: `You are an accessibility expert ensuring educational equity. Focus on:
      - WCAG 2.1 AA compliance
      - Multiple accommodation strategies
      - Universal design principles
      - Assistive technology recommendations
      - Inclusive assessment methods`
    },

    researchAssistant: {
      name: 'Research Assistant Agent',
      description: 'Literature analysis and research support',
      capabilities: ['literature_review', 'methodology_advice', 'data_analysis'],
      model: 'xai',
      maxTokens: 1200,
      temperature: 0.3,
      systemPrompt: `You are a research methodology expert and literature specialist. Provide:
      - Comprehensive literature reviews
      - Methodological guidance
      - Statistical analysis support
      - Research design recommendations
      - Evidence-based practice insights`
    },

    wellbeingMonitor: {
      name: 'Wellbeing Monitor Agent',
      description: 'Teacher and student wellbeing support',
      capabilities: ['stress_detection', 'wellbeing_assessment', 'support_planning'],
      model: 'claude',
      maxTokens: 400,
      temperature: 0.6,
      systemPrompt: `You are a wellbeing specialist focused on educational community health. Monitor and support:
      - Signs of stress and burnout
      - Mental health indicators
      - Work-life balance strategies
      - Resilience building techniques
      - Professional development opportunities`
    },

    gamificationDesigner: {
      name: 'Gamification Designer Agent',
      description: 'Engagement and motivation design',
      capabilities: ['game_design', 'motivation_theory', 'engagement_strategy'],
      model: 'claude',
      maxTokens: 700,
      temperature: 0.8,
      systemPrompt: `You are a gamification expert who understands educational motivation. Design:
      - Intrinsic motivation systems
      - Progressive challenge structures
      - Meaningful reward mechanisms
      - Social learning opportunities
      - Achievement frameworks that build confidence`
    },

    dataAnalyst: {
      name: 'Data Analyst Agent',
      description: 'Educational data analysis and insights',
      capabilities: ['data_visualization', 'trend_analysis', 'predictive_modeling'],
      model: 'openai',
      maxTokens: 600,
      temperature: 0.4,
      systemPrompt: `You are an educational data scientist specializing in learning analytics. Analyze:
      - Learning pattern identification
      - Progress trend analysis
      - Predictive performance modeling
      - Intervention effectiveness measurement
      - Data-driven decision support`
    },

    contentCreator: {
      name: 'Content Creator Agent',
      description: 'Educational content generation',
      capabilities: ['content_creation', 'multimedia_design', 'curriculum_alignment'],
      model: 'hybrid',
      maxTokens: 1000,
      temperature: 0.7,
      systemPrompt: `You are a content creation specialist with deep educational knowledge. Create:
      - Engaging, curriculum-aligned content
      - Multiple representation formats
      - Differentiated learning materials
      - Assessment-integrated resources
      - Culturally responsive materials`
    },

    collaborationFacilitator: {
      name: 'Collaboration Facilitator Agent',
      description: 'Team and community building',
      capabilities: ['group_dynamics', 'communication_facilitation', 'conflict_resolution'],
      model: 'claude',
      maxTokens: 500,
      temperature: 0.7,
      systemPrompt: `You are a collaboration expert who builds educational communities. Facilitate:
      - Effective team communication
      - Collaborative problem-solving
      - Community building activities
      - Conflict resolution strategies
      - Shared goal achievement`
    },

    // Continue with remaining 11 agents...
    neuroconnectAnalyst: {
      name: 'NeuroConnect Analyst Agent',
      description: 'Brain activity and cognitive analysis',
      capabilities: ['neurofeedback_analysis', 'cognitive_load_monitoring', 'attention_tracking'],
      model: 'claude',
      maxTokens: 600,
      temperature: 0.5,
      systemPrompt: `You are a neuroeducational specialist analyzing brain activity patterns. Provide insights on:
      - Cognitive load during learning tasks
      - Attention and focus patterns
      - Memory formation indicators
      - Optimal learning conditions
      - Personalized cognitive strategies`
    },

    restorativeJusticeCoordinator: {
      name: 'Restorative Justice Coordinator Agent',
      description: 'Conflict resolution and restorative practices',
      capabilities: ['conflict_resolution', 'relationship_repair', 'community_building'],
      model: 'claude',
      maxTokens: 400,
      temperature: 0.6,
      systemPrompt: `You are a restorative justice specialist in educational settings. Coordinate:
      - Conflict resolution processes
      - Relationship repair strategies
      - Community circle facilitation
      - Accountability and responsibility development
      - Healing and growth opportunities`
    },

    multilingualSupport: {
      name: 'Multilingual Support Agent',
      description: 'Multi-language educational support',
      capabilities: ['translation', 'cultural_adaptation', 'language_learning'],
      model: 'openai',
      maxTokens: 800,
      temperature: 0.7,
      systemPrompt: `You are a multilingual education specialist supporting diverse learners. Provide:
      - Accurate translations of educational content
      - Culturally responsive adaptations
      - Language learning support
      - Multilingual assessment accommodations
      - Cross-cultural communication facilitation`
    },

    specialEducationCoordinator: {
      name: 'Special Education Coordinator Agent',
      description: 'SEND support and coordination',
      capabilities: ['iep_development', 'accommodation_planning', 'progress_monitoring'],
      model: 'claude',
      maxTokens: 700,
      temperature: 0.5,
      systemPrompt: `You are a special educational needs specialist. Coordinate comprehensive support including:
      - Individualized Education Program development
      - Multi-agency collaboration
      - Progress monitoring and adjustment
      - Evidence-based intervention strategies
      - Family partnership facilitation`
    },

    careerGuidanceCounselor: {
      name: 'Career Guidance Counselor Agent',
      description: 'Career and future planning support',
      capabilities: ['career_assessment', 'pathway_planning', 'skill_development'],
      model: 'claude',
      maxTokens: 600,
      temperature: 0.7,
      systemPrompt: `You are a career guidance specialist supporting student futures. Provide:
      - Career interest assessments
      - Educational pathway planning
      - Skill development recommendations
      - Work experience opportunities
      - Future-ready preparation strategies`
    },

    mentalHealthSupport: {
      name: 'Mental Health Support Agent',
      description: 'Mental health and wellbeing support',
      capabilities: ['mh_assessment', 'crisis_intervention', 'wellbeing_promotion'],
      model: 'claude',
      maxTokens: 300,
      temperature: 0.4,
      systemPrompt: `You are a mental health professional specializing in educational settings. Provide:
      - Early intervention strategies
      - Wellbeing promotion activities
      - Crisis response coordination
      - Mental health literacy education
      - Support network development`
    },

    stemSpecialist: {
      name: 'STEM Specialist Agent',
      description: 'Science, technology, engineering, and mathematics support',
      capabilities: ['stem_curriculum', 'project_based_learning', 'skill_development'],
      model: 'openai',
      maxTokens: 900,
      temperature: 0.6,
      systemPrompt: `You are a STEM education specialist. Design and support:
      - Inquiry-based learning experiences
      - Project-based STEM activities
      - Computational thinking development
      - Real-world STEM applications
      - Interdisciplinary STEM integration`
    },

    artsIntegrationSpecialist: {
      name: 'Arts Integration Specialist Agent',
      description: 'Arts education and integration',
      capabilities: ['arts_curriculum', 'creative_expression', 'cultural_education'],
      model: 'claude',
      maxTokens: 700,
      temperature: 0.8,
      systemPrompt: `You are an arts integration specialist enhancing learning through creativity. Facilitate:
      - Arts-infused curriculum development
      - Creative expression opportunities
      - Cultural arts education
      - Interdisciplinary arts connections
      - Artistic skill development`
    },

    physicalEducationCoordinator: {
      name: 'Physical Education Coordinator Agent',
      description: 'Physical education and health support',
      capabilities: ['pe_curriculum', 'health_education', 'physical_activity'],
      model: 'claude',
      maxTokens: 500,
      temperature: 0.6,
      systemPrompt: `You are a physical education and health specialist. Coordinate:
      - Comprehensive physical education programs
      - Health and wellness education
      - Inclusive physical activity opportunities
      - Motor skill development
      - Healthy lifestyle promotion`
    },

    libraryMediaSpecialist: {
      name: 'Library Media Specialist Agent',
      description: 'Information literacy and resource management',
      capabilities: ['information_literacy', 'resource_curation', 'research_skills'],
      model: 'openai',
      maxTokens: 600,
      temperature: 0.5,
      systemPrompt: `You are an information literacy specialist and library media expert. Develop:
      - Research and information skills
      - Digital citizenship education
      - Resource evaluation and curation
      - Information ethics and privacy
      - Lifelong learning strategies`
    },

    environmentalEducationCoordinator: {
      name: 'Environmental Education Coordinator Agent',
      description: 'Sustainability and environmental education',
      capabilities: ['environmental_curriculum', 'sustainability_education', 'outdoor_learning'],
      model: 'claude',
      maxTokens: 600,
      temperature: 0.7,
      systemPrompt: `You are an environmental education specialist. Coordinate learning about:
      - Environmental stewardship
      - Sustainability practices
      - Climate change education
      - Outdoor and experiential learning
      - Community environmental action`
    },

    digitalCitizenshipEducator: {
      name: 'Digital Citizenship Educator Agent',
      description: 'Digital literacy and citizenship education',
      capabilities: ['digital_literacy', 'online_safety', 'digital_ethics'],
      model: 'claude',
      maxTokens: 500,
      temperature: 0.5,
      systemPrompt: `You are a digital citizenship and online safety specialist. Educate about:
      - Responsible digital behaviour
      - Online safety and privacy
      - Digital communication ethics
      - Information verification skills
      - Positive digital community participation`
    }
  };

  async processRequest(request: AIRequest): Promise<AIResponse> {
    const startTime = performance.now();

    // Repo-enforced policy: this product must not use end-user queries to train future AI models.
    // (If this ever changes, it must be an explicit, audited governance decision.)
    if (AI_DATA_USE_POLICY.trainOnStudentQueries !== false) {
      throw new Error('AI data-use policy violation: training on student queries is forbidden');
    }

    // Check rate limits (only if Redis is available)
    if (this.redis) {
      const rateLimitKey = `rate_limit:${request.id}:${new Date().toDateString()}`;
      const currentUsage = await this.redis.incr(rateLimitKey);
      const limit = this.getRateLimit(request.subscriptionTier);

      if (currentUsage > limit) {
        throw new Error('Daily AI request limit exceeded. Upgrade your plan for more.');
      }
    }

    // Select appropriate agent
    const agent = this.selectAgent(request.useCase);
    if (!agent) {
      throw new Error(`No suitable agent found for use case: ${request.useCase}`);
    }

    // Privacy guard: redact PII before it can leave our boundary (best-effort).
    const shouldRedactPII =
      request.redactPII ?? (process.env.NODE_ENV === 'production');

    const promptForProvider = shouldRedactPII
      ? redactPII(request.prompt, { entities: request.piiEntities }).redactedText
      : request.prompt;

    // Check cache (only if Redis is available). Cache keys are derived from the prompt
    // actually sent to providers (redacted when enabled).
    const cacheKey = this.generateCacheKey({
      prompt: promptForProvider,
      useCase: request.useCase,
      context: request.context,
    });
    const cached = this.redis ? await this.redis.get(cacheKey) : null;
    if (cached && this.shouldUseCache(request.subscriptionTier)) {
      return {
        response: cached as string,
        model: 'cache',
        cost: 0,
        tokens: 0,
        fromCache: true,
        processingTime: performance.now() - startTime,
      };
    }

    // Check budget (fix precedence bug)
    const estimatedCost = this.estimateCost(promptForProvider, agent.model);
    if (((this.dailyUsage.get(request.id) || 0) + estimatedCost) > this.dailyBudget) {
      // Try fallback to cached or simpler response
      return this.handleBudgetExceeded(request);
    }

    try {
      // Generate response
      const response = await this.callAI(agent, {
        ...request,
        // Ensure downstream providers always see the redacted prompt when enabled.
        prompt: promptForProvider,
      });

      // Track costs and usage
      const actualCost = this.calculateCost(response, agent.model);
      this.dailyUsage.set(request.id, (this.dailyUsage.get(request.id) || 0) + actualCost);

      await this.trackUsage(request.id, actualCost, request.useCase);

      // Cache response (only if Redis is available)
      if (this.redis && this.shouldCache(request.useCase)) {
        await this.redis.setex(
          cacheKey,
          this.getCacheTTL(request.subscriptionTier),
          response.content
        );
      }

      // SAFETY NET: Log to Audit Service
      // Redact again defensively (AI may echo PII if provided in prompt/context).
      const auditInput = shouldRedactPII
        ? redactPII(request.prompt, { entities: request.piiEntities }).redactedText
        : request.prompt;
      const auditOutput = shouldRedactPII
        ? redactPII(response.content, { entities: request.piiEntities }).redactedText
        : response.content;

      await aiAuditService.logDecision({
        agentId: agent.name,
        userId: request.id,
        tenantId: request.tenantId || 'unknown',
        action: request.useCase,
        input: auditInput,
        output: auditOutput,
        confidenceScore: 0.95, // Mock confidence for now
        autonomyLevel: request.autonomyLevel || 'advisory',
        humanReviewRequired: request.autonomyLevel === 'advisory'
      });

      return {
        response: response.content,
        model: agent.model,
        cost: actualCost,
        tokens: response.tokens,
        fromCache: false,
        processingTime: performance.now() - startTime
      };

    } catch (_error) {
      // Fallback to alternative provider
      return this.handleFailover(request, _error instanceof Error ? _error : new Error(String(_error)));
    }
  }

  private selectAgent(useCase: string): AgentConfig | null {
    // Map use cases to agents
    const agentMapping: Record<string, string> = {
      'report_writing': 'reportWriter',
      'lesson_planning': 'lessonPlanner',
      'behavior_analysis': 'behaviorAnalyst',
      'parent_communication': 'parentCommunicator',
      'assessment': 'assessmentEvaluator',
      'curriculum_advice': 'curriculumAdvisor',
      'accessibility': 'accessibilitySpecialist',
      'research': 'researchAssistant',
      'wellbeing': 'wellbeingMonitor',
      'gamification': 'gamificationDesigner',
      'data_analysis': 'dataAnalyst',
      'content_creation': 'contentCreator',
      'collaboration': 'collaborationFacilitator',
      'neuroconnect': 'neuroconnectAnalyst',
      'restorative_practices': 'restorativeJusticeCoordinator',
      'multilingual': 'multilingualSupport',
      'special_education': 'specialEducationCoordinator',
      'career_guidance': 'careerGuidanceCounselor',
      'mental_health': 'mentalHealthSupport',
      'stem': 'stemSpecialist',
      'arts': 'artsIntegrationSpecialist',
      'physical_education': 'physicalEducationCoordinator',
      'library': 'libraryMediaSpecialist',
      'environmental': 'environmentalEducationCoordinator',
      'digital_citizenship': 'digitalCitizenshipEducator'
    };

    const agentKey = agentMapping[useCase];
    return agentKey ? this.agents[agentKey] : null;
  }

  private async callAI(agent: AgentConfig, request: AIRequest): Promise<{ content: string; tokens: number }> {
    // Check if any API clients are available
    if (!this.anthropic && !this.openai && !this.xai && !this.gemini) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('AI providers unavailable');
      }
      return this.getUnavailableResponse(agent);
    }

    try {
      if (agent.model === 'xai' && this.xai) {
        return await this.callXAI(agent, request);
      }

      if ((agent.model === 'claude' || agent.model === 'hybrid') && this.anthropic) {
        return await this.callAnthropic(agent, request);
      }

      if (this.openai) {
        return await this.callOpenAI(agent, request);
      }
      
      // If we get here, the requested model client isn't available, try any available client
      if (this.anthropic) return await this.callAnthropic(agent, request);
      if (this.openai) return await this.callOpenAI(agent, request);
      if (this.gemini) return await this.callGemini(agent, request);
      
      // Fallback to demo response if no providers are available
      return this.getUnavailableResponse(agent, request.prompt);
    } catch (_error) {
      console.warn(`Primary model ${agent.model} failed, attempting failover...`, _error);
      
      // Try failover to OpenAI if available and not already tried
      if (agent.model !== 'openai' && this.openai) {
        try {
          return await this.callOpenAI(agent, request);
        } catch (fallbackError) {
          console.error('Fallback to OpenAI also failed:', fallbackError);
        }
      }

      // Try failover to Gemini if available
      if (this.gemini) {
        try {
          return await this.callGemini(agent, request);
        } catch (fallbackError) {
          console.error('Fallback to Gemini also failed:', fallbackError);
        }
      }
      
      // Final fallback
      return this.getUnavailableResponse(agent, request.prompt);
    }
  }

  private getUnavailableResponse(agent: AgentConfig, prompt?: string): { content: string; tokens: number } {
    if (prompt) {
      const demo = getDemoResponse(prompt);
      return {
        content: demo.content,
        tokens: 200
      };
    }
    return {
      content: `AI is not configured for this environment. Please set the required provider API key(s) to enable ${agent.name}.`,
      tokens: 0
    };
  }

  private async callAnthropic(agent: AgentConfig, request: AIRequest): Promise<{ content: string; tokens: number }> {
    if (!this.anthropic) throw new Error('Anthropic client not initialized');
    
    const response = await this.anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: agent.maxTokens,
      temperature: agent.temperature,
      system: agent.systemPrompt,
      messages: [{ role: 'user', content: request.prompt }],
    });

    return {
      content: response.content[0].type === 'text' ? response.content[0].text : '',
      tokens: response.usage.output_tokens
    };
  }

  private async callOpenAI(agent: AgentConfig, request: AIRequest): Promise<{ content: string; tokens: number }> {
    if (!this.openai) throw new Error('OpenAI client not initialized');

    const response = await this.openai.chat.completions.create({
      model: request.model || getDefaultOpenAIModel(),
      messages: [
        { role: 'system', content: agent.systemPrompt },
        { role: 'user', content: request.prompt }
      ],
      max_tokens: agent.maxTokens,
      temperature: agent.temperature,
    });

    return {
      content: response.choices[0].message.content || '',
      tokens: response.usage?.total_tokens || 0
    };
  }

  private async callXAI(agent: AgentConfig, request: AIRequest): Promise<{ content: string; tokens: number }> {
    if (!this.xai) throw new Error('xAI client not initialized');

    const response = await this.xai.chat.completions.create({
      model: 'grok-beta',
      messages: [
        { role: 'system', content: agent.systemPrompt },
        { role: 'user', content: request.prompt }
      ],
      max_tokens: agent.maxTokens,
      temperature: agent.temperature,
    });

    return {
      content: response.choices[0].message.content || '',
      tokens: response.usage?.total_tokens || 0
    };
  }

  private async callGemini(agent: AgentConfig, request: AIRequest): Promise<{ content: string; tokens: number }> {
    if (!this.gemini) throw new Error('Gemini client not initialized');

    const response = await this.gemini.chat.completions.create({
      model: 'gemini-1.5-flash',
      messages: [
        { role: 'system', content: agent.systemPrompt },
        { role: 'user', content: request.prompt }
      ],
      max_tokens: agent.maxTokens,
      temperature: agent.temperature,
    });

    return {
      content: response.choices[0].message.content || '',
      tokens: response.usage?.total_tokens || 0
    };
  }

  private generateCacheKey(params: { prompt: string; useCase: string; context?: unknown }): string {
    const hash = createHash('sha256');
    hash.update(JSON.stringify({
      prompt: params.prompt,
      useCase: params.useCase,
      context: params.context ?? null,
    }));
    return `ai_cache:${hash.digest('hex')}`;
  }

  private getRateLimit(tier: string): number {
    const limits: Record<string, number> = {
      'standard': 50,
      'professional': 500,
      'enterprise': 9999,
      'research': 200
    };
    return limits[tier] || 50;
  }

  private getCacheTTL(tier: string): number {
    const ttls: Record<string, number> = {
      'standard': 86400,    // 24 hours
      'professional': 43200, // 12 hours
      'enterprise': 3600,    // 1 hour
      'research': 21600      // 6 hours
    };
    return ttls[tier] || 86400;
  }

  private shouldUseCache(tier: string): boolean {
    return tier !== 'enterprise'; // Enterprise gets fresh responses
  }

  private shouldCache(useCase: string): boolean {
    const cacheable = ['lesson_planning', 'content_creation', 'assessment'];
    return cacheable.includes(useCase);
  }

  private estimateCost(prompt: string, model: string): number {
    const tokens = Math.ceil(prompt.length / 4); // Rough estimation
    const costPerToken = model.includes('claude') ? 0.000015 : 0.00003;
    return tokens * costPerToken;
  }

  private calculateCost(response: { tokens?: number }, model: string): number {
    const tokens = response.tokens || 0;
    const costPerToken = model.includes('claude') ? 0.000015 : 0.00003;
    return tokens * costPerToken;
  }

  private async trackUsage(id: string, cost: number, useCase: string): Promise<void> {
    // Track in Redis for real-time monitoring (only if Redis is available)
    if (this.redis) {
      await this.redis.hincrby(`usage:${id}:${new Date().toDateString()}`, 'cost', cost);
      await this.redis.hincrby(`usage:${id}:${new Date().toDateString()}`, 'requests', 1);
      await this.redis.hincrby(`usage:${id}:${new Date().toDateString()}`, useCase, 1);
    }
  }

  private async handleBudgetExceeded(request: AIRequest): Promise<AIResponse> {
    // Try to find cached response (only if Redis is available)
    if (this.redis) {
      const shouldRedactPII =
        request.redactPII ?? (process.env.NODE_ENV === 'production');

      const promptForProvider = shouldRedactPII
        ? redactPII(request.prompt, { entities: request.piiEntities }).redactedText
        : request.prompt;

      const cacheKey = this.generateCacheKey({
        prompt: promptForProvider,
        useCase: request.useCase,
        context: request.context,
      });
      const cached = await this.redis.get(cacheKey);

      if (cached) {
      return {
        response: cached as string,
        model: 'cache',
        cost: 0,
        tokens: 0,
        fromCache: true,
        processingTime: 0
      };
      }
    }

    // Return helpful message
    return {
      response: "You've reached your daily AI usage limit. Consider upgrading your plan for unlimited access, or try again tomorrow.",
      model: 'system',
      cost: 0,
      tokens: 0,
      fromCache: false,
      processingTime: 0
    };
  }

  private async handleFailover(request: AIRequest, error: Error): Promise<AIResponse> {
    console.error('AI service error for request:', { useCase: request.useCase, id: request.id }, error.message);

    // Attempt to provide a high-quality demo response as a final fallback
    try {
      const demo = getDemoResponse(request.prompt);
      return {
        response: demo.content,
        model: 'demo-fallback',
        cost: 0,
        tokens: 0,
        fromCache: false,
        processingTime: 0
      };
    } catch (e) {
      // If even that fails, return the generic error
      return {
        response: "I'm experiencing technical difficulties. Please try again in a moment, or contact support if the issue persists.",
        model: 'error',
        cost: 0,
        tokens: 0,
        fromCache: false,
        processingTime: 0
      };
    }
  }

  // Public methods for agent management
  getAvailableAgents(): string[] {
    return Object.keys(this.agents);
  }

  getAgentConfig(agentName: string): AgentConfig | null {
    return this.agents[agentName] || null;
  }

  async getUsageStats(id: string): Promise<any> {
    if (!this.redis) {
      return {};
    }
    const date = new Date().toDateString();
    const usage = await this.redis.hgetall(`usage:${id}:${date}`);
    return usage || {};
  }
}

// Export singleton instance
export const aiService = new AIIntegrationService();

// ============================================================================
// Conversational AI Chat Interface
// ============================================================================

/**
 * Chat message format for multi-turn conversations
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Chat request format for Study Buddy agents
 */
export interface ChatRequest {
  agentId: string;
  messages: ChatMessage[];
  systemPrompt: string;
  userId: number | string;
  tenantId: number | string;
  /**
   * When true, redact likely PII before sending to third-party AI providers.
   * If omitted, defaults apply inside the AI service.
   */
  redactPII?: boolean;
  /**
   * Optional explicit entity strings (names/identifiers) to redact.
   */
  piiEntities?: string[];
  maxTokens?: number;
  temperature?: number;
}

/**
 * Chat response format with cost tracking
 */
export interface ChatResponse {
  content: string;
  tokensUsed: number;
  estimatedCost: number;
  model: string;
  responseTime: number;
}

/**
 * Conversational AI Integration Service
 * Provides multi-turn chat interface for Study Buddy agents
 * Aligns with "invisible AI" strategy - seamless, context-aware responses
 */
class AIIntegration {
  /**
   * Multi-turn conversational chat with context preservation
   * Maps to existing agent configurations and AI service
   *
   * @param request Chat request with conversation history
   * @returns AI response with cost and performance metrics
   *
   * @example
   * ```typescript
   * const response = await aiIntegration.chat({
   *   agentId: 'report-writer',
   *   messages: [
   *     { role: 'user', content: 'Help me write a student report' },
   *     { role: 'assistant', content: 'I'll help you...' },
   *     { role: 'user', content: 'Focus on reading progress' }
   *   ],
   *   systemPrompt: 'You are a report writing specialist...',
   *   userId: 123,
   *   tenantId: 456
   * });
   * ```
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const startTime = performance.now();

    try {
      // Build conversation context from message history
      const conversationContext = request.messages
        .filter(m => m.role !== 'system')
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n\n');

      // Get last user message for AI request
      const lastUserMessage = request.messages
        .filter(m => m.role === 'user')
        .pop()?.content || '';

      // Map agentId to use case for existing AI service
      const useCase = this.mapAgentToUseCase(request.agentId);

      // Create AI request using existing service format
      const aiRequest: AIRequest = {
        prompt: conversationContext ? `${conversationContext}\n\nUser: ${lastUserMessage}` : lastUserMessage,
        context: {
          conversationHistory: request.messages,
          systemPrompt: request.systemPrompt,
          agentId: request.agentId
        },
        id: request.userId.toString(),
        tenantId: request.tenantId.toString(),
        autonomyLevel: 'advisory', // Default to advisory for chat
        subscriptionTier: 'professional', // Default for educational psychologists
        useCase: useCase,
        maxTokens: request.maxTokens || 800,
        temperature: request.temperature || 0.7,
        redactPII: request.redactPII,
        piiEntities: request.piiEntities,
      };

      // Process request through existing AI service
      const response = await aiService.processRequest(aiRequest);

      const responseTime = performance.now() - startTime;

      return {
        content: response.response,
        tokensUsed: response.tokens,
        estimatedCost: response.cost,
        model: response.model,
        responseTime: responseTime
      };
    } catch (_error) {
      console.error('[aiIntegration] Chat error:', _error);

      // Return graceful _error response
      return {
        content: "I'm experiencing technical difficulties. Please try again in a moment, or contact support if the issue persists.",
        tokensUsed: 0,
        estimatedCost: 0,
        model: 'error',
        responseTime: performance.now() - startTime
      };
    }
  }

  /**
   * Maps Study Buddy agent IDs to existing AI service use cases
   * Ensures consistent behavior across the platform
   *
   * @param agentId Study Buddy agent identifier
   * @returns Corresponding use case for AI service
   */
  private mapAgentToUseCase(agentId: string): string {
    const mapping: Record<string, string> = {
      'general-assistant': 'content_creation',
      'report-writer': 'report_writing',
      'lesson-planner': 'lesson_planning',
      'behavior-analyst': 'behavior_analysis',
      'parent-communication': 'parent_communication',
      'assessment-evaluator': 'assessment',
      'intervention-designer': 'special_education',
      'cpd-companion': 'research',
      'wellbeing-monitor': 'wellbeing',
      'curriculum-advisor': 'curriculum_advice',
      'accessibility-specialist': 'accessibility',
      'data-analyst': 'data_analysis',
      'collaboration-facilitator': 'collaboration',
      'neuroconnect-analyst': 'neuroconnect',
      'restorative-justice': 'restorative_practices',
      'multilingual-support': 'multilingual',
      'special-education-coordinator': 'special_education',
      'career-guidance': 'career_guidance',
      'mental-health-support': 'mental_health',
      'stem-specialist': 'stem',
      'arts-integration': 'arts',
      'physical-education': 'physical_education',
      'library-media': 'library',
      'environmental-education': 'environmental',
      'digital-citizenship': 'digital_citizenship'
    };

    return mapping[agentId] || 'content_creation';
  }
}

// Export singleton instance for chat interface
export const aiIntegration = new AIIntegration();

// Export types and utilities
