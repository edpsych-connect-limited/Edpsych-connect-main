'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, GraduationCap, Microscope, Presentation, User } from 'lucide-react';

type UserRole = 'teacher' | 'student' | 'parent' | 'researcher';

interface FunnelStep {
  title: string;
  description: string;
  icon: React.ReactElement;
  roles: UserRole[];
}

const ConversionFunnel = (): React.ReactElement => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('teacher');
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const roles = [
    { id: 'teacher', name: 'Educators', icon: <Presentation className="w-6 h-6" /> },
    { id: 'student', name: 'Students', icon: <GraduationCap className="w-6 h-6" /> },
    { id: 'parent', name: 'Parents', icon: <User className="w-6 h-6" /> },
    { id: 'researcher', name: 'Researchers', icon: <Microscope className="w-6 h-6" /> }
  ];

  const funnelSteps: FunnelStep[] = [
    {
      title: 'Discover AI Education Solutions',
      description: 'Explore how our platform revolutionizes education with AI-powered Personalised learning and intelligent assessment tools.',
      icon: <div className="text-3xl">🔎</div>,
      roles: ['teacher', 'student', 'parent', 'researcher']
    },
    {
      title: 'Create Free Account',
      description: 'Sign up in under 60 seconds and get immediate access to basic features with no credit card required.',
      icon: <div className="text-3xl">✍️</div>,
      roles: ['teacher', 'student', 'parent', 'researcher']
    },
    {
      title: 'Personalised Onboarding',
      description: 'Take a quick assessment to help our AI understand your specific needs and goals.',
      icon: <div className="text-3xl">🧩</div>,
      roles: ['teacher', 'student', 'parent', 'researcher']
    },
    {
      title: 'Teacher-Specific Resources',
      description: 'Access curriculum design tools, auto-generated assessments, and student analytics dashboards.',
      icon: <div className="text-3xl">📚</div>,
      roles: ['teacher']
    },
    {
      title: 'Student Learning Journey',
      description: 'Experience adaptive learning paths, interactive challenges, and the Battle Royale educational game.',
      icon: <div className="text-3xl">🎮</div>,
      roles: ['student']
    },
    {
      title: 'Parent Monitoring Tools',
      description: 'Monitor your child\'s progress, communicate with teachers, and receive Personalised recommendations.',
      icon: <div className="text-3xl">👨‍👩‍👧‍👦</div>,
      roles: ['parent']
    },
    {
      title: 'Research Laboratory',
      description: 'Access anonymized data, run educational experiments, and publish findings with our research tools.',
      icon: <div className="text-3xl">🧪</div>,
      roles: ['researcher']
    },
    {
      title: 'Explore Premium Features',
      description: 'Upgrade to unlock advanced analytics, specialized assessment tools, and integration capabilities.',
      icon: <div className="text-3xl">⭐</div>,
      roles: ['teacher', 'parent', 'researcher']
    },
    {
      title: 'Connect with Support',
      description: 'Get help from our AI support team or connect with a human specialist for Personalised assistance.',
      icon: <div className="text-3xl">🤝</div>,
      roles: ['teacher', 'student', 'parent', 'researcher']
    }
  ];

  const filteredSteps = funnelSteps.filter(step => step.roles.includes(selectedRole));

  const handleStepClick = (index: number) => {
    setExpandedStep(expandedStep === index ? null : index);
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-2xl font-bold text-center mb-8">Your Journey with EdPsych Connect World</h3>
      
      {/* Role Selection */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          {roles.map(role => (
            <button
              key={role.id}
              onClick={() => {
                setSelectedRole(role.id as UserRole);
                setExpandedStep(null);
              }}
              className={`flex items-center px-4 py-2 rounded-md transition-all ${
                selectedRole === role.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">{role.icon}</span>
              <span>{role.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Funnel Steps */}
      <div className="relative">
        {filteredSteps.map((step, index) => (
          <div key={index} className="mb-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative ${
                index < filteredSteps.length - 1 ? 'pb-8' : ''
              }`}
            >
              {/* Step connector line */}
              {index < filteredSteps.length - 1 && (
                <div className="absolute left-8 top-16 w-0.5 h-full bg-blue-200 -z-10"></div>
              )}
              
              {/* Step content */}
              <div
                onClick={() => handleStepClick(index)}
                className={`flex items-start bg-white border ${
                  expandedStep === index ? 'border-blue-500 shadow-md' : 'border-gray-200'
                } rounded-lg p-4 cursor-pointer transition-all hover:shadow-md`}
              >
                <div className={`flex-shrink-0 w-16 h-16 ${
                  expandedStep === index ? 'bg-blue-100' : 'bg-gray-100'
                } rounded-full flex items-center justify-center mr-4`}>
                  {step.icon}
                </div>
                
                <div className="flex-grow">
                  <h4 className={`text-lg font-semibold ${
                    expandedStep === index ? 'text-blue-600' : 'text-gray-800'
                  }`}>
                    {step.title}
                  </h4>
                  
                  {expandedStep === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2"
                    >
                      <p className="text-gray-600 mb-4">{step.description}</p>
                      
                      <div className="flex justify-end">
                        <button className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
                          <span>Learn more</span>
                          <ArrowRight className="ml-1" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
      
      {/* CTA at the end of the funnel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: filteredSteps.length * 0.1 }}
        className="mt-8 text-center"
      >
        <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:opacity-90 transition-opacity">
          Start Your Journey Now
        </button>
        <p className="mt-4 text-gray-600">No credit card required. Free account includes basic features.</p>
      </motion.div>
    </div>
  );
};

export default ConversionFunnel;
