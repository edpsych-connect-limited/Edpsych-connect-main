/**
 * EdPsych Connect Core Education Models
 * 
 * This file defines the core data models used throughout the EdPsych Connect platform
 * for representing educational entities, relationships, and data.
 */

// Base entity interface with common properties
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  fhirId?: string; // Optional FHIR resource ID for integration
}

// Student (learner) model
export interface Student extends BaseEntity {
  firstName: string;
  middleName?: string;
  lastName: string;
  title?: string;
  dateOfBirth: string;
  gender: string;
  yearGroup: string;
  keyStage: string;
  upn?: string; // Unique Pupil Number
  nhsNumber?: string;
  schoolId?: string; // School identifier
  sen?: SEN[];
  additionalNeeds?: string[];
  contacts?: string[]; // IDs of Parent/Guardian records
  ethnicity?: string;
  languageSpoken?: string;
  pupilPremium?: boolean;
  attendance?: number; // Percentage
  punctuality?: number; // Percentage
}

// Special Educational Need (SEN) model
export interface SEN {
  type: string; // e.g., 'SPLD', 'ASD', etc.
  severity: 'mild' | 'moderate' | 'severe' | 'profound';
  dateIdentified: string;
  supportLevel: 'monitoring' | 'SEN support' | 'EHCP' | 'statement';
  details?: string;
  accommodations?: string[];
}

// Teacher model
export interface Teacher extends BaseEntity {
  firstName: string;
  middleName?: string;
  lastName: string;
  title?: string;
  email?: string;
  phone?: string;
  role: string; // e.g., 'class_teacher', 'senco', etc.
  employeeId?: string;
  subjects?: string[];
  qualifications?: string[];
  classes?: string[];
  specialisms?: string[];
}

// School model
export interface School extends BaseEntity {
  name: string;
  urn: string; // Unique Reference Number
  phase: string; // 'primary', 'secondary', etc.
  type: string; // 'academy', 'maintained', 'independent', etc.
  address?: Address;
  phone?: string;
  email?: string;
  website?: string;
  headTeacherId?: string;
  senCoId?: string;
  localAuthority: string;
  ofstedRating?: string;
  pupils?: number;
  staffCount?: number;
}

// Address model
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  county?: string;
  postcode: string;
}

// Parent/Guardian model
export interface Parent extends BaseEntity {
  firstName: string;
  middleName?: string;
  lastName: string;
  title?: string;
  relationshipType: string; // e.g., 'mother', 'father', 'guardian'
  email?: string;
  phone?: string;
  address?: Address;
  isPrimary: boolean;
  isLegalGuardian: boolean;
  isEmergencyContact: boolean;
  preferredContactMethod?: 'email' | 'phone' | 'letter';
  studentIds: string[]; // IDs of associated students
  occupation?: string;
  workPhone?: string;
}

// Assessment model
export interface Assessment extends BaseEntity {
  title: string;
  description?: string;
  type: string; // e.g., 'academic', 'behavior', 'emotional'
  subject?: string;
  studentId: string;
  teacherId?: string;
  date: string;
  scoreValue?: number;
  scoreUnit?: string;
  categoryValue?: string;
  textValue?: string;
  context?: string; // e.g., 'classroom', 'small_group', 'one_to_one'
  targetObjectives?: string[];
  nextSteps?: string[];
  attachments?: string[]; // URLs or file references
}

// Assessment Response model
export interface AssessmentResponse extends BaseEntity {
  assessmentId: string;
  studentId: string;
  completedById: string;
  completedDate: string;
  context?: string;
  setting?: string;
  duration?: number; // minutes
  answers: AssessmentAnswer[];
  totalScore?: number;
  status: 'draft' | 'completed' | 'reviewed';
  notes?: string;
}

// Assessment Answer model
export interface AssessmentAnswer {
  questionId: string;
  questionText: string;
  valueBoolean?: boolean;
  valueString?: string;
  valueInteger?: number;
  valueDecimal?: number;
  valueDate?: string;
  valueChoice?: string;
  attachments?: string[];
  notes?: string;
}

// Intervention Plan model
export interface InterventionPlan extends BaseEntity {
  title: string;
  description: string;
  studentId: string;
  createdById: string;
  createdDate: string;
  startDate: string;
  endDate: string;
  status: string; // 'draft', 'active', 'completed', etc.
  activities: InterventionActivity[];
  goals: InterventionGoal[];
  reviewDates: string[];
  setting?: string; // e.g., 'classroom', 'resource_room', etc.
  frequency?: string; // e.g., 'daily', 'weekly', etc.
  parentalInvolvement?: string;
  resources?: string[];
  attachments?: string[];
}

// Intervention Activity model
export interface InterventionActivity {
  id: string;
  title: string;
  description: string;
  responsible: string;
  duration: number; // minutes
  frequency: string; // e.g., 'daily', '3 times per week', etc.
  startDate: string;
  endDate: string;
  status: string; // 'not_started', 'in_progress', 'completed', etc.
  resources?: string[];
  evidence?: string[];
}

// Intervention Goal model
export interface InterventionGoal {
  id: string;
  description: string;
  baselineData?: string;
  targetValue?: string;
  status: string; // 'not_started', 'in_progress', 'achieved', etc.
  progress?: number; // percentage
  evidenceRequired: string[];
  relatedActivities: string[]; // IDs of related activities
}

// Class/Group model
export interface EducationalGroup extends BaseEntity {
  name: string;
  type: string; // 'class', 'year_group', 'intervention_group', etc.
  groupCode?: string;
  teacherId: string;
  studentIds: string[];
  yearGroup?: string;
  subject?: string;
  schedule?: string[];
  location?: string;
  description?: string;
}

// Academic Record model
export interface AcademicRecord extends BaseEntity {
  studentId: string;
  schoolYear: string;
  yearGroup: string;
  subjects: SubjectRecord[];
  attendance: number; // percentage
  punctuality: number; // percentage
  comments?: string;
  targetGrades?: Record<string, string>;
  awards?: string[];
  behaviors?: BehaviorRecord[];
}

// Subject Record model
export interface SubjectRecord {
  subject: string;
  teacher: string;
  currentGrade?: string;
  predictedGrade?: string;
  targetGrade?: string;
  effort: number; // 1-5 scale
  comments?: string;
  strengths?: string[];
  areasForImprovement?: string[];
}

// Behavior Record model
export interface BehaviorRecord {
  date: string;
  type: string; // 'positive', 'negative'
  category: string; // e.g., 'achievement', 'disruption', 'effort'
  description: string;
  location: string;
  recordedBy: string;
  actionTaken?: string;
  parentNotified?: boolean;
  points?: number;
}

// Attendance Record model
export interface AttendanceRecord extends BaseEntity {
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  minutes?: number; // minutes late
  authorizedAbsence: boolean;
  reason?: string;
  recordedBy: string;
  notes?: string;
}

// Educational Professional model (non-teacher specialists)
export interface EducationalProfessional extends BaseEntity {
  firstName: string;
  middleName?: string;
  lastName: string;
  title?: string;
  role: string; // e.g., 'educational_psychologist', 'speech_therapist', etc.
  organization: string;
  email?: string;
  phone?: string;
  specialisms?: string[];
  qualifications?: string[];
  availability?: string[];
  assignedStudents?: string[];
}

// Mental Health Assessment model
export interface MentalHealthAssessment extends BaseEntity {
  studentId: string;
  assessorId: string;
  assessmentType: string; // e.g., 'SDQ', 'RCADS', etc.
  date: string;
  scores: Record<string, number>;
  interpretations?: Record<string, string>;
  recommendations?: string[];
  followUpRequired: boolean;
  followUpDate?: string;
  parentVersionCompleted?: boolean;
  teacherVersionCompleted?: boolean;
  selfVersionCompleted?: boolean;
  clinicalThresholdsExceeded?: string[];
}

// Relationship Record model (for social/emotional connections)
export interface RelationshipRecord extends BaseEntity {
  studentId: string;
  relatedStudentId: string;
  relationshipType: string; // e.g., 'friendship', 'conflict', 'support'
  strength: number; // 1-5 scale
  directionality: 'unidirectional' | 'bidirectional';
  context: string; // e.g., 'classroom', 'playground', etc.
  observedBy: string;
  observationDate: string;
  notes?: string;
  interventionRequired?: boolean;
}

// Student Progress model
export interface StudentProgress extends BaseEntity {
  studentId: string;
  academicYear: string;
  term: string;
  subjects: SubjectProgress[];
  overallProgress: number; // -2 to +2 scale
  socialEmotionalProgress: number; // -2 to +2 scale
  behavioralProgress: number; // -2 to +2 scale
  attendanceProgress: number; // -2 to +2 scale
  comments?: string;
  nextSteps?: string[];
  parentFeedback?: string;
  studentFeedback?: string;
}

// Subject Progress model
export interface SubjectProgress {
  subject: string;
  startingLevel: string;
  currentLevel: string;
  targetLevel: string;
  progressValue: number; // -2 to +2 scale
  keyStrengths?: string[];
  developmentAreas?: string[];
  teacherComments?: string;
}