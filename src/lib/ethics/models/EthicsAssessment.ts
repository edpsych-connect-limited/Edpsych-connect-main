/**
 * @fileoverview Ethics Assessment Model
 * 
 * Represents an ethics assessment conducted on a component, feature, or process.
 * Used to document ethical considerations, risks, and mitigations.
 */

export interface AssessmentQuestion {
  question: string;
  answer: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EthicalRisk {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  likelihood: 'low' | 'medium' | 'high';
  mitigationStrategy?: string;
  status: 'identified' | 'mitigated' | 'accepted';
}

export interface Mitigation {
  id: string;
  riskId: string;
  description: string;
  owner?: string;
  dueDate?: Date;
  status: 'planned' | 'in_progress' | 'completed';
}

export interface EthicsAssessmentOptions {
  id?: string | null;
  title: string;
  description: string;
  componentId: string;
  componentType: string;
  assessorId: string;
  reviewers?: string[];
  status?: 'draft' | 'in_review' | 'approved' | 'rejected' | 'needs_revision';
  version?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  approvedAt?: Date | string | null;
  questions?: AssessmentQuestion[];
  ethicalRisks?: EthicalRisk[];
  mitigations?: Mitigation[];
  attachments?: string[];
  recommendedMonitors?: string[];
  outcome?: 'approved' | 'approved_with_conditions' | 'not_approved' | null;
  conditions?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
}

export class EthicsAssessment {
  id: string | null;
  title: string;
  description: string;
  componentId: string;
  componentType: string;
  assessorId: string;
  reviewers: string[];
  status: 'draft' | 'in_review' | 'approved' | 'rejected' | 'needs_revision';
  version: number;
  createdAt: Date;
  updatedAt: Date;
  approvedAt: Date | null;
  questions: AssessmentQuestion[];
  ethicalRisks: EthicalRisk[];
  mitigations: Mitigation[];
  attachments: string[];
  recommendedMonitors: string[];
  outcome: 'approved' | 'approved_with_conditions' | 'not_approved' | null;
  conditions: string[];
  tags: string[];
  metadata: Record<string, any>;

  constructor({
    id = null,
    title,
    description,
    componentId,
    componentType,
    assessorId,
    reviewers = [],
    status = 'draft',
    version = 1,
    createdAt = new Date(),
    updatedAt = new Date(),
    approvedAt = null,
    questions = [],
    ethicalRisks = [],
    mitigations = [],
    attachments = [],
    recommendedMonitors = [],
    outcome = null,
    conditions = [],
    tags = [],
    metadata = {}
  }: EthicsAssessmentOptions) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.componentId = componentId;
    this.componentType = componentType;
    this.assessorId = assessorId;
    this.reviewers = reviewers;
    this.status = status;
    this.version = version;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    this.updatedAt = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
    this.approvedAt = approvedAt ? (approvedAt instanceof Date ? approvedAt : new Date(approvedAt)) : null;
    this.questions = questions;
    this.ethicalRisks = ethicalRisks;
    this.mitigations = mitigations;
    this.attachments = attachments;
    this.recommendedMonitors = recommendedMonitors;
    this.outcome = outcome;
    this.conditions = conditions;
    this.tags = tags;
    this.metadata = metadata;
  }

  /**
   * Check if the assessment is in draft status
   * @returns {boolean} True if the assessment is in draft
   */
  isDraft(): boolean {
    return this.status === 'draft';
  }

  /**
   * Check if the assessment is approved
   * @returns {boolean} True if the assessment is approved
   */
  isApproved(): boolean {
    return this.status === 'approved';
  }

  /**
   * Check if the assessment needs revision
   * @returns {boolean} True if the assessment needs revision
   */
  needsRevision(): boolean {
    return this.status === 'needs_revision' || this.status === 'rejected';
  }

  /**
   * Add a question and answer to the assessment
   * @param {string} question - The assessment question
   * @param {string} answer - The answer to the question
   * @param {string} category - Category of the question (e.g., 'fairness', 'transparency')
   * @returns {number} Index of the new question
   */
  addQuestion(question: string, answer: string, category: string = 'general'): number {
    const questionObj: AssessmentQuestion = {
      question,
      answer,
      category,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.questions.push(questionObj);
    this.updatedAt = new Date();
    return this.questions.length - 1;
  }
}
