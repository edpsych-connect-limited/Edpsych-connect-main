import { logger } from "@/lib/logger";
/**
 * FILE: src/components/onboarding/steps/Step2RoleSelection.tsx
 * PURPOSE: Step 2 - Role selection with personalized paths
 *
 * FEATURES:
 * - 5 predefined role cards (EP, SENCO, Teacher, LA, Researcher)
 * - Custom role input option
 * - Role-specific descriptions and features
 * - Visual selection feedback
 * - WCAG 2.1 AA compliant
 * - Responsive grid layout
 */

'use client';

import React, { useState } from 'react';
import { GraduationCap, School, BookOpen, Building, Search, Edit3, Check } from 'lucide-react';
import { useOnboarding } from '../OnboardingProvider';
import { ROLE_CONFIGS } from '@/types/onboarding';

export function Step2RoleSelection() {
  const { state, updateStep } = useOnboarding();
  const [selectedRole, setSelectedRole] = useState<string>(state.step2Data.roleSelected || '');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customRole, setCustomRole] = useState('');

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setShowCustomInput(false);
    setCustomRole('');

    // Update context state
    updateStep(2, { roleSelected: roleId }, false);
  };

  const handleCustomRole = () => {
    setShowCustomInput(true);
    setSelectedRole('');
  };

  const handleCustomRoleSubmit = () => {
    if (customRole.trim()) {
      setSelectedRole('custom');
      updateStep(2, { roleSelected: `custom:${customRole.trim()}` }, false);
    }
  };

  const roles = [
    {
      id: 'educational-psychologist',
      name: 'Educational Psychologist',
      description: 'HCPC registered practitioner conducting assessments and consultations',
      icon: GraduationCap,
      color: 'indigo',
      features: [
        'Full ECCA assessment suite',
        'EHCP creation & management',
        'Professional report generation',
        'Multi-agency collaboration'
      ]
    },
    {
      id: 'senco',
      name: 'SENCO',
      description: 'Special Educational Needs Coordinator managing SEND provision',
      icon: School,
      color: 'purple',
      features: [
        'Intervention library access',
        'Progress monitoring tools',
        'EHCP review tracking',
        'Staff training resources'
      ]
    },
    {
      id: 'teacher',
      name: 'Teacher',
      description: 'Classroom teacher supporting SEND students',
      icon: BookOpen,
      color: 'blue',
      features: [
        'Differentiation strategies',
        'Classroom interventions',
        'Progress tracking',
        'Gamification tools'
      ]
    },
    {
      id: 'local-authority',
      name: 'Local Authority Officer',
      description: 'LA staff managing SEND services and compliance',
      icon: Building,
      color: 'green',
      features: [
        'Multi-school dashboard',
        'Compliance tracking',
        'EHCP oversight',
        'Analytics & reporting'
      ]
    },
    {
      id: 'researcher',
      name: 'Researcher',
      description: 'Academic or institutional researcher studying SEND interventions',
      icon: Search,
      color: 'orange',
      features: [
        'Research API access',
        'Data export tools',
        'Outcome analytics',
        'Ethical approval support'
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, {
      bg: string;
      bgSelected: string;
      border: string;
      borderSelected: string;
      icon: string;
      iconBg: string;
      checkBg: string;
    }> = {
      indigo: {
        bg: 'bg-white',
        bgSelected: 'bg-indigo-50',
        border: 'border-gray-200',
        borderSelected: 'border-indigo-600',
        icon: 'text-indigo-600',
        iconBg: 'bg-indigo-100',
        checkBg: 'bg-indigo-600'
      },
      purple: {
        bg: 'bg-white',
        bgSelected: 'bg-purple-50',
        border: 'border-gray-200',
        borderSelected: 'border-purple-600',
        icon: 'text-purple-600',
        iconBg: 'bg-purple-100',
        checkBg: 'bg-purple-600'
      },
      blue: {
        bg: 'bg-white',
        bgSelected: 'bg-blue-50',
        border: 'border-gray-200',
        borderSelected: 'border-blue-600',
        icon: 'text-blue-600',
        iconBg: 'bg-blue-100',
        checkBg: 'bg-blue-600'
      },
      green: {
        bg: 'bg-white',
        bgSelected: 'bg-green-50',
        border: 'border-gray-200',
        borderSelected: 'border-green-600',
        icon: 'text-green-600',
        iconBg: 'bg-green-100',
        checkBg: 'bg-green-600'
      },
      orange: {
        bg: 'bg-white',
        bgSelected: 'bg-orange-50',
        border: 'border-gray-200',
        borderSelected: 'border-orange-600',
        icon: 'text-orange-600',
        iconBg: 'bg-orange-100',
        checkBg: 'bg-orange-600'
      }
    };
    return colors[color] || colors.indigo;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-3">
          What&apos;s your role?
        </h2>
        <p className="text-lg text-gray-600">
          We&apos;ll personalize your experience based on your professional focus
        </p>
      </div>

      {/* Role Cards Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {roles.map((role) => {
          const isSelected = selectedRole === role.id;
          const colors = getColorClasses(role.color);
          const Icon = role.icon;
          const pressedValue = isSelected ? "true" : "false";

          return (
            <button // eslint-disable-line jsx-a11y/aria-proptypes
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
              className={`
                relative text-left p-6 rounded-xl border-2 transition-all duration-200
                focus:outline-none focus:ring-4 focus:ring-${role.color}-200
                hover:shadow-lg
                ${isSelected
                  ? `${colors.bgSelected} ${colors.borderSelected} shadow-md`
                  : `${colors.bg} ${colors.border} hover:border-${role.color}-300`
                }
              `}
              {...(isSelected ? { 'aria-pressed': 'true' } : { 'aria-pressed': 'false' })}
              aria-label={`Select role: ${role.name}`}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className={`absolute top-4 right-4 w-8 h-8 ${colors.checkBg} rounded-full flex items-center justify-center shadow-sm`}>
                  <Check className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
              )}

              {/* Icon */}
              <div className={`w-14 h-14 ${colors.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className={`w-7 h-7 ${colors.icon}`} aria-hidden="true" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {role.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {role.description}
              </p>

              {/* Features */}
              <ul className="space-y-1.5" role="list">
                {role.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className={`w-4 h-4 ${colors.icon} flex-shrink-0 mt-0.5`} aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}

        {/* Custom Role Card */}
        {!showCustomInput ? (
          <button
            onClick={handleCustomRole}
            className={`
              relative text-left p-6 rounded-xl border-2 border-dashed transition-all
              focus:outline-none focus:ring-4 focus:ring-gray-200
              hover:border-gray-400 hover:bg-gray-50
              ${selectedRole === 'custom' ? 'bg-gray-50 border-gray-600' : 'bg-white border-gray-300'}
            `}
            aria-label="Enter custom role"
          >
            <div className="flex flex-col items-center justify-center text-center min-h-[240px]">
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                <Edit3 className="w-7 h-7 text-gray-600" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Other Role
              </h3>
              <p className="text-sm text-gray-600">
                Don&apos;t see your role? Click to enter a custom role
              </p>
            </div>
          </button>
        ) : (
          <div className="relative p-6 rounded-xl border-2 border-indigo-600 bg-indigo-50">
            <div className="flex flex-col min-h-[240px]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Edit3 className="w-7 h-7 text-indigo-600" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Enter Your Role
                </h3>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <label htmlFor="custom-role" className="block text-sm font-medium text-gray-700 mb-2">
                    What&apos;s your professional role?
                  </label>
                  <input
                    type="text"
                    id="custom-role"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customRole.trim()) {
                        handleCustomRoleSubmit();
                      }
                    }}
                    placeholder="e.g., Educational Consultant"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    autoFocus
                    aria-describedby="custom-role-hint"
                  />
                  <p id="custom-role-hint" className="mt-1 text-sm text-gray-600">
                    Press Enter to confirm
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCustomRoleSubmit}
                    disabled={!customRole.trim()}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => {
                      setShowCustomInput(false);
                      setCustomRole('');
                    }}
                    className="px-4 py-2 bg-white text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selection Summary */}
      {selectedRole && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Check className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 mb-1">
                Great choice!
              </p>
              <p className="text-sm text-gray-600">
                {selectedRole.startsWith('custom:')
                  ? `We'll customize your experience for ${customRole}.`
                  : `Your dashboard will be optimized for ${roles.find(r => r.id === selectedRole)?.name.toLowerCase()} workflows.`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-center text-sm text-gray-500">
        <p>Don&apos;t worry - you can change this later in your settings</p>
      </div>

      {/* Screen Reader Instructions */}
      <div className="sr-only" aria-live="polite">
        {selectedRole
          ? `You have selected ${selectedRole.startsWith('custom:') ? customRole : roles.find(r => r.id === selectedRole)?.name}. Click Next to continue.`
          : 'Please select your professional role to continue. You can choose from the predefined roles or enter a custom role.'
        }
      </div>
    </div>
  );
}
