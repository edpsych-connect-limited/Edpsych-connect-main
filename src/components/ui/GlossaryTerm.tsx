'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import React, { useState } from 'react';

interface GlossaryTermProps {
  term: string;
  definition: string;
  children: React.ReactNode;
  className?: string;
}

export const GlossaryTerm: React.FC<GlossaryTermProps> = ({
  term,
  definition,
  children,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className="relative inline-block">
      <span
        className={`border-b border-dotted border-slate-400 cursor-help ${className}`}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
      >
        {children}
      </span>
      
      {isOpen && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-slate-900 text-white text-xs rounded-lg p-3 shadow-xl">
          <div className="font-semibold mb-1">{term}</div>
          <div className="text-slate-200">{definition}</div>
          
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
            <div className="border-4 border-transparent border-t-slate-900"></div>
          </div>
        </div>
      )}
    </span>
  );
};

// Predefined glossary terms
export const glossaryDefinitions: Record<string, string> = {
  'EHCP': 'Education, Health and Care Plan - A legal document describing a child\'s special educational, health and social care needs.',
  'SEND': 'Special Educational Needs and Disabilities - Additional support required for children who have learning difficulties or disabilities.',
  'SENCO': 'Special Educational Needs Coordinator - The teacher responsible for coordinating SEND provision in a school.',
  'ECCA': 'Educational Psychologist Cognitive & Contextual Assessment - A framework for comprehensive student assessment.',
  'SEMH': 'Social, Emotional and Mental Health - One of the four broad areas of special educational need.',
  'LAA': 'Local Authority Administrator - Officials managing SEND services at the local council level.',
  'EP': 'Educational Psychologist - A qualified psychologist specializing in children\'s learning and development.',
  'SEN': 'Special Educational Needs - The need for additional or different educational provision.',
  'SMART': 'Specific, Measurable, Achievable, Relevant, Time-bound - A framework for setting effective goals.',
  'IEP': 'Individual Education Plan - A personalized learning plan for students with SEND.',
  'MLD': 'Moderate Learning Difficulties - A classification of special educational needs.',
  'SLD': 'Severe Learning Difficulties - A classification of special educational needs.',
  'PMLD': 'Profound and Multiple Learning Difficulties - The most complex level of special educational needs.',
  'ASD': 'Autism Spectrum Disorder - A developmental condition affecting communication and behaviour.',
  'ADHD': 'Attention Deficit Hyperactivity Disorder - A condition affecting concentration and impulse control.',
  'DCD': 'Developmental Coordination Disorder (Dyspraxia) - Difficulties with physical coordination.',
  'SpLD': 'Specific Learning Difficulties - Includes dyslexia, dyscalculia, and dysgraphia.',
};

// Quick helper component for common terms
export const EHCP: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => (
  <GlossaryTerm term="EHCP" definition={glossaryDefinitions.EHCP} className={className}>
    {children || 'EHCP'}
  </GlossaryTerm>
);

export const SEND: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => (
  <GlossaryTerm term="SEND" definition={glossaryDefinitions.SEND} className={className}>
    {children || 'SEND'}
  </GlossaryTerm>
);

export const SENCO: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => (
  <GlossaryTerm term="SENCO" definition={glossaryDefinitions.SENCO} className={className}>
    {children || 'SENCO'}
  </GlossaryTerm>
);

export const ECCA: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => (
  <GlossaryTerm term="ECCA" definition={glossaryDefinitions.ECCA} className={className}>
    {children || 'ECCA'}
  </GlossaryTerm>
);
