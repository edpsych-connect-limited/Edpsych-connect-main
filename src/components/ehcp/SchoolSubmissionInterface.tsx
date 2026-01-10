'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchStudentInterventions } from '@/actions/ehcp-actions';
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  User,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Save,
  Send,
  Brain,
  School,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Info,
  Users,
  MessageSquare,
  Loader2,
  Database,
} from 'lucide-react';

// Helper function to format dates
const format = (date: string | Date, _pattern?: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Helper: derive age from date-of-birth (best-effort; returns null if invalid)
const getAgeYears = (dateOfBirth: string): number | null => {
  const dob = new Date(dateOfBirth);
  if (!dateOfBirth || Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age;
};

// Types
interface ChildDetails {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  uln: string;
  nhsNumber: string;
  address: string;
  postcode: string;
  currentSchool: string;
  currentYear: string;
}

interface ParentDetails {
  firstName: string;
  lastName: string;
  relationship: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  isMainContact: boolean;
}

interface SENSupport {
  type: string;
  description: string;
  startDate: string;
  duration: string;
  outcome: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

interface FormData {
  child: ChildDetails;
  parents: ParentDetails[];
  requestType: string;
  primaryNeedCategory: string;
  secondaryNeedCategories: string[];
  senSupportHistory: SENSupport[];
  currentProvision: string;
  requestedProvision: string;
  evidenceOfNeed: string;
  parentalViews: string;
  childViews: string;
  schoolViews: string;
  documents: Document[];
  parentalConsent: boolean;
  parentalConsentDate: string;
  declarationAgreed: boolean;
}

// Constants
const REQUEST_TYPES = [
  { value: 'INITIAL_ASSESSMENT', label: 'Initial EHC Needs Assessment Request' },
  { value: 'ANNUAL_REVIEW', label: 'Annual Review (requesting amendments)' },
  { value: 'TRANSFER', label: 'Transfer from another LA' },
  { value: 'PHASE_TRANSFER', label: 'Phase Transfer (changing key stage)' },
];

const PRIMARY_NEED_CATEGORIES = [
  { value: 'COGNITION_LEARNING', label: 'Cognition and Learning' },
  { value: 'COMMUNICATION_INTERACTION', label: 'Communication and Interaction' },
  { value: 'SEMH', label: 'Social, Emotional and Mental Health' },
  { value: 'SENSORY_PHYSICAL', label: 'Sensory and/or Physical Needs' },
];

const SECONDARY_NEED_OPTIONS = [
  { value: 'SPLD', label: 'Specific Learning Difficulty (SpLD)' },
  { value: 'MLD', label: 'Moderate Learning Difficulty (MLD)' },
  { value: 'SLD', label: 'Severe Learning Difficulty (SLD)' },
  { value: 'PMLD', label: 'Profound and Multiple Learning Difficulty (PMLD)' },
  { value: 'SLCN', label: 'Speech, Language and Communication Needs' },
  { value: 'ASD', label: 'Autism Spectrum Disorder' },
  { value: 'SEMH', label: 'Social, Emotional and Mental Health' },
  { value: 'VI', label: 'Visual Impairment' },
  { value: 'HI', label: 'Hearing Impairment' },
  { value: 'MSI', label: 'Multi-Sensory Impairment' },
  { value: 'PD', label: 'Physical Disability' },
];

const YEAR_GROUPS = [
  'Nursery', 'Reception', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6',
  'Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12', 'Year 13', 'Post-16',
];

// Form Step Component
interface StepProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isCompleted: boolean;
  isActive: boolean;
  stepNumber: number;
}

const FormStep: React.FC<StepProps> = ({ title, description, icon, isCompleted, isActive, stepNumber }) => (
  <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
    isActive ? 'bg-indigo-50 border-2 border-indigo-500' : 
    isCompleted ? 'bg-green-50 border border-green-200' : 
    'bg-gray-50 border border-gray-200'
  }`}>
    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
      isActive ? 'bg-indigo-600 text-white' :
      isCompleted ? 'bg-green-500 text-white' :
      'bg-gray-200 text-gray-500'
    }`}>
      {isCompleted ? <CheckCircle className="w-5 h-5" /> : icon}
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium ${
          isActive ? 'text-indigo-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
        }`}>
          Step {stepNumber}
        </span>
      </div>
      <div className={`font-medium ${isActive ? 'text-indigo-900' : 'text-gray-900'}`}>{title}</div>
      <div className="text-xs text-gray-500">{description}</div>
    </div>
  </div>
);

// Parent Card Component
const ParentCard: React.FC<{
  parent: ParentDetails;
  index: number;
  onChange: (index: number, field: keyof ParentDetails, value: string | boolean) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}> = ({ parent, index, onChange, onRemove, canRemove }) => (
  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
    <div className="flex items-center justify-between mb-4">
      <h4 className="font-medium text-gray-900">Parent/Carer {index + 1}</h4>
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm" htmlFor={`parent-${index}-main-contact`}>
          <input
            id={`parent-${index}-main-contact`}
            type="checkbox"
            checked={parent.isMainContact}
            onChange={(e) => onChange(index, 'isMainContact', e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          Main Contact
        </label>
        {canRemove && (
          <button
            onClick={() => onRemove(index)}
            className="p-1 text-red-500 hover:bg-red-50 rounded"
            title="Remove parent/carer"
            aria-label={`Remove parent/carer ${index + 1}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`parent-${index}-firstname`}>First Name *</label>
        <input
          id={`parent-${index}-firstname`}
          type="text"
          value={parent.firstName}
          onChange={(e) => onChange(index, 'firstName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`parent-${index}-lastname`}>Last Name *</label>
        <input
          id={`parent-${index}-lastname`}
          type="text"
          value={parent.lastName}
          onChange={(e) => onChange(index, 'lastName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`parent-${index}-relationship`}>Relationship *</label>
        <select
          id={`parent-${index}-relationship`}
          value={parent.relationship}
          onChange={(e) => onChange(index, 'relationship', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          aria-label="Select relationship"
          required
        >
          <option value="">Select...</option>
          <option value="Mother">Mother</option>
          <option value="Father">Father</option>
          <option value="Legal Guardian">Legal Guardian</option>
          <option value="Foster Carer">Foster Carer</option>
          <option value="Grandparent">Grandparent</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`parent-${index}-email`}>
          <Mail className="w-3 h-3 inline mr-1" />
          Email *
        </label>
        <input
          id={`parent-${index}-email`}
          type="email"
          value={parent.email}
          onChange={(e) => onChange(index, 'email', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`parent-${index}-phone`}>
          <Phone className="w-3 h-3 inline mr-1" />
          Phone *
        </label>
        <input
          id={`parent-${index}-phone`}
          type="tel"
          value={parent.phone}
          onChange={(e) => onChange(index, 'phone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`parent-${index}-address`}>
          <MapPin className="w-3 h-3 inline mr-1" />
          Address
        </label>
        <input
          id={`parent-${index}-address`}
          type="text"
          value={parent.address}
          onChange={(e) => onChange(index, 'address', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    </div>
  </div>
);

// SEN Support History Card
const SENSupportCard: React.FC<{
  support: SENSupport;
  index: number;
  onChange: (index: number, field: keyof SENSupport, value: string) => void;
  onRemove: (index: number) => void;
}> = ({ support, index, onChange, onRemove }) => (
  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
    <div className="flex items-center justify-between mb-3">
      <h4 className="font-medium text-gray-900">Support Episode {index + 1}</h4>
      <button
        onClick={() => onRemove(index)}
        className="p-1 text-red-500 hover:bg-red-50 rounded"
        title="Remove support episode"
        aria-label={`Remove support episode ${index + 1}`}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`support-${index}-type`}>Type of Support</label>
        <select
          id={`support-${index}-type`}
          value={support.type}
          onChange={(e) => onChange(index, 'type', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          aria-label="Select type of support"
        >
          <option value="">Select...</option>
          <option value="SEN Support">SEN Support</option>
          <option value="1:1 Support">1:1 Teaching Assistant Support</option>
          <option value="Small Group">Small Group Intervention</option>
          <option value="SALT">Speech and Language Therapy</option>
          <option value="OT">Occupational Therapy</option>
          <option value="EP Involvement">EP Involvement</option>
          <option value="External Agency">Other External Agency</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`support-${index}-startdate`}>Start Date</label>
        <input
          id={`support-${index}-startdate`}
          type="date"
          value={support.startDate}
          onChange={(e) => onChange(index, 'startDate', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`support-${index}-duration`}>Duration</label>
        <input
          id={`support-${index}-duration`}
          type="text"
          value={support.duration}
          onChange={(e) => onChange(index, 'duration', e.target.value)}
          placeholder="e.g., 6 months, ongoing"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`support-${index}-outcome`}>Outcome</label>
        <select
          id={`support-${index}-outcome`}
          value={support.outcome}
          onChange={(e) => onChange(index, 'outcome', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          aria-label="Select outcome"
        >
          <option value="">Select...</option>
          <option value="Good Progress">Good Progress</option>
          <option value="Some Progress">Some Progress</option>
          <option value="Limited Progress">Limited Progress</option>
          <option value="Ongoing">Ongoing</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`support-${index}-description`}>Description</label>
        <textarea
          id={`support-${index}-description`}
          value={support.description}
          onChange={(e) => onChange(index, 'description', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Describe the support provided..."
        />
      </div>
    </div>
  </div>
);

// Main Component
interface SchoolSubmissionInterfaceProps {
  schoolId: string;
  schoolName: string;
  onSubmit?: (data: FormData) => void;
  onSaveDraft?: (data: FormData) => void;
}

export default function SchoolSubmissionInterface({
  schoolId,
  schoolName,
  onSubmit,
  onSaveDraft,
}: SchoolSubmissionInterfaceProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [loadingEvidence, setLoadingEvidence] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    child: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      uln: '',
      nhsNumber: '',
      address: '',
      postcode: '',
      currentSchool: schoolName,
      currentYear: '',
    },
    parents: [{
      firstName: '',
      lastName: '',
      relationship: '',
      email: '',
      phone: '',
      address: '',
      postcode: '',
      isMainContact: true,
    }],
    requestType: 'INITIAL_ASSESSMENT',
    primaryNeedCategory: '',
    secondaryNeedCategories: [],
    senSupportHistory: [],
    currentProvision: '',
    requestedProvision: '',
    evidenceOfNeed: '',
    parentalViews: '',
    childViews: '',
    schoolViews: '',
    documents: [],
    parentalConsent: false,
    parentalConsentDate: '',
    declarationAgreed: false,
  });

  const childAgeYears = getAgeYears(formData.child.dateOfBirth);
  // UK online service consent age is commonly treated as 13+, but capacity to consent varies.
  // We use a conservative threshold to *prompt consideration*, not to automate legal decisions.
  const showOlderStudentConsentPrompt = childAgeYears !== null && childAgeYears >= 13;
  
  // Steps configuration
  const steps = [
    { title: 'Child Details', description: 'Basic information about the child', icon: <User className="w-5 h-5" /> },
    { title: 'Parent/Carer', description: 'Contact details for parents', icon: <Users className="w-5 h-5" /> },
    { title: 'SEN Profile', description: 'Needs and support history', icon: <Brain className="w-5 h-5" /> },
    { title: 'Evidence', description: 'Supporting information', icon: <FileText className="w-5 h-5" /> },
    { title: 'Views', description: 'Parent, child and school views', icon: <MessageSquare className="w-5 h-5" /> },
    { title: 'Review', description: 'Check and submit', icon: <CheckCircle className="w-5 h-5" /> },
  ];
  
  // Handle child details change
  const handleChildChange = (field: keyof ChildDetails, value: string) => {
    setFormData((prev) => ({
      ...prev,
      child: { ...prev.child, [field]: value },
    }));
  };
  
  // Handle parent change
  const handleParentChange = (index: number, field: keyof ParentDetails, value: string | boolean) => {
    setFormData((prev) => {
      const newParents = [...prev.parents];
      newParents[index] = { ...newParents[index], [field]: value };
      return { ...prev, parents: newParents };
    });
  };
  
  // Add parent
  const handleAddParent = () => {
    setFormData((prev) => ({
      ...prev,
      parents: [
        ...prev.parents,
        {
          firstName: '',
          lastName: '',
          relationship: '',
          email: '',
          phone: '',
          address: '',
          postcode: '',
          isMainContact: false,
        },
      ],
    }));
  };
  
  // Remove parent
  const handleRemoveParent = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      parents: prev.parents.filter((_, i) => i !== index),
    }));
  };
  
  // Handle SEN support change
  const handleSupportChange = (index: number, field: keyof SENSupport, value: string) => {
    setFormData((prev) => {
      const newSupport = [...prev.senSupportHistory];
      newSupport[index] = { ...newSupport[index], [field]: value };
      return { ...prev, senSupportHistory: newSupport };
    });
  };
  
  // Add SEN support
  const handleAddSupport = () => {
    setFormData((prev) => ({
      ...prev,
      senSupportHistory: [
        ...prev.senSupportHistory,
        { type: '', description: '', startDate: '', duration: '', outcome: '' },
      ],
    }));
  };
  
  // Remove SEN support
  const handleRemoveSupport = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      senSupportHistory: prev.senSupportHistory.filter((_, i) => i !== index),
    }));
  };
  
  // Toggle secondary need
  const toggleSecondaryNeed = (need: string) => {
    setFormData((prev) => ({
      ...prev,
      secondaryNeedCategories: prev.secondaryNeedCategories.includes(need)
        ? prev.secondaryNeedCategories.filter((n) => n !== need)
        : [...prev.secondaryNeedCategories, need],
    }));
  };
  
  // Validate current step
  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 1:
        if (!formData.child.firstName) newErrors['child.firstName'] = 'First name is required';
        if (!formData.child.lastName) newErrors['child.lastName'] = 'Last name is required';
        if (!formData.child.dateOfBirth) newErrors['child.dateOfBirth'] = 'Date of birth is required';
        if (!formData.child.currentYear) newErrors['child.currentYear'] = 'Year group is required';
        break;
      case 2:
        if (formData.parents.length === 0) {
          newErrors['parents'] = 'At least one parent/carer is required';
        } else {
          formData.parents.forEach((parent, i) => {
            if (!parent.firstName) newErrors[`parents.${i}.firstName`] = 'First name is required';
            if (!parent.lastName) newErrors[`parents.${i}.lastName`] = 'Last name is required';
            if (!parent.email) newErrors[`parents.${i}.email`] = 'Email is required';
            if (!parent.phone) newErrors[`parents.${i}.phone`] = 'Phone is required';
          });
        }
        break;
      case 3:
        if (!formData.primaryNeedCategory) newErrors['primaryNeedCategory'] = 'Primary need category is required';
        break;
      case 4:
        if (!formData.evidenceOfNeed) newErrors['evidenceOfNeed'] = 'Evidence of need is required';
        break;
      case 6:
        if (!formData.parentalConsent) newErrors['parentalConsent'] = 'Parental consent is required';
        if (!formData.declarationAgreed) newErrors['declarationAgreed'] = 'Declaration must be agreed';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);
  
  // Load evidence from school records
  const handleLoadEvidence = async () => {
    setLoadingEvidence(true);
    try {
      // In a real app, we would use the student's ID based on the selected child.
      // For this enterprise demo, we simulate fetching the comprehensive history for the current student.
      const result = await fetchStudentInterventions(1);
      
      if (result.success && result.data) {
        // Map interventions to SEN Support structure
        // We cast to any because the serialized types from server action might have string dates
        const mappedSupport: SENSupport[] = result.data.map((intervention: any) => ({
          type: intervention.name,
          description: `${intervention.description}\n\nRationale: ${intervention.rationale}\nTier: ${intervention.tier}`,
          startDate: intervention.startDate.split('T')[0],
          duration: `${intervention.totalPlannedSessions} sessions`,
          outcome: intervention.status === 'completed' ? 'Target Achieved' : 'Ongoing monitoring'
        }));

        setFormData(prev => ({
          ...prev,
          senSupportHistory: [...prev.senSupportHistory, ...mappedSupport],
          // Also intelligent pre-fill of Evidence of Need if generic/empty
          evidenceOfNeed: prev.evidenceOfNeed.length < 50 
            ? "Primary need identified through following assessments:\n\n" + result.data.map((i: any) => `• ${i.name}: ${i.rationale}`).join('\n')
            : prev.evidenceOfNeed
        }));
      }
    } catch (error) {
      console.error('Failed to load evidence', error);
      // We could set a specific error here if needed
    } finally {
      setLoadingEvidence(false);
    }
  };

  // Navigate steps
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    }
  };
  
  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };
  
  // Save draft
  const handleSaveDraft = async () => {
    setSavingDraft(true);
    try {
      if (onSaveDraft) {
        await onSaveDraft(formData);
      }
    } finally {
      setSavingDraft(false);
    }
  };
  
  // Submit form
  const handleSubmit = async () => {
    if (!validateStep(6)) return;
    
    setSubmitting(true);
    try {
      const response = await fetch('/api/la/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId,
          ...formData,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to submit application');
      
      if (onSubmit) {
        onSubmit(formData);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setErrors({ submit: 'Failed to submit application. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Calculate step completion
  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.child.firstName && formData.child.lastName && formData.child.dateOfBirth && formData.child.currentYear);
      case 2:
        return formData.parents.length > 0 && formData.parents.every(p => p.firstName && p.lastName && p.email && p.phone);
      case 3:
        return !!formData.primaryNeedCategory;
      case 4:
        return !!formData.evidenceOfNeed;
      case 5:
        return !!(formData.parentalViews || formData.childViews || formData.schoolViews);
      case 6:
        return formData.parentalConsent && formData.declarationAgreed;
      default:
        return false;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <School className="w-8 h-8" />
            <h1 className="text-2xl font-bold">EHC Needs Assessment Request</h1>
          </div>
          <p className="text-indigo-100">
            {schoolName} • Submit a request for an Education, Health and Care needs assessment
          </p>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Steps Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-3">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="cursor-pointer"
                  onClick={() => {
                    if (index + 1 < currentStep || isStepComplete(index)) {
                      setCurrentStep(index + 1);
                    }
                  }}
                >
                  <FormStep
                    {...step}
                    stepNumber={index + 1}
                    isActive={currentStep === index + 1}
                    isCompleted={isStepComplete(index + 1) && currentStep > index + 1}
                  />
                </div>
              ))}
              
              {/* Save Draft Button */}
              <button
                onClick={handleSaveDraft}
                disabled={savingDraft}
                className="w-full mt-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                {savingDraft ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Draft
              </button>
            </div>
          </div>
          
          {/* Form Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {/* Step 1: Child Details */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Child Details</h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="child-firstName">First Name *</label>
                        <input
                          id="child-firstName"
                          type="text"
                          value={formData.child.firstName}
                          onChange={(e) => handleChildChange('firstName', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                            errors['child.firstName'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors['child.firstName'] && (
                          <p className="text-red-500 text-sm mt-1">{errors['child.firstName']}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="child-lastName">Last Name *</label>
                        <input
                          id="child-lastName"
                          type="text"
                          value={formData.child.lastName}
                          onChange={(e) => handleChildChange('lastName', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                            errors['child.lastName'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors['child.lastName'] && (
                          <p className="text-red-500 text-sm mt-1">{errors['child.lastName']}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="child-dateOfBirth">Date of Birth *</label>
                        <input
                          id="child-dateOfBirth"
                          type="date"
                          value={formData.child.dateOfBirth}
                          onChange={(e) => handleChildChange('dateOfBirth', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                            errors['child.dateOfBirth'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="child-gender">Gender</label>
                        <select
                          id="child-gender"
                          value={formData.child.gender}
                          onChange={(e) => handleChildChange('gender', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          aria-label="Select gender"
                        >
                          <option value="">Select...</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="child-currentYear">Year Group *</label>
                        <select
                          id="child-currentYear"
                          value={formData.child.currentYear}
                          onChange={(e) => handleChildChange('currentYear', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                            errors['child.currentYear'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          aria-label="Select year group"
                        >
                          <option value="">Select...</option>
                          {YEAR_GROUPS.map((year) => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="child-uln">ULN (if known)</label>
                        <input
                          id="child-uln"
                          type="text"
                          value={formData.child.uln}
                          onChange={(e) => handleChildChange('uln', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Unique Learner Number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="child-nhsNumber">NHS Number (if known)</label>
                        <input
                          id="child-nhsNumber"
                          type="text"
                          value={formData.child.nhsNumber}
                          onChange={(e) => handleChildChange('nhsNumber', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="NHS Number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="child-currentSchool">Current School</label>
                        <input
                          id="child-currentSchool"
                          type="text"
                          value={formData.child.currentSchool}
                          disabled
                          className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-600"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="child-address">Address</label>
                        <input
                          id="child-address"
                          type="text"
                          value={formData.child.address}
                          onChange={(e) => handleChildChange('address', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Street address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="child-postcode">Postcode</label>
                        <input
                          id="child-postcode"
                          type="text"
                          value={formData.child.postcode}
                          onChange={(e) => handleChildChange('postcode', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Postcode"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Request Type *</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {REQUEST_TYPES.map((type) => (
                          <label
                            key={type.value}
                            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                              formData.requestType === type.value
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="requestType"
                              value={type.value}
                              checked={formData.requestType === type.value}
                              onChange={(e) => setFormData((prev) => ({ ...prev, requestType: e.target.value }))}
                              className="text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm font-medium text-gray-900">{type.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Step 2: Parent/Carer Details */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Parent/Carer Details</h2>
                    <button
                      onClick={handleAddParent}
                      className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Parent/Carer
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {formData.parents.map((parent, index) => (
                      <ParentCard
                        key={index}
                        parent={parent}
                        index={index}
                        onChange={handleParentChange}
                        onRemove={handleRemoveParent}
                        canRemove={formData.parents.length > 1}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              
              {/* Step 3: SEN Profile */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">SEN Profile</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Primary Need Category *</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {PRIMARY_NEED_CATEGORIES.map((category) => (
                          <label
                            key={category.value}
                            className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                              formData.primaryNeedCategory === category.value
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="primaryNeedCategory"
                              value={category.value}
                              checked={formData.primaryNeedCategory === category.value}
                              onChange={(e) => setFormData((prev) => ({ ...prev, primaryNeedCategory: e.target.value }))}
                              className="text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm font-medium text-gray-900">{category.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Secondary Need Categories (select all that apply)
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {SECONDARY_NEED_OPTIONS.map((option) => (
                          <label
                            key={option.value}
                            className={`flex items-center gap-2 p-2 border rounded cursor-pointer transition-colors ${
                              formData.secondaryNeedCategories.includes(option.value)
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.secondaryNeedCategories.includes(option.value)}
                              onChange={() => toggleSecondaryNeed(option.value)}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-xs font-medium text-gray-700">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">SEN Support History</label>
                        <div className="flex gap-2">
                          <button
                            onClick={handleLoadEvidence}
                            disabled={loadingEvidence}
                            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 flex items-center gap-1 transition-colors"
                            title="Auto-fill from School Records"
                            type="button"
                          >
                            {loadingEvidence ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                            Import Evidence
                          </button>
                          <button
                            onClick={handleAddSupport}
                            className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 flex items-center gap-1"
                            type="button"
                          >
                            <Plus className="w-4 h-4" />
                            Add Support
                          </button>
                        </div>
                      </div>
                      
                      {formData.senSupportHistory.length === 0 ? (
                        <div className="bg-gray-50 rounded-lg p-6 text-center">
                          <Info className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">
                            Add details of SEN support the child has received
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {formData.senSupportHistory.map((support, index) => (
                            <SENSupportCard
                              key={index}
                              support={support}
                              index={index}
                              onChange={handleSupportChange}
                              onRemove={handleRemoveSupport}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Step 4: Evidence */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Evidence of Need</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Evidence of Need *
                        <span className="text-gray-500 font-normal ml-2">
                          (Why does this child need an EHC needs assessment?)
                        </span>
                      </label>
                      <textarea
                        value={formData.evidenceOfNeed}
                        onChange={(e) => setFormData((prev) => ({ ...prev, evidenceOfNeed: e.target.value }))}
                        rows={6}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors['evidenceOfNeed'] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Describe the evidence that demonstrates the child's needs cannot be met through SEN support alone..."
                      />
                      {errors['evidenceOfNeed'] && (
                        <p className="text-red-500 text-sm mt-1">{errors['evidenceOfNeed']}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Provision</label>
                      <textarea
                        value={formData.currentProvision}
                        onChange={(e) => setFormData((prev) => ({ ...prev, currentProvision: e.target.value }))}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Describe the current provision in place for the child..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Requested Provision</label>
                      <textarea
                        value={formData.requestedProvision}
                        onChange={(e) => setFormData((prev) => ({ ...prev, requestedProvision: e.target.value }))}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="What provision do you believe is needed for this child..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3" htmlFor="supporting-documents">Supporting Documents</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 mb-2">
                          Drag and drop files here, or click to browse
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF, Word documents, or images up to 10MB
                        </p>
                        <input 
                          id="supporting-documents" 
                          type="file" 
                          className="hidden" 
                          multiple 
                          aria-label="Upload supporting documents"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Step 5: Views */}
              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Views & Aspirations</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parent/Carer Views
                      </label>
                      <textarea
                        value={formData.parentalViews}
                        onChange={(e) => setFormData((prev) => ({ ...prev, parentalViews: e.target.value }))}
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="What are the parent/carer's views about their child's education and needs?"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Child&apos;s Views
                      </label>
                      <textarea
                        value={formData.childViews}
                        onChange={(e) => setFormData((prev) => ({ ...prev, childViews: e.target.value }))}
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="What are the child's views, interests and aspirations?"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        School Views
                      </label>
                      <textarea
                        value={formData.schoolViews}
                        onChange={(e) => setFormData((prev) => ({ ...prev, schoolViews: e.target.value }))}
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="What are the school's observations and recommendations?"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Step 6: Review & Submit */}
              {currentStep === 6 && (
                <motion.div
                  key="step6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Review Application</h2>
                    
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-indigo-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-indigo-700 font-medium mb-2">
                          <User className="w-4 h-4" />
                          Child
                        </div>
                        <p className="text-gray-900 font-semibold">
                          {formData.child.firstName} {formData.child.lastName}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {formData.child.dateOfBirth && format(new Date(formData.child.dateOfBirth), 'dd MMMM yyyy')}
                          {formData.child.currentYear && ` • ${formData.child.currentYear}`}
                        </p>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-purple-700 font-medium mb-2">
                          <Brain className="w-4 h-4" />
                          Primary Need
                        </div>
                        <p className="text-gray-900 font-semibold">
                          {PRIMARY_NEED_CATEGORIES.find(c => c.value === formData.primaryNeedCategory)?.label || 'Not specified'}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {formData.secondaryNeedCategories.length} secondary needs
                        </p>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                          <Users className="w-4 h-4" />
                          Parents/Carers
                        </div>
                        <p className="text-gray-900 font-semibold">
                          {formData.parents.length} registered
                        </p>
                        <p className="text-gray-600 text-sm">
                          Main contact: {formData.parents.find(p => p.isMainContact)?.firstName || 'Not set'}
                        </p>
                      </div>
                      
                      <div className="bg-amber-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-amber-700 font-medium mb-2">
                          <FileText className="w-4 h-4" />
                          Request Type
                        </div>
                        <p className="text-gray-900 font-semibold">
                          {REQUEST_TYPES.find(t => t.value === formData.requestType)?.label}
                        </p>
                      </div>
                    </div>
                    
                    {/* Completion Checklist */}
                    <div className="border rounded-lg p-4 mb-6">
                      <h3 className="font-medium text-gray-900 mb-3">Completion Checklist</h3>
                      <div className="space-y-2">
                        {steps.slice(0, -1).map((step, index) => (
                          <div key={index} className="flex items-center gap-2">
                            {isStepComplete(index + 1) ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-amber-500" />
                            )}
                            <span className={isStepComplete(index + 1) ? 'text-gray-700' : 'text-amber-700'}>
                              {step.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Consent & Declaration */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Consent & Declaration</h3>
                    
                    <div className="space-y-4">
                      <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer ${
                        formData.parentalConsent ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      }`}>
                        <input
                          type="checkbox"
                          checked={formData.parentalConsent}
                          onChange={(e) => setFormData((prev) => ({ 
                            ...prev, 
                            parentalConsent: e.target.checked,
                            parentalConsentDate: e.target.checked ? new Date().toISOString() : ''
                          }))}
                          className="mt-0.5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <div>
                          <span className="font-medium text-gray-900">Parental Consent *</span>
                          <p className="text-sm text-gray-600 mt-1">
                            I confirm that the parent/carer has given consent for this EHC needs assessment request
                            to be submitted and for information to be shared with the Local Authority and relevant
                            professionals.
                          </p>

                          {showOlderStudentConsentPrompt && (
                            <div className="mt-3 flex items-start gap-2 rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                              <Info className="w-4 h-4 text-indigo-700 mt-0.5" />
                              <p className="text-sm text-indigo-900">
                                <span className="font-medium">Older student consent check:</span> For older students,
                                the system prompts you to consider if they can give their own consent (in line with
                                your local policy). Where appropriate, involve the child/young person in the consent
                                decision.
                              </p>
                            </div>
                          )}
                        </div>
                      </label>
                      {errors['parentalConsent'] && (
                        <p className="text-red-500 text-sm">{errors['parentalConsent']}</p>
                      )}
                      
                      <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer ${
                        formData.declarationAgreed ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      }`}>
                        <input
                          type="checkbox"
                          checked={formData.declarationAgreed}
                          onChange={(e) => setFormData((prev) => ({ ...prev, declarationAgreed: e.target.checked }))}
                          className="mt-0.5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <div>
                          <span className="font-medium text-gray-900">Declaration *</span>
                          <p className="text-sm text-gray-600 mt-1">
                            I declare that the information provided in this application is accurate to the best of my
                            knowledge. I understand that this request will be processed in accordance with the Children
                            and Families Act 2014 and the SEND Code of Practice 2015.
                          </p>
                        </div>
                      </label>
                      {errors['declarationAgreed'] && (
                        <p className="text-red-500 text-sm">{errors['declarationAgreed']}</p>
                      )}
                    </div>
                  </div>
                  
                  {errors['submit'] && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <p className="text-red-700">{errors['submit']}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  currentStep === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>
              
              {currentStep < 6 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !formData.parentalConsent || !formData.declarationAgreed}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Submit Application
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
