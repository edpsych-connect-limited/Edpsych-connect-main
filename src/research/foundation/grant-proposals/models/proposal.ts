/**
 * Models related to grant proposals in the EdPsych Research Foundation
 */


/**
 * Grant proposal status enum
 */
export enum ProposalStatus {
  DRAFT = 'draft',
  INTERNAL_REVIEW = 'internal_review',
  REVISIONS_NEEDED = 'revisions_needed',
  APPROVED_FOR_SUBMISSION = 'approved_for_submission',
  SUBMITTED = 'submitted',
  UNDER_FUNDER_REVIEW = 'under_funder_review',
  FUNDER_REVISIONS_REQUESTED = 'funder_revisions_requested',
  AWARDED = 'awarded',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  ARCHIVED = 'archived'
}

/**
 * Grant types enum
 */
export enum GrantType {
  RESEARCH = 'research',
  INFRASTRUCTURE = 'infrastructure',
  EQUIPMENT = 'equipment',
  TRAINING = 'training',
  KNOWLEDGE_EXCHANGE = 'knowledge_exchange',
  TRAVEL = 'travel',
  FELLOWSHIP = 'fellowship',
  STUDENTSHIP = 'studentship',
  PUBLIC_ENGAGEMENT = 'public_engagement',
  INNOVATION = 'innovation'
}

/**
 * Funding body types
 */
export enum FunderType {
  GOVERNMENT = 'government',
  RESEARCH_COUNCIL = 'research_council',
  CHARITY = 'charity',
  FOUNDATION = 'foundation',
  INDUSTRY = 'industry',
  EUROPEAN_UNION = 'european_union',
  INTERNATIONAL = 'international',
  INTERNAL = 'internal'
}

/**
 * Investigator role in the proposal
 */
export enum InvestigatorRole {
  PRINCIPAL = 'principal_investigator',
  CO_INVESTIGATOR = 'co_investigator',
  COLLABORATOR = 'collaborator',
  PROJECT_PARTNER = 'project_partner',
  CONSULTANT = 'consultant',
  RESEARCHER = 'researcher',
  STUDENT = 'student'
}

/**
 * Funding body details
 */
export interface FundingBody {
  id: string;
  name: string;
  type: FunderType;
  website?: string;
  contactEmail?: string;
  contactName?: string;
  country?: string;
  fundingPreferences?: string[];
  previousEngagement?: boolean;
}

/**
 * Funding scheme/call details
 */
export interface FundingScheme {
  id: string;
  funderId: string;
  name: string;
  description: string;
  maxAward?: number;
  minAward?: number;
  currency: string;
  deadlines: Date[];
  eligibilityCriteria: string[];
  fundingPeriod?: {
    minMonths: number;
    maxMonths: number;
  };
  website?: string;
  applicationPortal?: string;
  successRate?: number;
  keywords: string[];
}

/**
 * Investigator information
 */
export interface Investigator {
  id: string;
  name: string;
  institution: string;
  department?: string;
  role: InvestigatorRole;
  timeCommitment: number; // Percentage
  expertise: string[];
  bio?: string;
  contactEmail: string;
  orcidId?: string;
}

/**
 * Budget item categories
 */
export enum BudgetCategory {
  STAFF = 'staff',
  EQUIPMENT = 'equipment',
  TRAVEL = 'travel',
  CONSUMABLES = 'consumables',
  SERVICES = 'services',
  PARTICIPANT_COSTS = 'participant_costs',
  ESTATES = 'estates',
  INDIRECT_COSTS = 'indirect_costs',
  OTHER = 'other'
}

/**
 * Budget item
 */
export interface BudgetItem {
  category: BudgetCategory;
  description: string;
  cost: number;
  year: number;
  justification?: string;
  quantity?: number;
  unitCost?: number;
}

/**
 * Milestone in the project plan
 */
export interface Milestone {
  title: string;
  description: string;
  dueMonth: number;
  deliverables: string[];
  responsibleInvestigator: string;
  dependencies?: string[]; // IDs of other milestones
}

/**
 * Impact pathways for the research
 */
export interface ImpactPathway {
  beneficiaries: string[];
  outcomes: string[];
  pathway: string;
  metrics: string[];
  timeframe: string;
}

/**
 * Attachment types for proposals
 */
export enum AttachmentType {
  CV = 'cv',
  LETTER_OF_SUPPORT = 'letter_of_support',
  CASE_FOR_SUPPORT = 'case_for_support',
  GANTT_CHART = 'gantt_chart',
  DATA_MANAGEMENT_PLAN = 'data_management_plan',
  ETHICS_APPROVAL = 'ethics_approval',
  BUDGET_SPREADSHEET = 'budget_spreadsheet',
  PRELIMINARY_DATA = 'preliminary_data',
  PUBLICATION = 'publication',
  OTHER = 'other'
}

/**
 * Attachment for proposals
 */
export interface Attachment {
  id: string;
  type: AttachmentType;
  filename: string;
  uploadDate: Date;
  uploadedBy: string;
  fileUrl: string;
  description?: string;
  version: number;
}

/**
 * Review of the proposal
 */
export interface ProposalReview {
  id: string;
  reviewerId: string;
  reviewerName: string;
  date: Date;
  comments: string;
  strengths?: string[];
  weaknesses?: string[];
  rating?: number; // 1-5 scale
  recommendation: 'approve' | 'revise' | 'reject';
  status: 'pending' | 'completed';
}

/**
 * Revision request for a proposal
 */
export interface RevisionRequest {
  id: string;
  requestedBy: string;
  requestedDate: Date;
  dueDate?: Date;
  sections: string[];
  comments: string;
  status: 'open' | 'addressed' | 'closed';
  responseComments?: string;
  responseDate?: Date;
}

/**
 * Main grant proposal entity
 */
export interface GrantProposal {
  id: string;
  title: string;
  summary: string;
  status: ProposalStatus;
  createdBy: string;
  createdDate: Date;
  lastUpdated: Date;
  updatedBy: string;
  grantType: GrantType;
  fundingBody: FundingBody;
  fundingScheme: FundingScheme;
  requestedAmount: number;
  currency: string;
  duration: number; // In months
  plannedStartDate?: Date;
  deadline?: Date;
  investigators: Investigator[];
  budget: BudgetItem[];
  projectPlan: {
    summary: string;
    background?: string;
    aims: string[];
    objectives: string[];
    methodology: string;
    workPackages?: string[];
    milestones: Milestone[];
    riskAssessment?: {
      risk: string;
      likelihood: 'low' | 'medium' | 'high';
      impact: 'low' | 'medium' | 'high';
      mitigation: string;
    }[];
  };
  impactStatement?: string;
  impactPathways?: ImpactPathway[];
  ethicsStatement?: string;
  ethicsApprovalRequired: boolean;
  ethicsApprovalStatus?: string;
  dataManagementPlan?: string;
  publicEngagementPlan?: string;
  relatedStudies?: string[]; // IDs of studies
  relatedCohorts?: string[]; // IDs of cohorts
  attachments: Attachment[];
  reviews: ProposalReview[];
  revisionRequests: RevisionRequest[];
  submissionDetails?: {
    submittedBy: string;
    submittedDate: Date;
    referenceNumber?: string;
    portalConfirmation?: string;
    funderFeedback?: string;
  };
  awardDetails?: {
    awardedAmount: number;
    awardedDate: Date;
    startDate: Date;
    endDate: Date;
    referenceNumber: string;
    contractUrl?: string;
  };
  version: number;
  isTemplate: boolean;
  templateName?: string;
  customFields?: Record<string, any>;
}

/**
 * Parameters for creating a new grant proposal
 */
export interface ProposalCreationParams {
  title: string;
  summary: string;
  grantType: GrantType;
  fundingBody: FundingBody | string; // Can be ID or full object
  fundingScheme: FundingScheme | string; // Can be ID or full object
  requestedAmount: number;
  currency: string;
  duration: number;
  plannedStartDate?: Date;
  deadline?: Date;
  investigators?: Partial<Investigator>[];
  fromTemplateId?: string;
  isTemplate?: boolean;
  templateName?: string;
}

/**
 * Parameters for updating a grant proposal
 */
export interface ProposalUpdateParams {
  title?: string;
  summary?: string;
  status?: ProposalStatus;
  grantType?: GrantType;
  fundingBody?: FundingBody | string;
  fundingScheme?: FundingScheme | string;
  requestedAmount?: number;
  currency?: string;
  duration?: number;
  plannedStartDate?: Date;
  deadline?: Date;
  investigators?: Investigator[];
  budget?: BudgetItem[];
  projectPlan?: Partial<GrantProposal['projectPlan']>;
  impactStatement?: string;
  impactPathways?: ImpactPathway[];
  ethicsStatement?: string;
  ethicsApprovalRequired?: boolean;
  ethicsApprovalStatus?: string;
  dataManagementPlan?: string;
  publicEngagementPlan?: string;
  relatedStudies?: string[];
  relatedCohorts?: string[];
  isTemplate?: boolean;
  templateName?: string;
  customFields?: Record<string, any>;
}

/**
 * Search filters for proposals
 */
export interface ProposalSearchFilters {
  status?: ProposalStatus | ProposalStatus[];
  createdBy?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  funderId?: string;
  funderType?: FunderType;
  grantType?: GrantType;
  investigator?: string;
  minAmount?: number;
  maxAmount?: number;
  deadlineAfter?: Date;
  deadlineBefore?: Date;
  keyword?: string;
  isTemplate?: boolean;
}