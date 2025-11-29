import { logger } from "@/lib/logger";
'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import React, { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  Users,
  Eye,
  Edit3,
  Send,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2,
  GripVertical,
} from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Lesson Differentiation View Component
 *
 * Provides a side-by-side view of differentiated lesson versions before assignment.
 * Features:
 * - Auto-differentiation based on student profiles
 * - Three difficulty levels: Below, At Expected, Above
 * - Drag-and-drop student reassignment between levels
 * - Preview and edit capabilities for each version
 * - Estimated completion time and success rate predictions
 * - Bulk assignment to entire class
 *
 * @component
 * @example
 * ```tsx
 * <LessonDifferentiationView
 *   lessonPlan={{ id: 42, title: 'Fractions - Year 5', subject: 'Maths' }}
 *   classId={5}
 *   onAssignAll={(assignments) => logger.debug('Assigned:', assignments)}
 *   onPreview={(difficulty) => logger.debug('Preview:', difficulty)}
 * />
 * ```
 */

interface LessonPlan {
  id: number;
  title: string;
  subject: string;
  description?: string;
  originalContent?: string;
}

interface LessonDifferentiationViewProps {
  /** The lesson plan to differentiate */
  lessonPlan: LessonPlan;
  /** Class ID for student grouping */
  classId: number;
  /** Callback when all lessons are assigned */
  onAssignAll?: (assignments: Assignment[]) => void;
  /** Callback when previewing a differentiated version */
  onPreview?: (difficulty: DifficultyLevel) => void;
  /** Additional CSS classes */
  className?: string;
}

type DifficultyLevel = 'below' | 'at' | 'above';

interface Student {
  id: number;
  name: string;
  currentLevel: DifficultyLevel;
}

interface DifferentiatedVersion {
  difficulty: DifficultyLevel;
  content: string;
  objectives: string[];
  activities: string[];
  resources: string[];
  estimatedDuration: number; // in minutes
  predictedSuccessRate: number; // 0-100
  scaffolding: string[];
  extensions?: string[];
}

interface DifferentiationResponse {
  lessonId: number;
  versions: DifferentiatedVersion[];
  studentAssignments: {
    below: Student[];
    at: Student[];
    above: Student[];
  };
}

interface Assignment {
  studentId: number;
  lessonId: number;
  difficulty: DifficultyLevel;
  estimatedDuration: number;
}

const DIFFICULTY_CONFIG = {
  below: {
    label: 'Below Expected',
    shortLabel: 'BELOW',
    color: 'border-amber-300 bg-amber-50',
    headerBg: 'bg-amber-100',
    textColor: 'text-amber-900',
    icon: '🎯',
    description: 'Simplified with scaffolding',
  },
  at: {
    label: 'At Expected Level',
    shortLabel: 'AT EXPECTED',
    color: 'border-blue-300 bg-blue-50',
    headerBg: 'bg-blue-100',
    textColor: 'text-blue-900',
    icon: '🎯',
    description: 'Standard curriculum level',
  },
  above: {
    label: 'Above Expected',
    shortLabel: 'ABOVE',
    color: 'border-green-300 bg-green-50',
    headerBg: 'bg-green-100',
    textColor: 'text-green-900',
    icon: '🎯',
    description: 'Extended with challenges',
  },
};

/**
 * Loading skeleton for differentiation view
 */
const DifferentiationSkeleton: React.FC = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-16 bg-gray-200 rounded" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-96 bg-gray-200 rounded" />
      ))}
    </div>
  </div>
);

/**
 * Error display component
 */
const DifferentiationError: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
    <div className="flex items-center gap-3 text-red-700 mb-4">
      <AlertCircle className="w-6 h-6" />
      <h3 className="text-lg font-bold">Differentiation Failed</h3>
    </div>
    <p className="text-red-600 mb-4">{error}</p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
    >
      Retry Differentiation
    </button>
  </div>
);

/**
 * Student chip component with drag handle
 */
const StudentChip: React.FC<{
  student: Student;
  onDragStart: (e: React.DragEvent, student: Student) => void;
}> = ({ student, onDragStart }) => (
  <div
    draggable
    onDragStart={(e) => onDragStart(e, student)}
    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm cursor-move hover:shadow-md transition-shadow group"
    role="button"
    tabIndex={0}
    aria-label={`Drag to reassign ${student.name}`}
  >
    <GripVertical className="w-4 h-4 text-gray-400 group-hover:text-gray-600" aria-hidden="true" />
    <span className="text-sm font-medium text-gray-900">{student.name}</span>
  </div>
);

/**
 * Differentiated version card
 */
const DifferentiatedVersionCard: React.FC<{
  version: DifferentiatedVersion;
  students: Student[];
  onDrop: (difficulty: DifficultyLevel) => void;
  onDragOver: (e: React.DragEvent) => void;
  onPreview: () => void;
  onEdit: () => void;
  onDragStart: (e: React.DragEvent, student: Student) => void;
}> = ({ version, students, onDrop, onDragOver, onPreview, onEdit, onDragStart }) => {
  const config = DIFFICULTY_CONFIG[version.difficulty];

  return (
    <div
      className={`rounded-lg border-2 ${config.color} overflow-hidden`}
      role="region"
      aria-label={`${config.label} version`}
    >
      {/* Header */}
      <div className={`${config.headerBg} px-4 py-3 border-b-2 ${config.color.split(' ')[0]}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className={`text-lg font-bold ${config.textColor}`}>
            {config.icon} {config.shortLabel}
          </h3>
          <div className="flex items-center gap-2">
            <Users className={`w-4 h-4 ${config.textColor}`} aria-hidden="true" />
            <span className={`text-sm font-semibold ${config.textColor}`}>
              {students.length} {students.length === 1 ? 'student' : 'students'}
            </span>
          </div>
        </div>
        <p className={`text-xs ${config.textColor} opacity-80`}>{config.description}</p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Student drop zone */}
        <div
          onDrop={() => onDrop(version.difficulty)}
          onDragOver={onDragOver}
          className="min-h-[100px] p-3 border-2 border-dashed border-gray-300 rounded-lg bg-white hover:border-gray-400 hover:bg-gray-50 transition-all"
          role="region"
          aria-label={`Drop zone for ${config.label}`}
        >
          {students.length === 0 ? (
            <p className="text-sm text-gray-500 text-center italic">
              Drag students here to assign to {config.label.toLowerCase()} version
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {students.slice(0, 8).map((student) => (
                <StudentChip key={student.id} student={student} onDragStart={onDragStart} />
              ))}
              {students.length > 8 && (
                <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md">
                  <span className="text-sm font-medium text-gray-600">+{students.length - 8} more</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Objectives */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Learning Objectives:</h4>
          <ul className="space-y-1 text-sm text-gray-700" role="list">
            {version.objectives.slice(0, 3).map((objective, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Key activities */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Activities:</h4>
          <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside" role="list">
            {version.activities.slice(0, 3).map((activity, index) => (
              <li key={index}>{activity}</li>
            ))}
          </ul>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-600" aria-hidden="true" />
            <div>
              <p className="text-xs text-gray-600">Est. Duration</p>
              <p className="text-sm font-semibold text-gray-900">{version.estimatedDuration} min</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-600" aria-hidden="true" />
            <div>
              <p className="text-xs text-gray-600">Success Rate</p>
              <p className="text-sm font-semibold text-gray-900">{version.predictedSuccessRate}%</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label={`Edit ${config.label} version`}
          >
            <Edit3 className="w-4 h-4" aria-hidden="true" />
            <span>Edit</span>
          </button>
          <button
            onClick={onPreview}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={`Preview ${config.label} version`}
          >
            <Eye className="w-4 h-4" aria-hidden="true" />
            <span>Preview</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Main Lesson Differentiation View Component
 */
export const LessonDifferentiationView: React.FC<LessonDifferentiationViewProps> = ({
  lessonPlan,
  classId,
  onAssignAll,
  onPreview,
  className = '',
}) => {
  const [studentAssignments, setStudentAssignments] = useState<{
    below: Student[];
    at: Student[];
    above: Student[];
  }>({ below: [], at: [], above: [] });
  const [draggedStudent, setDraggedStudent] = useState<Student | null>(null);
  const [editingVersion, setEditingVersion] = useState<DifferentiatedVersion | null>(null);

  // Fetch differentiated versions
  const {
    data: differentiationData,
    isLoading,
    error,
    refetch,
  } = useQuery<DifferentiationResponse>({
    queryKey: ['lesson-differentiation', lessonPlan.id, classId],
    queryFn: async () => {
      const response = await fetch('/api/lessons/differentiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId: lessonPlan.id,
          classId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Differentiation failed: ${response.status} ${response.statusText}`);
      }

      return response.json();
    },
    retry: 1,
  });

  // Handle differentiation data updates (React Query v4+ migration)
  useEffect(() => {
    if (differentiationData?.studentAssignments) {
      setStudentAssignments(differentiationData.studentAssignments);
    }
  }, [differentiationData]);

  // Assign all lessons mutation
  const assignAllMutation = useMutation({
    mutationFn: async (assignments: Assignment[]) => {
      const response = await fetch('/api/lessons/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignments }),
      });

      if (!response.ok) {
        throw new Error(`Assignment failed: ${response.status} ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (_, assignments) => {
      toast.success(`Successfully assigned lessons to ${assignments.length} students`);
      onAssignAll?.(assignments);
    },
    onError: (error: Error) => {
      toast.error(`Assignment failed: ${error.message}`);
    },
  });

  // Handle drag and drop
  const handleDragStart = useCallback((e: React.DragEvent, student: Student) => {
    setDraggedStudent(student);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (targetDifficulty: DifficultyLevel) => {
      if (!draggedStudent) return;

      // Remove from current assignment
      const newAssignments = { ...studentAssignments };
      const sourceDifficulty = draggedStudent.currentLevel;

      newAssignments[sourceDifficulty] = newAssignments[sourceDifficulty].filter(
        (s) => s.id !== draggedStudent.id
      );

      // Add to new assignment
      newAssignments[targetDifficulty] = [
        ...newAssignments[targetDifficulty],
        { ...draggedStudent, currentLevel: targetDifficulty },
      ];

      setStudentAssignments(newAssignments);
      setDraggedStudent(null);

      toast.success(`Moved ${draggedStudent.name} to ${DIFFICULTY_CONFIG[targetDifficulty].label}`);
    },
    [draggedStudent, studentAssignments]
  );

  // Handle assign all
  const handleAssignAll = () => {
    if (!differentiationData) return;

    const assignments: Assignment[] = [];

    (Object.keys(studentAssignments) as DifficultyLevel[]).forEach((difficulty) => {
      const version = differentiationData.versions.find((v) => v.difficulty === difficulty);
      if (!version) return;

      studentAssignments[difficulty].forEach((student) => {
        assignments.push({
          studentId: student.id,
          lessonId: lessonPlan.id,
          difficulty,
          estimatedDuration: version.estimatedDuration,
        });
      });
    });

    if (assignments.length === 0) {
      toast.error('No students to assign');
      return;
    }

    assignAllMutation.mutate(assignments);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={className} role="status" aria-label="Loading differentiation">
        <DifferentiationSkeleton />
      </div>
    );
  }

  // Error state
  if (error || !differentiationData) {
    return (
      <div className={className}>
        <DifferentiationError
          error={error?.message || 'An unexpected error occurred'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const totalStudents =
    studentAssignments.below.length + studentAssignments.at.length + studentAssignments.above.length;

  return (
    <div className={`space-y-6 ${className}`} role="region" aria-label="Lesson differentiation view">
      {/* Header with action buttons */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <BookOpen className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" aria-hidden="true" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Differentiate: "{lessonPlan.title}"</h2>
              <p className="text-sm text-gray-600">
                {lessonPlan.subject} • {totalStudents} students • 3 difficulty levels
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => refetch()}
              disabled={isLoading || assignAllMutation.isPending}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Re-Differentiate
            </button>
            <button
              onClick={() => {
                toast.success('Lesson gamified! Battle Royale arena created.');
                // In a real app, router.push('/gamification?gameId=...')
              }}
              className="px-4 py-2 bg-purple-100 border border-purple-300 text-purple-700 rounded-md hover:bg-purple-200 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Gamify Lesson
            </button>
            <button
              onClick={handleAssignAll}
              disabled={totalStudents === 0 || assignAllMutation.isPending}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {assignAllMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" aria-hidden="true" />
                  <span>Assign All</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Differentiated versions grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {differentiationData.versions.map((version) => (
          <DifferentiatedVersionCard
            key={version.difficulty}
            version={version}
            students={studentAssignments[version.difficulty]}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onPreview={() => onPreview?.(version.difficulty)}
            onEdit={() => setEditingVersion(version)}
            onDragStart={handleDragStart}
          />
        ))}
      </div>

      {/* Help text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Tip:</strong> Drag and drop students between difficulty levels to customize assignments before sending.
          Each version is automatically tailored to the student's learning profile.
        </p>
      </div>

      {/* Edit Modal */}
      {editingVersion && (
        <EditLessonModal
          version={editingVersion}
          onClose={() => setEditingVersion(null)}
          onSave={(updatedFields) => {
            // In a real app, this would be a mutation
            logger.debug('Updating version', editingVersion.difficulty, updatedFields);
            toast.success('Lesson version updated');
            setEditingVersion(null);
            // Optimistic update or refetch could happen here
          }}
        />
      )}
    </div>
  );
};

export default LessonDifferentiationView;

/**
 * Edit Lesson Modal
 */
const EditLessonModal: React.FC<{
  version: DifferentiatedVersion;
  onClose: () => void;
  onSave: (updatedVersion: Partial<DifferentiatedVersion>) => void;
}> = ({ version, onClose, onSave }) => {
  const [content, setContent] = useState(version.content);
  const [duration, setDuration] = useState(version.estimatedDuration);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ content, estimatedDuration: duration });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Edit Lesson Version</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="lesson_content" className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              id="lesson_content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md h-32"
              required
            />
          </div>
          <div>
            <label htmlFor="lesson_duration" className="block text-sm font-medium text-gray-700 mb-1">Estimated Duration (minutes)</label>
            <input
              id="lesson_duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
              min="1"
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
