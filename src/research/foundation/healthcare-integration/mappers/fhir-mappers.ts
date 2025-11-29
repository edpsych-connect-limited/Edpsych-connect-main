/**
 * FHIR Resource Mappers for EdPsych Connect
 * 
 * This file provides utility functions for mapping between internal EdPsych Connect
 * data models and FHIR resources. These mappers ensure that our educational data
 * can be properly represented in FHIR format for healthcare integration.
 */

import {
  Patient,
  Practitioner,
  Organization,
  Observation,
  CarePlan,
  QuestionnaireResponse,
  RelatedPerson,
  CodeableConcept
} from '../models/fhir-resources';
import { v4 as uuidv4 } from 'uuid';

// Import our internal models
import {
  Student,
  Teacher,
  School,
  Assessment,
  InterventionPlan,
  AssessmentResponse,
  Parent,
  SEN
} from '../../core/models/education-models';

// Constants and value sets
import {
  UK_CORE_PROFILE_BASE,
  EDU_EXTENSION_SYSTEM,
  UK_SEN_CATEGORIES,
  UK_KEY_STAGES
} from '../constants/terminology';

/**
 * Maps an internal Student model to a FHIR Patient resource
 */
export function mapStudentToPatient(student: Student): Patient {
  const patientId = student.fhirId || `edu-student-${uuidv4()}`;
  
  // Create the FHIR Patient resource
  const patient: Patient = {
    resourceType: 'Patient',
    id: patientId,
    meta: {
      profile: [`${UK_CORE_PROFILE_BASE}/Patient`],
    },
    identifier: [],
    active: true,
    name: [{
      use: 'official',
      family: student.lastName,
      given: [student.firstName, ...(student.middleName ? [student.middleName] : [])],
      prefix: student.title ? [student.title] : undefined
    }],
    gender: mapGender(student.gender),
    birthDate: student.dateOfBirth,
    
    // UK Core extensions
    nhsNumber: student.nhsNumber ? {
      system: 'https://fhir.nhs.uk/Id/nhs-number',
      value: student.nhsNumber
    } : undefined,
    
    // EdPsych Connect extensions
    educationalInstitution: student.id ? {
      reference: `Organization/${student.id}`
    } : undefined,
    yearGroup: student.yearGroup,
    keyStage: mapKeyStage(student.keyStage),
    specialEducationalNeeds: mapSpecialEducationalNeeds(student.sen)
  };
  
  // Add UPN (Unique Pupil Number) as an identifier
  if (student.upn) {
    patient.identifier?.push({
      system: 'https://education.gov.uk/upn',
      value: student.upn,
      use: 'official'
    });
  }
  
  return patient;
}

/**
 * Maps an internal Teacher model to a FHIR Practitioner resource
 */
export function mapTeacherToPractitioner(teacher: Teacher): Practitioner {
  const practitionerId = teacher.fhirId || `edu-teacher-${uuidv4()}`;
  
  const practitioner: Practitioner = {
    resourceType: 'Practitioner',
    id: practitionerId,
    meta: {
      profile: [`${UK_CORE_PROFILE_BASE}/Practitioner`],
    },
    identifier: [],
    active: true,
    name: [{
      use: 'official',
      family: teacher.lastName,
      given: [teacher.firstName, ...(teacher.middleName ? [teacher.middleName] : [])],
      prefix: teacher.title ? [teacher.title] : undefined
    }],
    telecom: [
      ...(teacher.email ? [{
        system: 'email' as const,
        value: teacher.email,
        use: 'work' as const
      }] : []),
      ...(teacher.phone ? [{
        system: 'phone' as const,
        value: teacher.phone,
        use: 'work' as const
      }] : [])
    ],
    
    // Educational extensions
    role: {
      coding: [{
        system: `${EDU_EXTENSION_SYSTEM}/teacher-roles`,
        code: teacher.role,
        display: getTeacherRoleDisplay(teacher.role)
      }]
    },
    specialties: teacher.subjects?.map(subject => ({
      coding: [{
        system: `${EDU_EXTENSION_SYSTEM}/subjects`,
        code: subject,
        display: subject
      }]
    })),
    educationalInstitution: teacher.id ? {
      reference: `Organization/${teacher.id}`
    } : undefined
  };
  
  return practitioner;
}

/**
 * Maps an internal School model to a FHIR Organization resource
 */
export function mapSchoolToOrganization(school: School): Organization {
  const organizationId = school.fhirId || `edu-school-${uuidv4()}`;
  
  const organization: Organization = {
    resourceType: 'Organization',
    id: organizationId,
    meta: {
      profile: [`${UK_CORE_PROFILE_BASE}/Organization`],
    },
    identifier: [],
    active: true,
    name: school.name,
    telecom: [
      ...(school.email ? [{
        system: 'email' as const,
        value: school.email,
        use: 'work' as const
      }] : []),
      ...(school.phone ? [{
        system: 'phone' as const,
        value: school.phone,
        use: 'work' as const
      }] : []),
      ...(school.website ? [{
        system: 'url' as const,
        value: school.website,
        use: 'work' as const
      }] : [])
    ],
    address: school.address ? [{
      use: 'work',
      type: 'physical',
      line: [
        school.address.line1,
        ...(school.address.line2 ? [school.address.line2] : [])
      ],
      city: school.address.city,
      district: school.address.county,
      postalCode: school.address.postcode,
      country: 'GB'
    }] : [],
    
    // Educational extensions
    organizationType: 'school',
    educationalPhase: mapSchoolPhase(school.phase),
    urnNumber: school.urn
  };
  
  // Add URN as an identifier
  if (school.urn) {
    organization.identifier?.push({
      system: 'https://education.gov.uk/urn',
      value: school.urn,
      use: 'official'
    });
  }
  
  return organization;
}

/**
 * Maps an internal Assessment model to a FHIR Observation resource
 */
export function mapAssessmentToObservation(assessment: Assessment): Observation {
  const observationId = assessment.fhirId || `edu-assessment-${uuidv4()}`;
  
  const observation: Observation = {
    resourceType: 'Observation',
    id: observationId,
    meta: {
      profile: [`${UK_CORE_PROFILE_BASE}/Observation`],
    },
    status: 'final',
    code: {
      coding: [{
        system: `${EDU_EXTENSION_SYSTEM}/assessment-types`,
        code: assessment.type,
        display: getAssessmentTypeDisplay(assessment.type)
      }]
    },
    subject: {
      reference: `Patient/${assessment.studentId}`
    },
    effectiveDateTime: assessment.date,
    performer: assessment.teacherId ? [
      { reference: `Practitioner/${assessment.teacherId}` }
    ] : undefined,
    
    // Educational psychology extensions
    assessmentType: {
      coding: [{
        system: `${EDU_EXTENSION_SYSTEM}/assessment-types`,
        code: assessment.type,
        display: getAssessmentTypeDisplay(assessment.type)
      }]
    },
    educationalContext: {
      coding: [{
        system: `${EDU_EXTENSION_SYSTEM}/educational-contexts`,
        code: assessment.context || 'classroom',
        display: getEducationalContextDisplay(assessment.context || 'classroom')
      }]
    }
  };
  
  // Handle different value types
  if (assessment.scoreValue !== undefined) {
    observation.valueQuantity = {
      value: assessment.scoreValue,
      unit: assessment.scoreUnit || 'points',
      system: `${EDU_EXTENSION_SYSTEM}/score-units`,
      code: assessment.scoreUnit || 'points'
    };
  } else if (assessment.categoryValue) {
    observation.valueCodeableConcept = {
      coding: [{
        system: `${EDU_EXTENSION_SYSTEM}/assessment-categories`,
        code: assessment.categoryValue,
        display: assessment.categoryValue
      }]
    };
  } else if (assessment.textValue) {
    observation.valueString = assessment.textValue;
  }
  
  return observation;
}

/**
 * Maps an internal InterventionPlan model to a FHIR CarePlan resource
 */
export function mapInterventionPlanToCarePlan(plan: InterventionPlan): CarePlan {
  const carePlanId = plan.fhirId || `edu-plan-${uuidv4()}`;
  
  const carePlan: CarePlan = {
    resourceType: 'CarePlan',
    id: carePlanId,
    meta: {
      profile: [`${UK_CORE_PROFILE_BASE}/CarePlan`],
    },
    status: mapInterventionStatus(plan.status),
    intent: 'plan',
    title: plan.title,
    description: plan.description,
    subject: {
      reference: `Patient/${plan.studentId}`
    },
    period: {
      start: plan.startDate,
      end: plan.endDate
    },
    created: plan.createdDate,
    author: plan.createdById ? {
      reference: `Practitioner/${plan.createdById}`
    } : undefined,
    activity: plan.activities.map(activity => ({
      detail: {
        status: mapActivityStatus(activity.status),
        description: activity.description,
        scheduledPeriod: activity.frequency ? {
          start: activity.startDate,
          end: activity.endDate
        } : undefined
      }
    })),
    
    // Educational extensions
    educationalGoals: plan.goals.map(goal => ({
      reference: `Goal/${goal.id}`
    })),
    schoolContext: {
      coding: [{
        system: `${EDU_EXTENSION_SYSTEM}/school-contexts`,
        code: plan.setting || 'classroom',
        display: getSchoolContextDisplay(plan.setting || 'classroom')
      }]
    },
    parentalInvolvement: plan.parentalInvolvement ? {
      coding: [{
        system: `${EDU_EXTENSION_SYSTEM}/parental-involvement`,
        code: plan.parentalInvolvement,
        display: getParentalInvolvementDisplay(plan.parentalInvolvement)
      }]
    } : undefined
  };
  
  return carePlan;
}

/**
 * Maps an internal AssessmentResponse model to a FHIR QuestionnaireResponse resource
 */
export function mapAssessmentResponseToQuestionnaireResponse(response: AssessmentResponse): QuestionnaireResponse {
  const responseId = response.fhirId || `edu-response-${uuidv4()}`;
  
  const questionnaireResponse: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    id: responseId,
    meta: {
      profile: [`${UK_CORE_PROFILE_BASE}/QuestionnaireResponse`],
    },
    questionnaire: `Questionnaire/${response.assessmentId}`,
    status: 'completed',
    subject: {
      reference: `Patient/${response.studentId}`
    },
    authored: response.completedDate,
    author: response.completedById ? {
      reference: `Practitioner/${response.completedById}`
    } : undefined,
    item: response.answers.map(answer => ({
      linkId: answer.questionId,
      text: answer.questionText,
      answer: [
        answer.valueBoolean !== undefined ? { valueBoolean: answer.valueBoolean } :
        answer.valueDecimal !== undefined ? { valueDecimal: answer.valueDecimal } :
        answer.valueInteger !== undefined ? { valueInteger: answer.valueInteger } :
        answer.valueString !== undefined ? { valueString: answer.valueString } :
        answer.valueDate !== undefined ? { valueDate: answer.valueDate } :
        { valueString: '' } // Fallback
      ]
    })),
    
    // Educational psychology extensions
    assessmentContext: {
      coding: [{
        system: `${EDU_EXTENSION_SYSTEM}/assessment-contexts`,
        code: response.context || 'classroom',
        display: getAssessmentContextDisplay(response.context || 'classroom')
      }]
    },
    educationalSetting: {
      coding: [{
        system: `${EDU_EXTENSION_SYSTEM}/educational-settings`,
        code: response.setting || 'classroom',
        display: getEducationalSettingDisplay(response.setting || 'classroom')
      }]
    }
  };
  
  return questionnaireResponse;
}

/**
 * Maps an internal Parent model to a FHIR RelatedPerson resource
 */
export function mapParentToRelatedPerson(parent: Parent, studentId: string): RelatedPerson {
  const relatedPersonId = parent.fhirId || `edu-parent-${uuidv4()}`;
  
  const relatedPerson: RelatedPerson = {
    resourceType: 'RelatedPerson',
    id: relatedPersonId,
    meta: {
      profile: [`${UK_CORE_PROFILE_BASE}/RelatedPerson`],
    },
    active: true,
    patient: {
      reference: `Patient/${studentId}`
    },
    relationship: [{
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/v3-RoleCode',
        code: mapRelationshipType(parent.relationshipType),
        display: getRelationshipDisplay(parent.relationshipType)
      }]
    }],
    name: [{
      use: 'official',
      family: parent.lastName,
      given: [parent.firstName, ...(parent.middleName ? [parent.middleName] : [])],
      prefix: parent.title ? [parent.title] : undefined
    }],
    telecom: [
      ...(parent.email ? [{
        system: 'email' as const,
        value: parent.email,
        use: 'home' as const
      }] : []),
      ...(parent.phone ? [{
        system: 'phone' as const,
        value: parent.phone,
        use: 'mobile' as const
      }] : [])
    ],
    address: parent.address ? [{
      use: 'home',
      line: [
        parent.address.line1,
        ...(parent.address.line2 ? [parent.address.line2] : [])
      ],
      city: parent.address.city,
      district: parent.address.county,
      postalCode: parent.address.postcode,
      country: 'GB'
    }] : [],
    
    // Educational extensions
    primaryContact: parent.isPrimary || false,
    legalGuardian: parent.isLegalGuardian || false,
    emergencyContact: parent.isEmergencyContact || false
  };
  
  return relatedPerson;
}

/**
 * Helper mapping functions
 */

// Maps internal gender to FHIR gender
function mapGender(gender: string): 'male' | 'female' | 'other' | 'unknown' {
  switch (gender.toLowerCase()) {
    case 'male':
    case 'm':
      return 'male';
    case 'female':
    case 'f':
      return 'female';
    case 'other':
    case 'o':
      return 'other';
    default:
      return 'unknown';
  }
}

// Maps internal key stage to FHIR CodeableConcept
function mapKeyStage(keyStage: string | undefined): CodeableConcept | undefined {
  if (!keyStage) return undefined;
  
  return {
    coding: [{
      system: `${EDU_EXTENSION_SYSTEM}/key-stages`,
      code: keyStage,
      display: UK_KEY_STAGES[keyStage] || keyStage
    }]
  };
}

// Maps internal SEN to FHIR CodeableConcept array
function mapSpecialEducationalNeeds(sen: SEN[] | undefined): CodeableConcept[] | undefined {
  if (!sen || sen.length === 0) return undefined;
  
  return sen.map(senItem => ({
    coding: [{
      system: `${EDU_EXTENSION_SYSTEM}/sen-categories`,
      code: senItem.type,
      display: UK_SEN_CATEGORIES[senItem.type] || senItem.type
    }]
  }));
}

// Maps internal school phase to FHIR organization type
function mapSchoolPhase(phase: string): 'primary' | 'secondary' | 'further' | 'higher' {
  switch (phase.toLowerCase()) {
    case 'primary':
      return 'primary';
    case 'secondary':
      return 'secondary';
    case 'college':
    case 'further education':
      return 'further';
    case 'university':
    case 'higher education':
      return 'higher';
    default:
      return 'primary';
  }
}

// Maps internal intervention status to FHIR CarePlan status
function mapInterventionStatus(status: string): 'draft' | 'active' | 'on-hold' | 'revoked' | 'completed' | 'entered-in-error' | 'unknown' {
  switch (status.toLowerCase()) {
    case 'draft':
    case 'planned':
      return 'draft';
    case 'active':
    case 'ongoing':
      return 'active';
    case 'paused':
      return 'on-hold';
    case 'cancelled':
      return 'revoked';
    case 'completed':
    case 'finished':
      return 'completed';
    case 'error':
      return 'entered-in-error';
    default:
      return 'unknown';
  }
}

// Maps internal activity status to FHIR activity status
function mapActivityStatus(status: string): 'not-started' | 'scheduled' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled' | 'stopped' | 'unknown' | 'entered-in-error' {
  switch (status.toLowerCase()) {
    case 'pending':
    case 'to do':
      return 'not-started';
    case 'scheduled':
      return 'scheduled';
    case 'in progress':
    case 'ongoing':
      return 'in-progress';
    case 'paused':
      return 'on-hold';
    case 'completed':
    case 'done':
      return 'completed';
    case 'cancelled':
      return 'cancelled';
    case 'stopped':
      return 'stopped';
    case 'error':
      return 'entered-in-error';
    default:
      return 'unknown';
  }
}

// Maps internal relationship type to FHIR relationship code
function mapRelationshipType(type: string): string {
  switch (type.toLowerCase()) {
    case 'mother':
      return 'MTH';
    case 'father':
      return 'FTH';
    case 'guardian':
      return 'GUARD';
    case 'stepmother':
      return 'STPMTH';
    case 'stepfather':
      return 'STPFTH';
    case 'grandparent':
      return 'GRPRN';
    case 'caregiver':
      return 'CAREGIVER';
    default:
      return 'GUARD';
  }
}

// Display text helpers
function getTeacherRoleDisplay(role: string): string {
  const roleMap: Record<string, string> = {
    'class_teacher': 'Class Teacher',
    'subject_teacher': 'Subject Teacher',
    'head_teacher': 'Head Teacher',
    'deputy_head': 'Deputy Head Teacher',
    'senco': 'Special Educational Needs Coordinator',
    'teaching_assistant': 'Teaching Assistant'
  };
  
  return roleMap[role] || role;
}

function getAssessmentTypeDisplay(type: string): string {
  const typeMap: Record<string, string> = {
    'academic': 'Academic Assessment',
    'behavior': 'Behaviour Assessment',
    'emotional': 'Emotional Assessment',
    'social': 'Social Skills Assessment',
    'cognitive': 'Cognitive Assessment',
    'physical': 'Physical Development Assessment'
  };
  
  return typeMap[type] || type;
}

function getEducationalContextDisplay(context: string): string {
  const contextMap: Record<string, string> = {
    'classroom': 'Classroom',
    'small_group': 'Small Group',
    'one_to_one': 'One-to-One',
    'playground': 'Playground',
    'home': 'Home Environment'
  };
  
  return contextMap[context] || context;
}

function getSchoolContextDisplay(context: string): string {
  const contextMap: Record<string, string> = {
    'classroom': 'Classroom',
    'playground': 'Playground',
    'assembly': 'Assembly',
    'lunchtime': 'Lunchtime',
    'after_school': 'After School'
  };
  
  return contextMap[context] || context;
}

function getParentalInvolvementDisplay(involvement: string): string {
  const involvementMap: Record<string, string> = {
    'none': 'No Parental Involvement',
    'informed': 'Parents Informed',
    'consulted': 'Parents Consulted',
    'active': 'Active Parental Involvement',
    'leading': 'Parent-Led Intervention'
  };
  
  return involvementMap[involvement] || involvement;
}

function getAssessmentContextDisplay(context: string): string {
  const contextMap: Record<string, string> = {
    'classroom': 'Classroom Assessment',
    'clinical': 'Clinical Assessment',
    'research': 'Research Assessment',
    'home': 'Home Assessment'
  };
  
  return contextMap[context] || context;
}

function getEducationalSettingDisplay(setting: string): string {
  const settingMap: Record<string, string> = {
    'classroom': 'Classroom Setting',
    'resource_room': 'Resource Room',
    'sen_unit': 'SEN Unit',
    'mainstream': 'Mainstream Setting',
    'specialist': 'Specialist Setting'
  };
  
  return settingMap[setting] || setting;
}

function getRelationshipDisplay(relationship: string): string {
  const relationshipMap: Record<string, string> = {
    'mother': 'Mother',
    'father': 'Father',
    'guardian': 'Guardian',
    'stepmother': 'Stepmother',
    'stepfather': 'Stepfather',
    'grandparent': 'Grandparent',
    'caregiver': 'Caregiver'
  };
  
  return relationshipMap[relationship] || relationship;
}