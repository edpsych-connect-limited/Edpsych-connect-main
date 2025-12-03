'use client';

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Research Ethics Submission Component
 * 
 * Complete ethics approval workflow for researchers:
 * - Ethics application form
 * - Document upload
 * - Submission tracking
 * - Review status monitoring
 * - Amendment requests
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, Upload, CheckCircle, Clock, AlertCircle, 
  Send, Save, Trash2, Plus, ChevronDown, ChevronUp,
  Shield, Users, Calendar, Building, Video, HelpCircle
} from 'lucide-react';
import { VideoModal } from '@/components/video/VideoTutorialPlayer';
import toast from 'react-hot-toast';

interface EthicsApplication {
  id: string;
  title: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'revisions_required' | 'rejected';
  submittedDate?: string;
  lastUpdated: string;
  reviewComments?: string;
}

interface FormSection {
  id: string;
  title: string;
  completed: boolean;
}

export default function EthicsSubmissionForm() {
  const [applications, setApplications] = useState<EthicsApplication[]>([]);
  const [activeApplication, setActiveApplication] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showVideoHelp, setShowVideoHelp] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['project-info']));

  // Form state
  const [formData, setFormData] = useState({
    // Project Information
    projectTitle: '',
    principalInvestigator: '',
    institution: '',
    startDate: '',
    endDate: '',
    fundingSource: '',
    
    // Research Description
    researchQuestion: '',
    methodology: '',
    dataCollection: '',
    sampleSize: '',
    participantSelection: '',
    
    // Ethical Considerations
    informedConsent: '',
    confidentiality: '',
    dataProtection: '',
    riskAssessment: '',
    vulnerableParticipants: false,
    vulnerableDetails: '',
    
    // Data Management
    dataStorage: '',
    dataRetention: '',
    dataSharing: '',
    anonymisation: '',
    
    // Supporting Documents
    documents: [] as File[],
  });

  const sections: FormSection[] = [
    { id: 'project-info', title: 'Project Information', completed: !!(formData.projectTitle && formData.principalInvestigator) },
    { id: 'research-desc', title: 'Research Description', completed: !!(formData.researchQuestion && formData.methodology) },
    { id: 'ethics', title: 'Ethical Considerations', completed: !!(formData.informedConsent && formData.riskAssessment) },
    { id: 'data-mgmt', title: 'Data Management', completed: !!(formData.dataStorage && formData.dataRetention) },
    { id: 'documents', title: 'Supporting Documents', completed: formData.documents.length > 0 },
  ];

  const completedSections = sections.filter(s => s.completed).length;
  const progress = Math.round((completedSections / sections.length) * 100);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const response = await fetch('/api/research/ethics/applications');
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Failed to load applications:', error);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, documents: [...prev.documents, ...files] }));
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const handleSaveDraft = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/research/ethics/save-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Draft saved successfully');
        loadApplications();
      } else {
        toast.error('Failed to save draft');
      }
    } catch (error) {
      toast.error('Failed to save draft');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (progress < 100) {
      toast.error('Please complete all sections before submitting');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/research/ethics/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Ethics application submitted successfully');
        loadApplications();
        // Reset form
        setFormData({
          projectTitle: '', principalInvestigator: '', institution: '',
          startDate: '', endDate: '', fundingSource: '',
          researchQuestion: '', methodology: '', dataCollection: '',
          sampleSize: '', participantSelection: '',
          informedConsent: '', confidentiality: '', dataProtection: '',
          riskAssessment: '', vulnerableParticipants: false, vulnerableDetails: '',
          dataStorage: '', dataRetention: '', dataSharing: '', anonymisation: '',
          documents: [],
        });
      } else {
        toast.error('Failed to submit application');
      }
    } catch (error) {
      toast.error('Submission failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: EthicsApplication['status']) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      under_review: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      revisions_required: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    const labels = {
      draft: 'Draft',
      submitted: 'Submitted',
      under_review: 'Under Review',
      approved: 'Approved',
      revisions_required: 'Revisions Required',
      rejected: 'Rejected',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" />
            Research Ethics Submission
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Submit your research ethics application for review and approval
          </p>
        </div>
        <button
          onClick={() => setShowVideoHelp(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
        >
          <Video className="w-4 h-4" />
          Watch Guide
        </button>
      </div>

      {/* Existing Applications */}
      {applications.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Your Applications</h3>
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{app.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Last updated: {new Date(app.lastUpdated).toLocaleDateString('en-GB')}
                  </p>
                </div>
                {getStatusBadge(app.status)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Application Progress</h3>
          <span className="text-sm font-medium text-indigo-600">{progress}% Complete</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {sections.map((section) => (
            <div
              key={section.id}
              className={`text-center text-xs ${section.completed ? 'text-green-600' : 'text-gray-400'}`}
            >
              {section.completed ? <CheckCircle className="w-4 h-4 mx-auto" /> : <Clock className="w-4 h-4 mx-auto" />}
              <span className="block mt-1 truncate">{section.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Sections */}
      <div className="space-y-4">
        {/* Project Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => toggleSection('project-info')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-indigo-600" />
              <span className="font-semibold text-gray-900 dark:text-white">Project Information</span>
              {sections[0].completed && <CheckCircle className="w-4 h-4 text-green-500" />}
            </div>
            {expandedSections.has('project-info') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {expandedSections.has('project-info') && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={formData.projectTitle}
                    onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    placeholder="Enter your research project title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Principal Investigator *
                  </label>
                  <input
                    type="text"
                    value={formData.principalInvestigator}
                    onChange={(e) => handleInputChange('principalInvestigator', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    placeholder="Lead researcher name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Institution
                  </label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => handleInputChange('institution', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    placeholder="University or organisation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Funding Source
                  </label>
                  <input
                    type="text"
                    value={formData.fundingSource}
                    onChange={(e) => handleInputChange('fundingSource', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    placeholder="e.g., Self-funded, ESRC, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Research Description */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => toggleSection('research-desc')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span className="font-semibold text-gray-900 dark:text-white">Research Description</span>
              {sections[1].completed && <CheckCircle className="w-4 h-4 text-green-500" />}
            </div>
            {expandedSections.has('research-desc') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {expandedSections.has('research-desc') && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Research Question(s) *
                </label>
                <textarea
                  value={formData.researchQuestion}
                  onChange={(e) => handleInputChange('researchQuestion', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  placeholder="What are you trying to find out?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Methodology *
                </label>
                <textarea
                  value={formData.methodology}
                  onChange={(e) => handleInputChange('methodology', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  placeholder="Describe your research methodology and approach"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sample Size
                  </label>
                  <input
                    type="text"
                    value={formData.sampleSize}
                    onChange={(e) => handleInputChange('sampleSize', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    placeholder="e.g., 50 participants"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Participant Selection
                  </label>
                  <input
                    type="text"
                    value={formData.participantSelection}
                    onChange={(e) => handleInputChange('participantSelection', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    placeholder="How will participants be selected?"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ethical Considerations */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => toggleSection('ethics')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-indigo-600" />
              <span className="font-semibold text-gray-900 dark:text-white">Ethical Considerations</span>
              {sections[2].completed && <CheckCircle className="w-4 h-4 text-green-500" />}
            </div>
            {expandedSections.has('ethics') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {expandedSections.has('ethics') && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Informed Consent Process *
                </label>
                <textarea
                  value={formData.informedConsent}
                  onChange={(e) => handleInputChange('informedConsent', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  placeholder="How will you obtain informed consent?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Risk Assessment *
                </label>
                <textarea
                  value={formData.riskAssessment}
                  onChange={(e) => handleInputChange('riskAssessment', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  placeholder="What are the potential risks and how will you mitigate them?"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="vulnerable"
                  checked={formData.vulnerableParticipants}
                  onChange={(e) => handleInputChange('vulnerableParticipants', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="vulnerable" className="text-sm text-gray-700 dark:text-gray-300">
                  This research involves vulnerable participants (children, individuals with SEND, etc.)
                </label>
              </div>
              {formData.vulnerableParticipants && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Additional Safeguards for Vulnerable Participants
                  </label>
                  <textarea
                    value={formData.vulnerableDetails}
                    onChange={(e) => handleInputChange('vulnerableDetails', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    placeholder="Describe additional protections and safeguards"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Data Management */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => toggleSection('data-mgmt')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-indigo-600" />
              <span className="font-semibold text-gray-900 dark:text-white">Data Management</span>
              {sections[3].completed && <CheckCircle className="w-4 h-4 text-green-500" />}
            </div>
            {expandedSections.has('data-mgmt') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {expandedSections.has('data-mgmt') && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data Storage *
                  </label>
                  <input
                    type="text"
                    value={formData.dataStorage}
                    onChange={(e) => handleInputChange('dataStorage', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    placeholder="Where will data be stored?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data Retention Period *
                  </label>
                  <input
                    type="text"
                    value={formData.dataRetention}
                    onChange={(e) => handleInputChange('dataRetention', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    placeholder="e.g., 5 years post-publication"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Anonymisation Strategy
                </label>
                <textarea
                  value={formData.anonymisation}
                  onChange={(e) => handleInputChange('anonymisation', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  placeholder="How will you anonymise participant data?"
                />
              </div>
            </div>
          )}
        </div>

        {/* Supporting Documents */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => toggleSection('documents')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <div className="flex items-center gap-3">
              <Upload className="w-5 h-5 text-indigo-600" />
              <span className="font-semibold text-gray-900 dark:text-white">Supporting Documents</span>
              {sections[4].completed && <CheckCircle className="w-4 h-4 text-green-500" />}
            </div>
            {expandedSections.has('documents') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {expandedSections.has('documents') && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  Upload consent forms, participant information sheets, questionnaires, etc.
                </p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Files
                </label>
              </div>
              {formData.documents.length > 0 && (
                <div className="space-y-2">
                  {formData.documents.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                      </div>
                      <button
                        onClick={() => removeDocument(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-end">
        <button
          onClick={handleSaveDraft}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Draft
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading || progress < 100}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          Submit for Review
        </button>
      </div>

      {/* Help Section */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <HelpCircle className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Ethics Submission Help</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Our ethics review process typically takes 5-10 working days. You can track the status
              of your application at any time. If revisions are required, you'll receive detailed
              feedback to guide your amendments.
            </p>
          </div>
        </div>
      </div>

      {/* Video Help Modal */}
      {showVideoHelp && (
        <VideoModal
          videoKey="compliance-data-protection"
          title="Research Ethics Submission Guide"
          isOpen={showVideoHelp}
          onClose={() => setShowVideoHelp(false)}
        />
      )}
    </div>
  );
}
