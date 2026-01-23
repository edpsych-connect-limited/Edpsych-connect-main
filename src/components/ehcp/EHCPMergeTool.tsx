'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Users,
  Clock,
  ArrowLeft,
  RefreshCw,
  Download,
  Printer,
  Eye,
  Edit,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Heart,
  Target,
  GraduationCap,
  Shield,
  Building,
  Banknote,
  Merge,
  FileCheck,
  AlertCircle,
  BookOpen,
  Sparkles,
  Wand2,
  Lock,
  Unlock,
  History,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

import { smartMergeContributions } from '@/lib/ehcp/smart-merge';

// Helper function to format dates
const format = (date: string | Date, _pattern?: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Types
interface Contribution {
  id: string;
  professionalRole: string;
  professionalName: string;
  section: string;
  content: string;
  status: string;
  submittedAt: string | null;
}

interface EHCPSection {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  statutoryRequirement: string;
  contributions: Contribution[];
  mergedContent: string;
  isLocked: boolean;
  lastEditedBy: string | null;
  lastEditedAt: string | null;
}

interface Child {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  uln?: string;
}

interface Application {
  id: string;
  referenceNumber: string;
  child: Child;
  status: string;
}

interface MergeToolProps {
  applicationId: string;
  application: Application;
  onBack: () => void;
  onSave?: (sections: EHCPSection[]) => void;
}

// EHCP Section definitions based on UK SEND Code of Practice
const EHCP_SECTIONS: Omit<EHCPSection, 'contributions' | 'mergedContent' | 'isLocked' | 'lastEditedBy' | 'lastEditedAt'>[] = [
  {
    id: 'section-a',
    key: 'SECTION_A',
    title: 'Section A',
    description: "Views, Interests and Aspirations",
    icon: <Eye className="w-5 h-5" />,
    statutoryRequirement: "The views, interests and aspirations of the child and their parents, the outcomes they wish to see.",
  },
  {
    id: 'section-b',
    key: 'SECTION_B',
    title: 'Section B',
    description: "Special Educational Needs",
    icon: <BookOpen className="w-5 h-5" />,
    statutoryRequirement: "A description of the child's special educational needs.",
  },
  {
    id: 'section-c',
    key: 'SECTION_C',
    title: 'Section C',
    description: "Health Needs",
    icon: <Stethoscope className="w-5 h-5" />,
    statutoryRequirement: "Health needs related to the child's SEN.",
  },
  {
    id: 'section-d',
    key: 'SECTION_D',
    title: 'Section D',
    description: "Social Care Needs",
    icon: <Heart className="w-5 h-5" />,
    statutoryRequirement: "Social care needs related to the child's SEN or disability.",
  },
  {
    id: 'section-e',
    key: 'SECTION_E',
    title: 'Section E',
    description: "Outcomes Sought",
    icon: <Target className="w-5 h-5" />,
    statutoryRequirement: "Outcomes sought for the child, including those beyond compulsory school age.",
  },
  {
    id: 'section-f',
    key: 'SECTION_F',
    title: 'Section F',
    description: "Special Educational Provision",
    icon: <GraduationCap className="w-5 h-5" />,
    statutoryRequirement: "The special educational provision required by the child.",
  },
  {
    id: 'section-g',
    key: 'SECTION_G',
    title: 'Section G',
    description: "Health Provision",
    icon: <Shield className="w-5 h-5" />,
    statutoryRequirement: "Any health provision reasonably required by the child's SEN.",
  },
  {
    id: 'section-h1',
    key: 'SECTION_H1',
    title: 'Section H1',
    description: "Social Care Provision (Legislation)",
    icon: <Users className="w-5 h-5" />,
    statutoryRequirement: "Social care provision required under section 2 of the Chronically Sick and Disabled Persons Act 1970.",
  },
  {
    id: 'section-h2',
    key: 'SECTION_H2',
    title: 'Section H2',
    description: "Social Care Provision (Other)",
    icon: <Users className="w-5 h-5" />,
    statutoryRequirement: "Any other social care provision reasonably required by the child.",
  },
  {
    id: 'section-i',
    key: 'SECTION_I',
    title: 'Section I',
    description: "Placement",
    icon: <Building className="w-5 h-5" />,
    statutoryRequirement: "The name and type of the school, institution or other placement.",
  },
  {
    id: 'section-j',
    key: 'SECTION_J',
    title: 'Section J',
    description: "Personal Budget",
    icon: <Banknote className="w-5 h-5" />,
    statutoryRequirement: "Details of any Personal Budget arrangements (if applicable).",
  },
];

// Helper functions
const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    EDUCATIONAL_PSYCHOLOGIST: 'bg-purple-100 text-purple-700 border-purple-200',
    HEALTH_PROFESSIONAL: 'bg-red-100 text-red-700 border-red-200',
    SOCIAL_WORKER: 'bg-pink-100 text-pink-700 border-pink-200',
    SCHOOL_SENCO: 'bg-blue-100 text-blue-700 border-blue-200',
    LA_CASEWORKER: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    PARENT: 'bg-green-100 text-green-700 border-green-200',
  };
  return colors[role] || 'bg-gray-100 text-gray-700 border-gray-200';
};

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    EDUCATIONAL_PSYCHOLOGIST: 'EP',
    HEALTH_PROFESSIONAL: 'Health',
    SOCIAL_WORKER: 'Social Care',
    SCHOOL_SENCO: 'SENCO',
    LA_CASEWORKER: 'LA',
    PARENT: 'Parent',
  };
  return labels[role] || role;
};

// Contribution Card Component
const ContributionCard: React.FC<{
  contribution: Contribution;
  onUseContent: (content: string) => void;
  isSelected: boolean;
}> = ({ contribution, onUseContent, isSelected }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className={`border rounded-lg transition-all ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'}`}>
      <div
        className="p-3 cursor-pointer flex items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getRoleColor(contribution.professionalRole)}`}>
            {getRoleLabel(contribution.professionalRole)}
          </span>
          <span className="text-sm font-medium text-gray-900">{contribution.professionalName}</span>
          {contribution.submittedAt && (
            <span className="text-xs text-gray-500">
              {format(new Date(contribution.submittedAt), 'dd MMM')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUseContent(contribution.content);
            }}
            className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
          >
            Use
          </button>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 border-t border-gray-100">
              <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded max-h-48 overflow-y-auto">
                {contribution.content}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Section Editor Component
const SectionEditor: React.FC<{
  section: EHCPSection;
  onContentChange: (content: string) => void;
  onLockToggle: () => void;
  onAutoMerge: () => void;
}> = ({ section, onContentChange, onLockToggle, onAutoMerge }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localContent, setLocalContent] = useState(section.mergedContent);
  const hasContributions = section.contributions.length > 0;
  
  const handleSave = () => {
    onContentChange(localContent);
    setIsEditing(false);
  };
  
  const handleUseContribution = (content: string) => {
    if (section.mergedContent) {
      setLocalContent(section.mergedContent + '\n\n---\n\n' + content);
    } else {
      setLocalContent(content);
    }
    setIsEditing(true);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Section Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-indigo-600">
              {section.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{section.title}: {section.description}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{section.statutoryRequirement}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onLockToggle}
              className={`p-2 rounded-lg transition-colors ${
                section.isLocked
                  ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              title={section.isLocked ? 'Unlock for editing' : 'Lock section'}
            >
              {section.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
            {hasContributions && (
              <button
                onClick={onAutoMerge}
                className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-indigo-600 flex items-center gap-1.5"
              >
                <Wand2 className="w-4 h-4" />
                Auto-Merge
              </button>
            )}
          </div>
        </div>
        
        {/* Contribution Badges */}
        {hasContributions && (
          <div className="flex flex-wrap gap-2 mt-3">
            {section.contributions.map((c) => (
              <span
                key={c.id}
                className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getRoleColor(c.professionalRole)}`}
              >
                {getRoleLabel(c.professionalRole)}: {c.professionalName.split(' ')[0]}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Content Area */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contributions Panel */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Professional Contributions ({section.contributions.length})
            </h4>
            {section.contributions.length === 0 ? (
              <EmptyState
                title="No contributions yet"
                description="Invite professionals to contribute evidence for this section."
                icon={<AlertCircle className="w-8 h-8 text-blue-500" />}
                className="bg-gray-50"
              />
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {section.contributions.map((contribution) => (
                  <ContributionCard
                    key={contribution.id}
                    contribution={contribution}
                    onUseContent={handleUseContribution}
                    isSelected={false}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Merged Content Panel */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Merged EHCP Content
              </h4>
              {!section.isLocked && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  {isEditing ? 'Preview' : 'Edit'}
                </button>
              )}
            </div>
            
            {section.isLocked ? (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 text-amber-600 mb-2">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm font-medium">Section Locked</span>
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {section.mergedContent ? (
                    section.mergedContent
                  ) : (
                    <EmptyState
                      title="No content yet"
                      description="Unlock to edit or run auto-merge."
                      icon={<FileText className="w-8 h-8 text-blue-500" />}
                      className="bg-gray-50"
                    />
                  )}
                </div>
              </div>
            ) : isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={localContent}
                  onChange={(e) => setLocalContent(e.target.value)}
                  className="w-full h-60 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="Compose the EHCP content for this section..."
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setLocalContent(section.mergedContent);
                      setIsEditing(false);
                    }}
                    className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 flex items-center gap-1"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 min-h-[150px] max-h-60 overflow-y-auto">
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {section.mergedContent || (
                    <span className="text-gray-400 italic">
                      Click &quot;Auto-Merge&quot; to combine contributions or &quot;Edit&quot; to write content manually.
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {section.lastEditedBy && (
              <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                <History className="w-3 h-3" />
                Last edited by {section.lastEditedBy} 
                {section.lastEditedAt && ` on ${format(new Date(section.lastEditedAt), 'dd MMM yyyy')}`}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function EHCPMergeTool({ applicationId, application, onBack, onSave }: MergeToolProps) {
  const [sections, setSections] = useState<EHCPSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [_activeSection, _setActiveSection] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [conflicts, setConflicts] = useState<string[]>([]);
  
  // Fetch contributions and initialize sections
  const fetchContributions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/la/applications/${applicationId}/contributions`);
      if (!response.ok) throw new Error('Failed to fetch contributions');
      const data = await response.json();
      
      // Initialize sections with contributions mapped to appropriate sections
      const initializedSections: EHCPSection[] = EHCP_SECTIONS.map((s) => ({
        ...s,
        contributions: data.contributions?.filter((c: Contribution) => c.section === s.key) || [],
        mergedContent: data.mergedContent?.[s.key] || '',
        isLocked: false,
        lastEditedBy: null,
        lastEditedAt: null,
      }));
      
      setSections(initializedSections);
    } catch (error) {
      console.error('Error fetching contributions:', error);
      // Initialize with empty sections on error
      setSections(EHCP_SECTIONS.map((s) => ({
        ...s,
        contributions: [],
        mergedContent: '',
        isLocked: false,
        lastEditedBy: null,
        lastEditedAt: null,
      })));
    } finally {
      setLoading(false);
    }
  }, [applicationId]);
  
  useEffect(() => {
    fetchContributions();
  }, [fetchContributions]);
  
  // Handle content change for a section
  const handleContentChange = (sectionId: string, content: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, mergedContent: content, lastEditedAt: new Date().toISOString(), lastEditedBy: 'Current User' }
          : s
      )
    );
  };
  
  // Handle lock toggle
  const handleLockToggle = (sectionId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, isLocked: !s.isLocked } : s
      )
    );
  };
  
  // Auto-merge contributions for a section
  const handleAutoMerge = async (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section || section.contributions.length === 0) return;
    
    // Use Smart Merge Logic
    const result = smartMergeContributions(section.contributions);
    
    if (result.conflicts.length > 0) {
      setConflicts(prev => [...prev, ...result.conflicts]);
    }
    
    handleContentChange(sectionId, result.content);
  };
  
  // Calculate completion status
  const getCompletionStatus = () => {
    const total = sections.length;
    const completed = sections.filter((s) => s.mergedContent.trim().length > 0).length;
    const withContributions = sections.filter((s) => s.contributions.length > 0).length;
    
    return { total, completed, withContributions };
  };
  
  // Save all sections
  const handleSaveAll = async () => {
    try {
      setSaving(true);
      
      const mergedContent: Record<string, string> = {};
      sections.forEach((s) => {
        mergedContent[s.key] = s.mergedContent;
      });
      
      const response = await fetch(`/api/la/applications/${applicationId}/ehcp-draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: mergedContent }),
      });
      
      if (!response.ok) throw new Error('Failed to save EHCP draft');
      
      if (onSave) onSave(sections);
    } catch (error) {
      console.error('Error saving EHCP draft:', error);
    } finally {
      setSaving(false);
    }
  };
  
  const { total, completed, withContributions } = getCompletionStatus();
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Go back"
            aria-label="Go back to previous page"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <Merge className="w-6 h-6 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">EHCP Merge Tool</h1>
            </div>
            <p className="text-gray-500 mt-1">
              {application.referenceNumber} • {application.child.firstName} {application.child.lastName}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(true)}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Eye className="w-5 h-5" />
            Preview EHCP
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Draft
          </button>
        </div>
      </div>
      
      {/* Conflicts Banner */}
      {conflicts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-800">Conflicts Detected</h3>
            <ul className="mt-1 space-y-1 text-sm text-amber-700">
              {conflicts.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
            <button 
              onClick={() => setConflicts([])}
              className="mt-2 text-xs font-medium text-amber-800 hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-1">EHCP Completion Progress</h2>
            <p className="text-indigo-100">
              Merge professional contributions into a unified EHCP document
            </p>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold">{completed}/{total}</div>
              <div className="text-indigo-200 text-sm">Sections Complete</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{withContributions}</div>
              <div className="text-indigo-200 text-sm">With Contributions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{Math.round((completed / total) * 100)}%</div>
              <div className="text-indigo-200 text-sm">Overall Progress</div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div 
          className="mt-4 h-2 bg-indigo-400/30 rounded-full overflow-hidden" 
          role="progressbar" 
          aria-label={`Progress: ${progressPercent}% complete - ${completed} of ${total} sections completed`}
        >
          <div
            className={`h-full bg-white transition-all duration-500 ${
              completed === 0 ? 'w-0' :
              completed === total ? 'w-full' :
              completed <= total * 0.25 ? 'w-1/4' :
              completed <= total * 0.5 ? 'w-1/2' :
              completed <= total * 0.75 ? 'w-3/4' :
              'w-[90%]'
            }`}
          />
        </div>
      </div>
      
      {/* Quick Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Navigation</h3>
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                const element = document.getElementById(section.id);
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                section.mergedContent
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : section.contributions.length > 0
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {section.mergedContent ? (
                <CheckCircle className="w-3.5 h-3.5" />
              ) : section.contributions.length > 0 ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
              {section.title}
            </button>
          ))}
        </div>
      </div>
      
      {/* Section Editors */}
      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.id} id={section.id}>
            <SectionEditor
              section={section}
              onContentChange={(content) => handleContentChange(section.id, content)}
              onLockToggle={() => handleLockToggle(section.id)}
              onAutoMerge={() => handleAutoMerge(section.id)}
            />
          </div>
        ))}
      </div>
      
      {/* Bottom Actions */}
      <div className="sticky bottom-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <div>
            <span className="text-sm font-medium text-gray-900">
              {completed} of {total} sections completed
            </span>
            <span className="text-sm text-gray-500 ml-2">
              {total - completed} remaining
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(true)}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
            Save & Continue
          </button>
        </div>
      </div>
      
      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">EHCP Preview</h2>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg" title="Print" aria-label="Print EHCP document">
                    <Printer className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg" title="Download" aria-label="Download EHCP document">
                    <Download className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="Close preview"
                    aria-label="Close preview modal"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8">
                {/* EHCP Header */}
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Education, Health and Care Plan
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Prepared in accordance with the Children and Families Act 2014
                  </p>
                </div>
                
                {/* Child Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Child&apos;s Name</span>
                      <div className="font-medium">{application.child.firstName} {application.child.lastName}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Date of Birth</span>
                      <div className="font-medium">
                        {format(new Date(application.child.dateOfBirth), 'dd MMMM yyyy')}
                      </div>
                    </div>
                    {application.child.uln && (
                      <div>
                        <span className="text-sm text-gray-500">ULN</span>
                        <div className="font-medium">{application.child.uln}</div>
                      </div>
                    )}
                    <div>
                      <span className="text-sm text-gray-500">Reference Number</span>
                      <div className="font-medium">{application.referenceNumber}</div>
                    </div>
                  </div>
                </div>
                
                {/* Sections */}
                <div className="space-y-6">
                  {sections.map((section) => (
                    <div key={section.id} className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {section.title}: {section.description}
                      </h3>
                      {section.mergedContent ? (
                        <div className="text-gray-700 whitespace-pre-wrap">
                          {section.mergedContent}
                        </div>
                      ) : (
                        <p className="text-gray-400 italic">
                          This section has not been completed.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
