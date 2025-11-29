/**
 * FHIR Resource Definitions for EdPsych Connect
 * 
 * This file defines TypeScript interfaces for FHIR resources used in the
 * educational psychology context, specifically adapted for the UK healthcare system.
 * 
 * FHIR Version: R4 (4.0.1)
 * UK Profile: UK Core Implementation Guide
 */

// Base Resource interface that all FHIR resources extend
export interface FHIRResource {
  resourceType: string;
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
    profile?: string[];
    security?: CodeableConcept[];
    tag?: CodeableConcept[];
  };
  implicitRules?: string;
  language?: string;
}

// Common data types
export interface CodeableConcept {
  coding?: Coding[];
  text?: string;
}

export interface Coding {
  system?: string;
  version?: string;
  code?: string;
  display?: string;
  userSelected?: boolean;
}

export interface Reference {
  reference?: string;
  type?: string;
  identifier?: Identifier;
  display?: string;
}

export interface Identifier {
  use?: 'usual' | 'official' | 'temp' | 'secondary' | 'old';
  type?: CodeableConcept;
  system?: string;
  value?: string;
  period?: Period;
  assigner?: Reference;
}

export interface Period {
  start?: string;
  end?: string;
}

export interface Quantity {
  value?: number;
  comparator?: '<' | '<=' | '>=' | '>';
  unit?: string;
  system?: string;
  code?: string;
}

// Patient resource - maps to student/participant in our system
export interface Patient extends FHIRResource {
  resourceType: 'Patient';
  identifier?: Identifier[];
  active?: boolean;
  name?: HumanName[];
  telecom?: ContactPoint[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  address?: Address[];
  generalPractitioner?: Reference[];
  managingOrganization?: Reference;
  
  // UK Core extensions
  nhsNumber?: Identifier;
  ethnicCategory?: CodeableConcept;
  residentialStatus?: CodeableConcept;
  
  // EdPsych Connect extensions
  educationalInstitution?: Reference;
  yearGroup?: string;
  keyStage?: CodeableConcept;
  specialEducationalNeeds?: CodeableConcept[];
}

export interface HumanName {
  use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
  text?: string;
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
  period?: Period;
}

export interface ContactPoint {
  system?: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
  value?: string;
  use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
  rank?: number;
  period?: Period;
}

export interface Address {
  use?: 'home' | 'work' | 'temp' | 'old' | 'billing';
  type?: 'postal' | 'physical' | 'both';
  text?: string;
  line?: string[];
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  period?: Period;
}

// Observation resource - maps to assessments and measurements
export interface Observation extends FHIRResource {
  resourceType: 'Observation';
  identifier?: Identifier[];
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled' | 'entered-in-error' | 'unknown';
  category?: CodeableConcept[];
  code: CodeableConcept;
  subject: Reference;
  encounter?: Reference;
  effectiveDateTime?: string;
  effectivePeriod?: Period;
  issued?: string;
  performer?: Reference[];
  valueQuantity?: Quantity;
  valueCodeableConcept?: CodeableConcept;
  valueString?: string;
  valueBoolean?: boolean;
  valueInteger?: number;
  valueRange?: Range;
  valueRatio?: Ratio;
  valueSampledData?: SampledData;
  valueTime?: string;
  valueDateTime?: string;
  valuePeriod?: Period;
  dataAbsentReason?: CodeableConcept;
  interpretation?: CodeableConcept[];
  note?: Annotation[];
  bodySite?: CodeableConcept;
  method?: CodeableConcept;
  device?: Reference;
  referenceRange?: ObservationReferenceRange[];
  
  // Educational psychology extensions
  assessmentType?: CodeableConcept;
  educationalContext?: CodeableConcept;
  relatedEducationalOutcome?: Reference[];
}

export interface Range {
  low?: Quantity;
  high?: Quantity;
}

export interface Ratio {
  numerator?: Quantity;
  denominator?: Quantity;
}

export interface SampledData {
  origin: Quantity;
  period: number;
  factor?: number;
  lowerLimit?: number;
  upperLimit?: number;
  dimensions: number;
  data?: string;
}

export interface Annotation {
  authorReference?: Reference;
  authorString?: string;
  time?: string;
  text: string;
}

export interface ObservationReferenceRange {
  low?: Quantity;
  high?: Quantity;
  type?: CodeableConcept;
  appliesTo?: CodeableConcept[];
  age?: Range;
  text?: string;
}

// QuestionnaireResponse - maps to completed assessments
export interface QuestionnaireResponse extends FHIRResource {
  resourceType: 'QuestionnaireResponse';
  identifier?: Identifier;
  basedOn?: Reference[];
  partOf?: Reference[];
  questionnaire: string;
  status: 'in-progress' | 'completed' | 'amended' | 'entered-in-error' | 'stopped';
  subject?: Reference;
  encounter?: Reference;
  authored?: string;
  author?: Reference;
  source?: Reference;
  item?: QuestionnaireResponseItem[];
  
  // Educational psychology extensions
  assessmentContext?: CodeableConcept;
  educationalSetting?: CodeableConcept;
  administeredBy?: Reference;
}

export interface QuestionnaireResponseItem {
  linkId: string;
  definition?: string;
  text?: string;
  answer?: QuestionnaireResponseAnswer[];
  item?: QuestionnaireResponseItem[];
}

export interface QuestionnaireResponseAnswer {
  valueBoolean?: boolean;
  valueDecimal?: number;
  valueInteger?: number;
  valueDate?: string;
  valueDateTime?: string;
  valueTime?: string;
  valueString?: string;
  valueUri?: string;
  valueAttachment?: Attachment;
  valueCoding?: Coding;
  valueQuantity?: Quantity;
  valueReference?: Reference;
  item?: QuestionnaireResponseItem[];
}

export interface Attachment {
  contentType?: string;
  language?: string;
  data?: string;
  url?: string;
  size?: number;
  hash?: string;
  title?: string;
  creation?: string;
}

// CarePlan - maps to intervention plans
export interface CarePlan extends FHIRResource {
  resourceType: 'CarePlan';
  identifier?: Identifier[];
  instantiatesCanonical?: string[];
  instantiatesUri?: string[];
  basedOn?: Reference[];
  replaces?: Reference[];
  partOf?: Reference[];
  status: 'draft' | 'active' | 'on-hold' | 'revoked' | 'completed' | 'entered-in-error' | 'unknown';
  intent: 'proposal' | 'plan' | 'order' | 'option';
  category?: CodeableConcept[];
  title?: string;
  description?: string;
  subject: Reference;
  encounter?: Reference;
  period?: Period;
  created?: string;
  author?: Reference;
  contributor?: Reference[];
  careTeam?: Reference[];
  addresses?: Reference[];
  supportingInfo?: Reference[];
  goal?: Reference[];
  activity?: CarePlanActivity[];
  note?: Annotation[];
  
  // Educational psychology extensions
  educationalGoals?: Reference[];
  schoolContext?: CodeableConcept;
  parentalInvolvement?: CodeableConcept;
}

export interface CarePlanActivity {
  outcomeCodeableConcept?: CodeableConcept[];
  outcomeReference?: Reference[];
  progress?: string;
  reference?: Reference;
  detail?: CarePlanActivityDetail;
}

export interface CarePlanActivityDetail {
  kind?: 'Appointment' | 'CommunicationRequest' | 'DeviceRequest' | 'MedicationRequest' | 'NutritionOrder' | 'Task' | 'ServiceRequest' | 'VisionPrescription';
  instantiatesCanonical?: string[];
  instantiatesUri?: string[];
  code?: CodeableConcept;
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference[];
  goal?: Reference[];
  status: 'not-started' | 'scheduled' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled' | 'stopped' | 'unknown' | 'entered-in-error';
  statusReason?: CodeableConcept;
  doNotPerform?: boolean;
  scheduledTiming?: Timing;
  scheduledPeriod?: Period;
  scheduledString?: string;
  location?: Reference;
  performer?: Reference[];
  productCodeableConcept?: CodeableConcept;
  productReference?: Reference;
  dailyAmount?: Quantity;
  quantity?: Quantity;
  description?: string;
}

export interface Timing {
  event?: string[];
  repeat?: TimingRepeat;
  code?: CodeableConcept;
}

export interface TimingRepeat {
  boundsDuration?: Duration;
  boundsRange?: Range;
  boundsPeriod?: Period;
  count?: number;
  countMax?: number;
  duration?: number;
  durationMax?: number;
  durationUnit?: 's' | 'min' | 'h' | 'd' | 'wk' | 'mo' | 'a';
  frequency?: number;
  frequencyMax?: number;
  period?: number;
  periodMax?: number;
  periodUnit?: 's' | 'min' | 'h' | 'd' | 'wk' | 'mo' | 'a';
  dayOfWeek?: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  timeOfDay?: string[];
  when?: string[];
  offset?: number;
}

export interface Duration {
  value?: number;
  comparator?: '<' | '<=' | '>=' | '>';
  unit?: string;
  system?: string;
  code?: string;
}

// Practitioner - maps to teachers, educational psychologists, etc.
export interface Practitioner extends FHIRResource {
  resourceType: 'Practitioner';
  identifier?: Identifier[];
  active?: boolean;
  name?: HumanName[];
  telecom?: ContactPoint[];
  address?: Address[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  qualification?: PractitionerQualification[];
  communication?: CodeableConcept[];
  
  // Educational extensions
  role?: CodeableConcept;
  specialties?: CodeableConcept[];
  educationalInstitution?: Reference;
}

export interface PractitionerQualification {
  identifier?: Identifier[];
  code: CodeableConcept;
  period?: Period;
  issuer?: Reference;
}

// Organization - maps to schools, NHS trusts, etc.
export interface Organization extends FHIRResource {
  resourceType: 'Organization';
  identifier?: Identifier[];
  active?: boolean;
  type?: CodeableConcept[];
  name?: string;
  alias?: string[];
  telecom?: ContactPoint[];
  address?: Address[];
  partOf?: Reference;
  contact?: OrganizationContact[];
  
  // Educational extensions
  organizationType?: 'school' | 'trust' | 'local_authority' | 'healthcare_provider';
  educationalPhase?: 'primary' | 'secondary' | 'further' | 'higher';
  urnNumber?: string; // Unique Reference Number for UK schools
}

export interface OrganizationContact {
  purpose?: CodeableConcept;
  name?: HumanName;
  telecom?: ContactPoint[];
  address?: Address;
}

// RelatedPerson - maps to parents, guardians, etc.
export interface RelatedPerson extends FHIRResource {
  resourceType: 'RelatedPerson';
  identifier?: Identifier[];
  active?: boolean;
  patient: Reference;
  relationship?: CodeableConcept[];
  name?: HumanName[];
  telecom?: ContactPoint[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  address?: Address[];
  period?: Period;
  
  // Educational extensions
  primaryContact?: boolean;
  legalGuardian?: boolean;
  emergencyContact?: boolean;
}