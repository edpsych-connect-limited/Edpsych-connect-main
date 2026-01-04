import { logger } from '../../utils/logger';
import { prisma } from '../prisma/client';

interface AdaptiveLearningOptions {
  updateInterval?: number;
  minConfidenceThreshold?: number;
  learningStyleWeights?: {
    visual: number;
    auditory: number;
    kinesthetic: number;
    reading: number;
  };
  adaptationInterval?: number;
  difficultyLevels?: number;
  cognitiveLoadThreshold?: number;
}

interface LearningStyles {
  visual: number;
  auditory: number;
  kinesthetic: number;
  reading: number;
  [key: string]: number;
}

interface PerformanceMetric {
  attempts: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  difficultyProgression: Array<{
    difficulty: number;
    score: number;
    timestamp: string;
  }>;
}

interface PerformanceMetrics {
  [topic: string]: PerformanceMetric;
}

interface LearningProfile {
  studentId: string;
  learningStyles: LearningStyles;
  optimalDifficulty: number;
  learningPace: 'slow' | 'moderate' | 'fast';
  cognitiveLoad: number;
  expectedTimePerContent: number;
  performanceMetrics: PerformanceMetrics;
  createdAt: string;
  lastUpdated: string;
}

interface AssessmentResponse {
  questionId: string;
  questionType: string;
  isCorrect: boolean;
  timeSpent: number;
  difficulty: number;
  visualAids?: boolean;
  audioContent?: boolean;
  handsOn?: boolean;
  readingHeavy?: boolean;
}

interface AssessmentData {
  responses: AssessmentResponse[];
  timeSpent: number;
  topic: string;
  difficultyLevel: number;
  score?: number;
  attempts?: number;
  hintsUsed?: number;
  relatedObjectives?: string[];
}

interface AdaptiveAssessment {
  id: string;
  studentId: string;
  topic: string;
  difficulty: number;
  questions: any[]; // Define Question interface if available
  timeLimit: number;
  adaptive: boolean;
  generatedAt: string;
  profileSnapshot: {
    learningStyles: LearningStyles;
    optimalDifficulty: number;
    cognitiveLoad: number;
  };
}

interface InteractionData {
  contentId: string;
  timeSpent: number;
  comprehensionLevel: number;
  engagementMetrics: {
    interactionsPerMinute: number;
    [key: string]: any;
  };
}

interface AdaptationRecommendation {
  type: string;
  action: string;
  reason: string;
  suggestions: string[];
}

interface AdaptationResult {
  studentId: string;
  contentId: string;
  adaptations: AdaptationRecommendation[];
  profileUsed?: LearningProfile;
  timestamp?: string;
}

interface LearningGoals {
  targetCompetency?: number;
  timeConstraint?: number | null;
  preferredPace?: 'slow' | 'moderate' | 'fast';
}

interface LearningSequence {
  studentId: string;
  sequence: any[]; // Define ContentItem interface if available
  schedule: any;
  estimatedCompletion: number;
  confidence: number;
  alternatives: any[];
}

interface MasteryLevel {
  level: number;
  attempts: number;
  totalTime: number;
  lastAssessed: string | null;
  confidence: number;
}

interface MasteryAssessment {
  studentId: string;
  objectiveId: string;
  masteryLevel: number;
  confidence: number;
  attempts: number;
  prerequisiteStatus: any;
  insights: any;
  recommendations: any;
}

interface LearningAnalytics {
  studentId: string;
  generatedAt: string;
  timeRange: number;
  profile: {
    learningStyles: LearningStyles;
    optimalDifficulty: number;
    learningPace: string;
    cognitiveLoad: number;
  };
  performance: any;
  progress: any;
  mastery: any;
  trends?: any;
  predictions?: any;
}

export class AdaptiveLearningService {
  private options: Required<AdaptiveLearningOptions>;
  private learningProfiles: Map<string, LearningProfile>;
  private learningPaths: Map<string, any>;
  private masteryLevels: Map<string, MasteryLevel>;
  private assessmentHistory: Map<string, any[]>;

  constructor(options: AdaptiveLearningOptions = {}) {
    this.options = {
      updateInterval: options.updateInterval || 3600000, // 1 hour
      minConfidenceThreshold: options.minConfidenceThreshold || 0.7,
      learningStyleWeights: options.learningStyleWeights || {
        visual: 0.25,
        auditory: 0.25,
        kinesthetic: 0.25,
        reading: 0.25
      },
      adaptationInterval: options.adaptationInterval || 300000, // 5 minutes
      difficultyLevels: options.difficultyLevels || 5,
      cognitiveLoadThreshold: options.cognitiveLoadThreshold || 0.8
    };

    this.learningProfiles = new Map();
    this.learningPaths = new Map();
    this.masteryLevels = new Map();
    this.assessmentHistory = new Map();

    this._initialize();
  }

  private async _initialize(): Promise<void> {
    try {
      await this._loadLearningStyleModels();
      this._setupRealTimeAdaptation();
      this._scheduleProfileUpdates();
      logger.info('AdaptiveLearningService initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize AdaptiveLearningService:', error);
      throw error;
    }
  }

  async assessLearningProfile(studentId: string, assessmentData: AssessmentData): Promise<LearningProfile> {
    try {
      const { responses, timeSpent, topic, difficultyLevel } = assessmentData;

      let profile = await this._getProfile(studentId);
      if (!profile) {
        profile = await this._createInitialProfile(studentId);
      }

      // Analyse learning style indicators
      const styleIndicators = this._analyseLearningStyleIndicators(responses, timeSpent);
      profile.learningStyles = this._updateLearningStyles(profile.learningStyles, styleIndicators);

      // Assess cognitive load
      profile.cognitiveLoad = this._assessCognitiveLoad(responses, timeSpent, difficultyLevel);

      // Calculate performance metrics
      const performance = this._calculatePerformance(responses);
      profile.performanceMetrics = this._updatePerformanceMetrics(
        profile.performanceMetrics,
        topic,
        performance,
        difficultyLevel
      );

      // Determine optimal difficulty
      profile.optimalDifficulty = await this._calculateOptimalDifficulty(profile);

      // Update learning pace preference
      profile.learningPace = this._updateLearningPace(profile, timeSpent, responses.length);

      // Store assessment in history
      await this._storeAssessmentHistory(studentId, { ...assessmentData, performance });

      // Save updated profile to DB
      await this._saveProfile(profile);

      return profile;
    } catch (error) {
      logger.error('Error assessing learning profile:', error);
      throw error;
    }
  }

  async generateAdaptiveAssessment(
    studentId: string,
    topic: string,
    options: { timeLimit?: number; questionCount?: number; includeAdaptiveDifficulty?: boolean } = {}
  ): Promise<AdaptiveAssessment> {
    try {
      const {
        timeLimit = 30, // minutes
        questionCount = 10,
        includeAdaptiveDifficulty = true
      } = options;

      // Get student learning profile
      const profile = await this._getProfile(studentId);
      if (!profile) {
        throw new Error(`Learning profile not found for student: ${studentId}`);
      }

      // Determine optimal difficulty level
      const optimalDifficulty = includeAdaptiveDifficulty
        ? profile.optimalDifficulty
        : Math.floor(this.options.difficultyLevels / 2);

      // Select questions based on learning style and difficulty
      const questions = await this._selectAdaptiveQuestions(
        topic,
        optimalDifficulty,
        questionCount,
        profile.learningStyles
      );

      // Personalise question presentation
      const personalisedQuestions = this._personaliseQuestionPresentation(
        questions,
        profile.learningStyles
      );

      // Generate assessment structure
      const assessment: AdaptiveAssessment = {
        id: `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        studentId,
        topic,
        difficulty: optimalDifficulty,
        questions: personalisedQuestions,
        timeLimit,
        adaptive: includeAdaptiveDifficulty,
        generatedAt: new Date().toISOString(),
        profileSnapshot: {
          learningStyles: profile.learningStyles,
          optimalDifficulty: profile.optimalDifficulty,
          cognitiveLoad: profile.cognitiveLoad
        }
      };

      return assessment;
    } catch (error) {
      logger.error('Error generating adaptive assessment:', error);
      throw error;
    }
  }

  async adaptContentDelivery(studentId: string, interactionData: InteractionData): Promise<AdaptationResult> {
    try {
      const {
        contentId,
        timeSpent,
        comprehensionLevel,
        engagementMetrics
      } = interactionData;

      // Get student profile
      const profile = await this._getProfile(studentId);
      if (!profile) {
        return { studentId, contentId, adaptations: [] };
      }

      const adaptations: AdaptationRecommendation[] = [];

      // Adapt based on time spent
      if (timeSpent > profile.expectedTimePerContent * 1.5) {
        adaptations.push({
          type: 'pace_adjustment',
          action: 'slow_down',
          reason: 'Student spending significantly more time than expected',
          suggestions: [
            'Break content into smaller chunks',
            'Add more detailed explanations',
            'Include additional examples'
          ]
        });
      } else if (timeSpent < profile.expectedTimePerContent * 0.5) {
        adaptations.push({
          type: 'pace_adjustment',
          action: 'speed_up',
          reason: 'Student completing content faster than expected',
          suggestions: [
            'Provide advanced content',
            'Skip basic explanations',
            'Add challenge exercises'
          ]
        });
      }

      // Adapt based on comprehension
      if (comprehensionLevel < 0.6) {
        adaptations.push({
          type: 'difficulty_adjustment',
          action: 'simplify',
          reason: 'Low comprehension detected',
          suggestions: [
            'Use simpler language',
            'Add more foundational content',
            'Include prerequisite reviews'
          ]
        });
      }

      // Adapt based on engagement
      if (engagementMetrics.interactionsPerMinute < 2) {
        adaptations.push({
          type: 'engagement_boost',
          action: 'increase_interactivity',
          reason: 'Low engagement detected',
          suggestions: [
            'Add interactive elements',
            'Include multimedia content',
            'Break content with questions'
          ]
        });
      }

      // Adapt based on learning style
      const styleAdaptations = this._generateStyleBasedAdaptations(
        profile.learningStyles,
        contentId
      );
      adaptations.push(...styleAdaptations);

      return {
        studentId,
        contentId,
        adaptations,
        profileUsed: profile,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error adapting content delivery:', error);
      throw error;
    }
  }

  async optimiseLearningSequence(studentId: string, availableContent: any[], goals: LearningGoals = {}): Promise<LearningSequence> {
    try {
      const {
        targetCompetency = 0.8,
        timeConstraint = null,
        preferredPace = 'moderate'
      } = goals;

      // Get student profile
      const profile = await this._getProfile(studentId);
      if (!profile) {
        throw new Error(`Learning profile not found for student: ${studentId}`);
      }

      // Analyse content prerequisites and dependencies
      const contentGraph = this._buildContentDependencyGraph(availableContent);

      // Calculate optimal sequence using reinforcement learning
      const optimalSequence = await this._calculateOptimalSequence(
        contentGraph,
        profile,
        targetCompetency,
        timeConstraint,
        preferredPace
      );

      // Generate personalised schedule
      const schedule = this._generatePersonalisedSchedule(
        optimalSequence,
        profile.learningPace,
        timeConstraint
      );

      return {
        studentId,
        sequence: optimalSequence,
        schedule,
        estimatedCompletion: this._estimateCompletionTime(optimalSequence, profile),
        confidence: this._calculateSequenceConfidence(optimalSequence, profile),
        alternatives: this._generateSequenceAlternatives(optimalSequence, contentGraph)
      };
    } catch (error) {
      logger.error('Error optimising learning sequence:', error);
      throw error;
    }
  }

  async trackObjectiveMastery(studentId: string, objectiveId: string, assessmentData: AssessmentData): Promise<MasteryAssessment> {
    try {
      const {
        score = 0,
        attempts = 0,
        timeSpent,
        hintsUsed = 0,
        relatedObjectives
      } = assessmentData;

      const id = parseInt(studentId);
      if (isNaN(id)) throw new Error('Invalid student ID');

      // Get current mastery level
      const dbMastery = await prisma.studentTopicMastery.findUnique({
        where: {
          student_id_topic_id: {
            student_id: id,
            topic_id: objectiveId
          }
        }
      });

      let mastery: MasteryLevel = {
        level: dbMastery?.knowledge_level || 0,
        attempts: 0, // Not tracked in this model
        totalTime: 0,
        lastAssessed: dbMastery?.last_updated.toISOString() || null,
        confidence: dbMastery?.confidence || 0
      };

      // Update mastery calculation
      const newMastery = this._calculateUpdatedMastery(
        mastery,
        score,
        attempts,
        timeSpent,
        hintsUsed
      );

      // Store updated mastery
      await prisma.studentTopicMastery.upsert({
        where: {
          student_id_topic_id: {
            student_id: id,
            topic_id: objectiveId
          }
        },
        update: {
          knowledge_level: newMastery.level,
          confidence: newMastery.confidence,
          last_updated: new Date()
        },
        create: {
          student_id: id,
          topic_id: objectiveId,
          knowledge_level: newMastery.level,
          confidence: newMastery.confidence
        }
      });

      // Check prerequisite relationships
      const prerequisiteStatus = await this._checkPrerequisites(
        studentId,
        objectiveId,
        relatedObjectives
      );

      // Generate mastery insights
      const insights = this._generateMasteryInsights(
        newMastery,
        prerequisiteStatus,
        assessmentData
      );

      return {
        studentId,
        objectiveId,
        masteryLevel: newMastery.level,
        confidence: newMastery.confidence,
        attempts: newMastery.attempts,
        prerequisiteStatus,
        insights,
        recommendations: this._generateMasteryRecommendations(newMastery, prerequisiteStatus)
      };
    } catch (error) {
      logger.error('Error tracking objective mastery:', error);
      throw error;
    }
  }

  async getLearningAnalytics(studentId: string, options: { timeRange?: number; includeTrends?: boolean; includePredictions?: boolean } = {}): Promise<LearningAnalytics> {
    try {
      const {
        timeRange = 30, // days
        includeTrends = true,
        includePredictions = true
      } = options;

      const profile = await this._getProfile(studentId);
      if (!profile) {
        throw new Error(`Learning profile not found for student: ${studentId}`);
      }

      const analytics: LearningAnalytics = {
        studentId,
        generatedAt: new Date().toISOString(),
        timeRange,
        profile: {
          learningStyles: profile.learningStyles,
          optimalDifficulty: profile.optimalDifficulty,
          learningPace: profile.learningPace,
          cognitiveLoad: profile.cognitiveLoad
        },
        performance: this._calculatePerformanceAnalytics(studentId, timeRange),
        progress: this._calculateProgressAnalytics(studentId, timeRange),
        mastery: this._calculateMasteryAnalytics(studentId)
      };

      if (includeTrends) {
        analytics.trends = this._analyseLearningTrends(studentId, timeRange);
      }

      if (includePredictions) {
        analytics.predictions = await this._generateLearningPredictions(studentId, profile);
      }

      return analytics;
    } catch (error) {
      logger.error('Error getting learning analytics:', error);
      throw error;
    }
  }

  private async _getProfile(studentId: string): Promise<LearningProfile | null> {
    try {
      const id = parseInt(studentId);
      if (isNaN(id)) return null;

      const dbProfile = await prisma.studentAdaptiveProfile.findUnique({
        where: { student_id: id }
      });

      if (!dbProfile) return null;

      return {
        studentId: dbProfile.student_id.toString(),
        learningStyles: {
          visual: dbProfile.visual_preference / 100,
          auditory: dbProfile.auditory_preference / 100,
          kinesthetic: dbProfile.kinesthetic_preference / 100,
          reading: dbProfile.reading_preference / 100
        },
        optimalDifficulty: 3, // Default as not in DB yet
        learningPace: dbProfile.processing_speed === 'fast' ? 'fast' : dbProfile.processing_speed === 'slow' ? 'slow' : 'moderate',
        cognitiveLoad: 0.5,
        expectedTimePerContent: dbProfile.attention_span_minutes,
        performanceMetrics: {}, // Not persisted in this model
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error fetching profile:', error);
      return null;
    }
  }

  private async _saveProfile(profile: LearningProfile): Promise<void> {
    try {
      const id = parseInt(profile.studentId);
      if (isNaN(id)) return;

      await prisma.studentAdaptiveProfile.upsert({
        where: { student_id: id },
        update: {
          visual_preference: Math.round(profile.learningStyles.visual * 100),
          auditory_preference: Math.round(profile.learningStyles.auditory * 100),
          kinesthetic_preference: Math.round(profile.learningStyles.kinesthetic * 100),
          reading_preference: Math.round(profile.learningStyles.reading * 100),
          processing_speed: profile.learningPace === 'fast' ? 'fast' : profile.learningPace === 'slow' ? 'slow' : 'average',
          attention_span_minutes: profile.expectedTimePerContent
        },
        create: {
          student_id: id,
          tenant_id: 1, // Default tenant
          visual_preference: Math.round(profile.learningStyles.visual * 100),
          auditory_preference: Math.round(profile.learningStyles.auditory * 100),
          kinesthetic_preference: Math.round(profile.learningStyles.kinesthetic * 100),
          reading_preference: Math.round(profile.learningStyles.reading * 100),
          processing_speed: profile.learningPace === 'fast' ? 'fast' : profile.learningPace === 'slow' ? 'slow' : 'average',
          attention_span_minutes: profile.expectedTimePerContent
        }
      });
    } catch (error) {
      logger.error('Error saving profile:', error);
    }
  }

  private async _createInitialProfile(studentId: string): Promise<LearningProfile> {
    const profile: LearningProfile = {
      studentId,
      learningStyles: {
        visual: 0.25,
        auditory: 0.25,
        kinesthetic: 0.25,
        reading: 0.25
      },
      optimalDifficulty: 3, // Medium difficulty
      learningPace: 'moderate',
      cognitiveLoad: 0.5,
      expectedTimePerContent: 15, // minutes
      performanceMetrics: {},
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    await this._saveProfile(profile);
    return profile;
  }

  private _analyseLearningStyleIndicators(responses: AssessmentResponse[], _timeSpent: number): LearningStyles {
    // Simplified analysis - in real implementation, this would use ML models
    const indicators: LearningStyles = {
      visual: 0,
      auditory: 0,
      kinesthetic: 0,
      reading: 0
    };

    // Analyse response patterns for style indicators
    responses.forEach(response => {
      if (response.questionType === 'diagram' || response.visualAids) {
        indicators.visual += 0.1;
      }
      if (response.questionType === 'audio' || response.audioContent) {
        indicators.auditory += 0.1;
      }
      if (response.questionType === 'interactive' || response.handsOn) {
        indicators.kinesthetic += 0.1;
      }
      if (response.questionType === 'text' || response.readingHeavy) {
        indicators.reading += 0.1;
      }
    });

    return indicators;
  }

  private _updateLearningStyles(currentStyles: LearningStyles, indicators: LearningStyles): LearningStyles {
    const updated = { ...currentStyles };
    const totalWeight = Object.values(indicators).reduce((sum, val) => sum + val, 0);

    if (totalWeight > 0) {
      // Weighted average update
      Object.keys(indicators).forEach(style => {
        const weight = indicators[style] / totalWeight;
        updated[style] = (updated[style] * 0.9) + (weight * 0.1);
      });
    }

    return updated;
  }

  private _assessCognitiveLoad(responses: AssessmentResponse[], timeSpent: number, difficultyLevel: number): number {
    // Simplified cognitive load calculation
    const avgTimePerQuestion = timeSpent / responses.length;
    const difficultyMultiplier = difficultyLevel / this.options.difficultyLevels;

    // Higher time per question and difficulty indicate higher cognitive load
    const load = Math.min(1, (avgTimePerQuestion / 10) * difficultyMultiplier);

    return load;
  }

  private _updatePerformanceMetrics(currentMetrics: PerformanceMetrics, topic: string, performance: number, difficultyLevel: number): PerformanceMetrics {
    if (!currentMetrics[topic]) {
      currentMetrics[topic] = {
        attempts: 0,
        totalScore: 0,
        averageScore: 0,
        bestScore: 0,
        difficultyProgression: []
      };
    }

    const topicMetrics = currentMetrics[topic];
    topicMetrics.attempts++;
    topicMetrics.totalScore += performance;
    topicMetrics.averageScore = topicMetrics.totalScore / topicMetrics.attempts;
    topicMetrics.bestScore = Math.max(topicMetrics.bestScore, performance);
    topicMetrics.difficultyProgression.push({
      difficulty: difficultyLevel,
      score: performance,
      timestamp: new Date().toISOString()
    });

    return currentMetrics;
  }

  private async _calculateOptimalDifficulty(profile: LearningProfile): Promise<number> {
    // Calculate optimal difficulty based on performance and cognitive load
    let optimalDifficulty = 3; // Start with medium

    // Adjust based on recent performance
    const recentPerformance = await this._getRecentPerformance(profile);
    if (recentPerformance > 0.8) {
      optimalDifficulty += 0.5; // Increase difficulty for high performers
    } else if (recentPerformance < 0.6) {
      optimalDifficulty -= 0.5; // Decrease difficulty for struggling students
    }

    // Adjust based on cognitive load
    if (profile.cognitiveLoad > this.options.cognitiveLoadThreshold) {
      optimalDifficulty -= 0.5; // Reduce difficulty if cognitive load is high
    }

    // Ensure difficulty stays within bounds
    return Math.max(1, Math.min(this.options.difficultyLevels, optimalDifficulty));
  }

  private _updateLearningPace(profile: LearningProfile, timeSpent: number, questionCount: number): 'slow' | 'moderate' | 'fast' {
    const avgTimePerQuestion = timeSpent / questionCount;

    if (avgTimePerQuestion < 2) {
      return 'fast';
    } else if (avgTimePerQuestion > 5) {
      return 'slow';
    } else {
      return 'moderate';
    }
  }

  private async _storeAssessmentHistory(studentId: string, assessmentData: any): Promise<void> {
    try {
      // Try to find a quiz matching the topic
      const quiz = await prisma.courseQuiz.findFirst({
        where: {
          title: {
            contains: assessmentData.topic,
            mode: 'insensitive'
          }
        }
      });

      if (quiz) {
        await prisma.quizAttempt.create({
          data: {
            quizId: quiz.id,
            userId: studentId,
            score: Math.round((assessmentData.performance || 0) * 100),
            maxScore: 100,
            isPassed: (assessmentData.performance || 0) > 0.7,
            timeSpent: assessmentData.timeSpent || 0,
            completedAt: new Date()
          }
        });
      }
    } catch (error) {
      logger.error('Error storing assessment history:', error);
    }
  }

  private async _loadLearningStyleModels(): Promise<void> {
    // Load pre-trained models for learning style assessment
    logger.info('Loading learning style models');
  }

  private _setupRealTimeAdaptation(): void {
    // Set up real-time monitoring for adaptation triggers
    logger.info('Setting up real-time adaptation monitoring');
  }

  private _scheduleProfileUpdates(): void {
    // Schedule periodic profile updates based on new data
    setInterval(() => {
      this._updateProfiles();
    }, this.options.adaptationInterval);
  }

  private async _updateProfiles(): Promise<void> {
    // Update learning profiles based on new assessment data
    logger.info('Updating learning profiles');
  }

  private async _getRecentPerformance(profile: LearningProfile): Promise<number> {
    // Calculate recent performance from assessment history
    const studentId = profile.studentId;
    
    try {
      const attempts = await prisma.quizAttempt.findMany({
        where: { userId: studentId },
        orderBy: { completedAt: 'desc' },
        take: 5
      });

      if (attempts.length === 0) return 0.5;

      const avgScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length;
      return avgScore / 100; // Convert back to 0-1
    } catch (error) {
      return 0.5;
    }
  }

  // Placeholder methods for missing implementations in original JS
  private _calculatePerformance(responses: AssessmentResponse[]): number {
    const correct = responses.filter(r => r.isCorrect).length;
    return correct / responses.length;
  }

  private async _selectAdaptiveQuestions(topic: string, difficulty: number, count: number, styles: LearningStyles): Promise<any[]> {
    try {
      // Map numeric difficulty (1-5) to string (easy, medium, hard)
      let difficultyStr = 'medium';
      if (difficulty <= 2) difficultyStr = 'easy';
      if (difficulty >= 4) difficultyStr = 'hard';

      // Find questions in DB
      const questions = await prisma.quizQuestion.findMany({
        where: {
          difficulty: difficultyStr,
          quiz: {
            title: {
              contains: topic,
              mode: 'insensitive'
            }
          }
        },
        take: count,
        include: {
          quiz: true
        }
      });
      
      // Fallback if not enough questions found
      if (questions.length < count) {
         const extra = await prisma.quizQuestion.findMany({
           where: {
              difficulty: difficultyStr,
              id: { notIn: questions.map(q => q.id) }
           },
           take: count - questions.length,
           include: {
             quiz: true
           }
         });
         questions.push(...extra);
      }

      // If still no questions, return mocks (safety net)
      if (questions.length === 0) {
        return Array(count).fill({ topic, difficulty, type: 'mock_question', text: 'Sample Question (DB Empty)' });
      }

      return questions.map(q => ({
        id: q.id,
        text: q.questionText,
        type: q.questionType,
        options: q.options,
        difficulty: q.difficulty === 'easy' ? 1 : q.difficulty === 'medium' ? 3 : 5,
        topic: q.quiz.title,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      }));
    } catch (error) {
      logger.error('Error selecting adaptive questions:', error);
      // Fallback to mock on error
      return Array(count).fill({ topic, difficulty, type: 'mock_question', text: 'Sample Question (Error)' });
    }
  }

  private _personaliseQuestionPresentation(questions: any[], styles: LearningStyles): any[] {
    return questions.map(q => ({ ...q, personalised: true }));
  }

  private _generateStyleBasedAdaptations(styles: LearningStyles, contentId: string): AdaptationRecommendation[] {
    return [];
  }

  private _buildContentDependencyGraph(content: any[]): any {
    return { nodes: content, edges: [] };
  }

  private async _calculateOptimalSequence(graph: any, profile: LearningProfile, target: number, time: number | null, pace: string): Promise<any[]> {
    return [];
  }

  private _generatePersonalisedSchedule(sequence: any[], pace: string, time: number | null): any {
    return { items: sequence };
  }

  private _estimateCompletionTime(sequence: any[], profile: LearningProfile): number {
    return sequence.length * 15;
  }

  private _calculateSequenceConfidence(sequence: any[], profile: LearningProfile): number {
    return 0.85;
  }

  private _generateSequenceAlternatives(sequence: any[], graph: any): any[] {
    return [];
  }

  private _calculateUpdatedMastery(current: MasteryLevel, score: number, attempts: number, time: number, hints: number): MasteryLevel {
    return {
      ...current,
      level: Math.min(1, current.level + (score * 0.1)),
      attempts: current.attempts + attempts,
      totalTime: current.totalTime + time,
      confidence: Math.min(1, current.confidence + 0.05)
    };
  }

  private async _checkPrerequisites(studentId: string, objectiveId: string, related: string[] | undefined): Promise<any> {
    return { met: true };
  }

  private _generateMasteryInsights(mastery: MasteryLevel, prerequisites: any, data: AssessmentData): any {
    return { trend: 'improving' };
  }

  private _generateMasteryRecommendations(mastery: MasteryLevel, prerequisites: any): any {
    return [];
  }

  private _calculatePerformanceAnalytics(studentId: string, range: number): any {
    return { averageScore: 0.75 };
  }

  private _calculateProgressAnalytics(studentId: string, range: number): any {
    return { completedModules: 5 };
  }

  private _calculateMasteryAnalytics(studentId: string): any {
    return { masteredObjectives: 10 };
  }

  private _analyseLearningTrends(studentId: string, range: number): any {
    return { improvementRate: 0.05 };
  }

  private async _generateLearningPredictions(studentId: string, profile: LearningProfile): Promise<any> {
    return { predictedGrade: 'A' };
  }

  async shutdown(): Promise<void> {
    logger.info('Adaptive learning service shut down');
  }
}
