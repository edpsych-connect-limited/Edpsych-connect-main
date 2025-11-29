/**
 * @fileoverview Ethics Assessment Model
 * 
 * Represents an ethics assessment conducted on a component, feature, or process.
 * Used to document ethical considerations, risks, and mitigations.
 */

class EthicsAssessment {
  constructor({
    id = null,
    title,
    description,
    componentId, // ID of the component, feature, or process being assessed
    componentType, // Type of component being assessed (e.g., 'feature', 'algorithm', 'data_process')
    assessorId, // User ID of the person conducting the assessment
    reviewers = [], // List of user IDs who reviewed the assessment
    status = 'draft', // 'draft', 'in_review', 'approved', 'rejected', 'needs_revision'
    version = 1,
    createdAt = new Date(),
    updatedAt = new Date(),
    approvedAt = null,
    questions = [], // Assessment questions and answers
    ethicalRisks = [], // Identified ethical risks
    mitigations = [], // Proposed mitigations for risks
    attachments = [], // Supporting documents or evidence
    recommendedMonitors = [], // Recommended ethics monitors to implement
    outcome = null, // 'approved', 'approved_with_conditions', 'not_approved'
    conditions = [], // Conditions for approval if outcome is 'approved_with_conditions'
    tags = [],
    metadata = {}
  }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.componentId = componentId;
    this.componentType = componentType;
    this.assessorId = assessorId;
    this.reviewers = reviewers;
    this.status = status;
    this.version = version;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.approvedAt = approvedAt;
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
  isDraft() {
    return this.status === 'draft';
  }

  /**
   * Check if the assessment is approved
   * @returns {boolean} True if the assessment is approved
   */
  isApproved() {
    return this.status === 'approved';
  }

  /**
   * Check if the assessment needs revision
   * @returns {boolean} True if the assessment needs revision
   */
  needsRevision() {
    return this.status === 'needs_revision' || this.status === 'rejected';
  }

  /**
   * Add a question and answer to the assessment
   * @param {string} question - The assessment question
   * @param {string} answer - The answer to the question
   * @param {string} category - Category of the question (e.g., 'fairness', 'transparency')
   * @returns {number} Index of the new question
   */
  addQuestion(question, answer, category = 'general') {
    const questionObj = {
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

  /**
   * Add an ethical risk to the assessment
   * @param {string} description - Description of the ethical risk
   * @param {string} severity - Severity of the risk ('low', 'medium', 'high', 'critical')
   * @param {string} category - Category of the risk (e.g., 'privacy', 'bias', 'transparency')
   * @returns {number} Index of the new risk
   */
  addEthicalRisk(description, severity = 'medium', category = 'general') {
    const risk = {
      description,
      severity,
      category,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.ethicalRisks.push(risk);
    this.updatedAt = new Date();
    return this.ethicalRisks.length - 1;
  }

  /**
   * Add a mitigation strategy for an ethical risk
   * @param {number} riskIndex - Index of the ethical risk
   * @param {string} description - Description of the mitigation strategy
   * @param {string} status - Status of the mitigation ('planned', 'implemented', 'verified')
   * @returns {number} Index of the new mitigation
   */
  addMitigation(riskIndex, description, status = 'planned') {
    if (riskIndex < 0 || riskIndex >= this.ethicalRisks.length) {
      return -1;
    }
    
    const mitigation = {
      riskIndex,
      description,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
      implementedAt: null
    };
    
    this.mitigations.push(mitigation);
    this.updatedAt = new Date();
    return this.mitigations.length - 1;
  }

  /**
   * Update the status of a mitigation
   * @param {number} index - Index of the mitigation
   * @param {string} status - New status of the mitigation
   * @returns {boolean} True if the update was successful
   */
  updateMitigationStatus(index, status) {
    if (index < 0 || index >= this.mitigations.length) {
      return false;
    }
    
    this.mitigations[index].status = status;
    this.mitigations[index].updatedAt = new Date();
    
    if (status === 'implemented') {
      this.mitigations[index].implementedAt = new Date();
    }
    
    this.updatedAt = new Date();
    return true;
  }

  /**
   * Add a recommended monitor to the assessment
   * @param {string} monitorType - Type of monitor to implement
   * @param {string} description - Description of what the monitor should track
   * @param {Object} configuration - Suggested configuration for the monitor
   * @returns {number} Index of the new recommended monitor
   */
  addRecommendedMonitor(monitorType, description, configuration = {}) {
    const monitor = {
      monitorType,
      description,
      configuration,
      createdAt: new Date()
    };
    
    this.recommendedMonitors.push(monitor);
    this.updatedAt = new Date();
    return this.recommendedMonitors.length - 1;
  }

  /**
   * Add a condition for approval
   * @param {string} description - Description of the condition
   * @param {string} status - Status of the condition ('pending', 'met', 'waived')
   * @returns {number} Index of the new condition
   */
  addCondition(description, status = 'pending') {
    const condition = {
      description,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
      metAt: null
    };
    
    this.conditions.push(condition);
    this.updatedAt = new Date();
    return this.conditions.length - 1;
  }

  /**
   * Update the status of a condition
   * @param {number} index - Index of the condition
   * @param {string} status - New status of the condition
   * @returns {boolean} True if the update was successful
   */
  updateConditionStatus(index, status) {
    if (index < 0 || index >= this.conditions.length) {
      return false;
    }
    
    this.conditions[index].status = status;
    this.conditions[index].updatedAt = new Date();
    
    if (status === 'met') {
      this.conditions[index].metAt = new Date();
    }
    
    this.updatedAt = new Date();
    return true;
  }

  /**
   * Approve the assessment
   * @param {string} reviewerId - ID of the reviewer approving the assessment
   * @param {string} outcome - Outcome of the approval ('approved', 'approved_with_conditions', 'not_approved')
   * @returns {boolean} True if the approval was successful
   */
  approve(reviewerId, outcome = 'approved') {
    if (!this.reviewers.includes(reviewerId)) {
      this.reviewers.push(reviewerId);
    }
    
    this.status = 'approved';
    this.outcome = outcome;
    this.approvedAt = new Date();
    this.updatedAt = new Date();
    
    return true;
  }

  /**
   * Request revisions to the assessment
   * @param {string} reviewerId - ID of the reviewer requesting revisions
   * @param {string} feedback - Feedback for the revision request
   * @returns {boolean} True if the revision request was successful
   */
  requestRevisions(reviewerId, feedback) {
    if (!this.reviewers.includes(reviewerId)) {
      this.reviewers.push(reviewerId);
    }
    
    this.status = 'needs_revision';
    this.updatedAt = new Date();
    
    // Add feedback to metadata
    if (!this.metadata.revisionFeedback) {
      this.metadata.revisionFeedback = [];
    }
    
    this.metadata.revisionFeedback.push({
      reviewerId,
      feedback,
      timestamp: new Date()
    });
    
    return true;
  }

  /**
   * Create a new version of the assessment
   * @returns {EthicsAssessment} New version of the assessment
   */
  createNewVersion() {
    const newVersion = new EthicsAssessment({
      ...this.toJSON(),
      id: null, // New version will get a new ID
      version: this.version + 1,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      approvedAt: null
    });
    
    return newVersion;
  }

  /**
   * Serializes the assessment to a plain object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      componentId: this.componentId,
      componentType: this.componentType,
      assessorId: this.assessorId,
      reviewers: this.reviewers,
      status: this.status,
      version: this.version,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      approvedAt: this.approvedAt,
      questions: this.questions,
      ethicalRisks: this.ethicalRisks,
      mitigations: this.mitigations,
      attachments: this.attachments,
      recommendedMonitors: this.recommendedMonitors,
      outcome: this.outcome,
      conditions: this.conditions,
      tags: this.tags,
      metadata: this.metadata
    };
  }

  /**
   * Creates an instance from a plain object
   * @param {Object} data - Plain object representation
   * @returns {EthicsAssessment} New instance
   */
  static fromJSON(data) {
    return new EthicsAssessment({
      ...data,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
      approvedAt: data.approvedAt ? new Date(data.approvedAt) : null,
      questions: data.questions ? data.questions.map(q => ({
        ...q,
        createdAt: q.createdAt ? new Date(q.createdAt) : new Date(),
        updatedAt: q.updatedAt ? new Date(q.updatedAt) : new Date()
      })) : [],
      ethicalRisks: data.ethicalRisks ? data.ethicalRisks.map(r => ({
        ...r,
        createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
        updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date()
      })) : [],
      mitigations: data.mitigations ? data.mitigations.map(m => ({
        ...m,
        createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
        updatedAt: m.updatedAt ? new Date(m.updatedAt) : new Date(),
        implementedAt: m.implementedAt ? new Date(m.implementedAt) : null
      })) : [],
      recommendedMonitors: data.recommendedMonitors ? data.recommendedMonitors.map(m => ({
        ...m,
        createdAt: m.createdAt ? new Date(m.createdAt) : new Date()
      })) : [],
      conditions: data.conditions ? data.conditions.map(c => ({
        ...c,
        createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
        updatedAt: c.updatedAt ? new Date(c.updatedAt) : new Date(),
        metAt: c.metAt ? new Date(c.metAt) : null
      })) : []
    });
  }
}

export default EthicsAssessment;