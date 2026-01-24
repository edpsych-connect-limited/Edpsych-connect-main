'use client'

/**
 * FILE: src/components/onboarding/steps/Step5QuickWins.tsx
 * PURPOSE: Step 5 - Quick wins setup (first case, assessment, goal)
 *
 * FEATURES:
 * - Guided task completion
 * - Create first case (simplified)
 * - Complete first assessment (sample)
 * - Set first goal (GAS)
 * - Progress tracking
 * - Success animations
 * - WCAG 2.1 AA compliant
 */

import React, { useState, useId } from 'react';
import {
  FolderPlus,
  ClipboardCheck,
  Target,
  Check,
  ChevronRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useOnboarding } from '../OnboardingProvider';

type QuickWinTask = 'case' | 'assessment' | 'goal';

function ProgressBar({ value, max = 100 }: { value: number; max?: number }) {
  const id = useId();
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const widthClass = `progress-${id.replace(/:/g, '')}`;

  return (
    <>
      <style>{`
        .${widthClass} {
          width: ${percentage}%;
        }
      `}</style>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500 ${widthClass}`}
          role="progressbar"
          {...{
            'aria-valuenow': percentage,
            'aria-valuemin': 0,
            'aria-valuemax': 100
          }}
          aria-label="Task completion progress"
        />
      </div>
    </>
  );
}

export function Step5QuickWins() {
  const { state, updateStep } = useOnboarding();

  const [caseCreated, setCaseCreated] = useState(state.step5Data.caseCreated || false);
  const [assessmentDone, setAssessmentDone] = useState(state.step5Data.assessmentDone || false);
  const [goalSet, setGoalSet] = useState(state.step5Data.goalSet || false);

  const [activeTask, setActiveTask] = useState<QuickWinTask | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Simplified form state for demo purposes
  const [caseName, setCaseName] = useState('');
  const [assessmentType, setAssessmentType] = useState('');
  const [goalDescription, setGoalDescription] = useState('');

  const handleCreateCase = () => {
    if (caseName.trim()) {
      setCaseCreated(true);
      updateStep(5, { caseCreated: true }, false);
      setShowSuccess(true);
      setActiveTask(null);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleCompleteAssessment = () => {
    if (assessmentType) {
      setAssessmentDone(true);
      updateStep(5, { assessmentDone: true }, false);
      setShowSuccess(true);
      setActiveTask(null);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleSetGoal = () => {
    if (goalDescription.trim()) {
      setGoalSet(true);
      updateStep(5, { goalSet: true }, false);
      setShowSuccess(true);
      setActiveTask(null);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const allTasksComplete = caseCreated && assessmentDone && goalSet;
  const completedCount = [caseCreated, assessmentDone, goalSet].filter(Boolean).length;

  const tasks = [
    {
      id: 'case' as QuickWinTask,
      icon: FolderPlus,
      title: 'Create Your First Case',
      description: 'Set up a student case to organize assessments and interventions',
      completed: caseCreated,
      color: 'indigo',
      estimatedTime: '2 min'
    },
    {
      id: 'assessment' as QuickWinTask,
      icon: ClipboardCheck,
      title: 'Complete a Sample Assessment',
      description: 'Try the ECCA assessment with sample student data',
      completed: assessmentDone,
      color: 'purple',
      estimatedTime: '3 min'
    },
    {
      id: 'goal' as QuickWinTask,
      icon: Target,
      title: 'Set Your First Goal',
      description: 'Create a SMART goal with goal attainment scaling',
      completed: goalSet,
      color: 'green',
      estimatedTime: '2 min'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, {
      bg: string;
      border: string;
      icon: string;
      iconBg: string;
      button: string;
      buttonHover: string;
    }> = {
      indigo: {
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        icon: 'text-indigo-600',
        iconBg: 'bg-indigo-100',
        button: 'bg-indigo-600',
        buttonHover: 'hover:bg-indigo-700'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        icon: 'text-purple-600',
        iconBg: 'bg-purple-100',
        button: 'bg-purple-600',
        buttonHover: 'hover:bg-purple-700'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: 'text-green-600',
        iconBg: 'bg-green-100',
        button: 'bg-green-600',
        buttonHover: 'hover:bg-green-700'
      }
    };
    return colors[color] || colors.indigo;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-3">
          Get Your First Quick Wins!
        </h2>
        <p className="text-lg text-gray-600">
          Complete these hands-on tasks to experience the platform&apos;s key workflows
        </p>
      </div>

      {/* Progress Overview */}
      <div className={`
        rounded-2xl p-6 border-2 transition-all
        ${allTasksComplete
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
          : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200'
        }
      `}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {allTasksComplete ? (
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {completedCount}
              </div>
            )}
            <div>
              <p className="font-bold text-gray-900 text-lg">
                {allTasksComplete ? 'All tasks complete!' : `${completedCount} of 3 tasks complete`}
              </p>
              <p className="text-sm text-gray-600">
                {allTasksComplete
                  ? 'You\'re ready to use the platform!'
                  : 'Complete all 3 tasks to unlock your full experience'
                }
              </p>
            </div>
          </div>
          {allTasksComplete && (
            <Check className="w-8 h-8 text-green-600" aria-label="All tasks completed" />
          )}
        </div>

        {/* Progress Bar */}
        <ProgressBar value={completedCount} max={3} />
      </div>

      {/* Task Cards */}
      <div className="space-y-4">
        {tasks.map((task) => {
          const colors = getColorClasses(task.color);
          const Icon = task.icon;
          const isActive = activeTask === task.id;

          return (
            <div
              key={task.id}
              className={`
                border-2 rounded-xl p-6 transition-all
                ${task.completed
                  ? 'bg-green-50 border-green-300'
                  : isActive
                  ? `${colors.bg} ${colors.border}`
                  : 'bg-white border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                  ${task.completed ? 'bg-green-600' : colors.iconBg}
                `}>
                  {task.completed ? (
                    <Check className="w-6 h-6 text-white" aria-hidden="true" />
                  ) : (
                    <Icon className={`w-6 h-6 ${colors.icon}`} aria-hidden="true" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {task.title}
                        {task.completed && (
                          <span className="ml-2 text-sm font-medium text-green-600">Complete</span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {task.description}
                      </p>
                    </div>
                    {!task.completed && (
                      <span className="text-xs font-medium text-gray-500 px-2 py-1 bg-gray-100 rounded-full whitespace-nowrap">
                        ~{task.estimatedTime}
                      </span>
                    )}
                  </div>

                  {/* Action Button or Form */}
                  {!task.completed && !isActive && (
                    <button
                      onClick={() => setActiveTask(task.id)}
                      className={`
                        mt-3 flex items-center gap-2 px-4 py-2 ${colors.button} text-white font-medium rounded-lg
                        ${colors.buttonHover} focus:outline-none focus:ring-4 focus:ring-${task.color}-200 transition-all
                      `}
                    >
                      Start Task
                      <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  )}

                  {/* Inline Forms */}
                  {isActive && task.id === 'case' && (
                    <div className="mt-4 space-y-3">
                      <div>
                        <label htmlFor="case-name" className="block text-sm font-medium text-gray-700 mb-1">
                          Student Name (Sample)
                        </label>
                        <input
                          type="text"
                          id="case-name"
                          value={caseName}
                          onChange={(e) => setCaseName(e.target.value)}
                          placeholder="e.g., Student A (Year 7)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          autoFocus
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCreateCase}
                          disabled={!caseName.trim()}
                          className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          Create Case
                        </button>
                        <button
                          onClick={() => setActiveTask(null)}
                          className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {isActive && task.id === 'assessment' && (
                    <div className="mt-4 space-y-3">
                      <div>
                        <label htmlFor="assessment-type" className="block text-sm font-medium text-gray-700 mb-1">
                          Choose Assessment Type
                        </label>
                        <select
                          id="assessment-type"
                          value={assessmentType}
                          onChange={(e) => setAssessmentType(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          autoFocus
                        >
                          <option value="">Select...</option>
                          <option value="ecca-cognitive">ECCA Cognitive Assessment</option>
                          <option value="ecca-reading">ECCA Reading Profile</option>
                          <option value="behavior">Behaviour Assessment</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCompleteAssessment}
                          disabled={!assessmentType}
                          className="flex-1 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          Complete Assessment
                        </button>
                        <button
                          onClick={() => setActiveTask(null)}
                          className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {isActive && task.id === 'goal' && (
                    <div className="mt-4 space-y-3">
                      <div>
                        <label htmlFor="goal-description" className="block text-sm font-medium text-gray-700 mb-1">
                          Goal Description (Sample)
                        </label>
                        <textarea
                          id="goal-description"
                          value={goalDescription}
                          onChange={(e) => setGoalDescription(e.target.value)}
                          placeholder="e.g., Improve reading fluency by 15 words per minute"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                          autoFocus
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSetGoal}
                          disabled={!goalDescription.trim()}
                          className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          Set Goal
                        </button>
                        <button
                          onClick={() => setActiveTask(null)}
                          className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in-right z-50">
          <Check className="w-5 h-5" />
          <span className="font-medium">Task completed!</span>
        </div>
      )}

      {/* Requirement Alert */}
      {!allTasksComplete && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Complete all tasks to continue</p>
            <p>These quick wins will help you get familiar with the platform&apos;s core workflows.</p>
          </div>
        </div>
      )}

      {/* Screen Reader Instructions */}
      <div className="sr-only" aria-live="polite">
        {allTasksComplete
          ? 'All quick win tasks completed! You can proceed to the final step.'
          : `${completedCount} of 3 tasks completed. Complete all tasks to continue.`
        }
      </div>
    </div>
  );
}
