'use client'

import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import React, { useState } from 'react';
import ClinicalValidationShowcase from '@/components/research/ClinicalValidationShowcase';
import { 
  Beaker, 
  Database, 
  FileText, 
  Users, 
  Activity, 
  Lock,
  Search,
  Plus
} from 'lucide-react';

export default function ResearchPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showEthicsModal, setShowEthicsModal] = useState(false);

  const researchStats = [
    { label: 'Active Studies', value: '12', icon: Beaker, color: 'blue' },
    { label: 'Participants', value: '1,450', icon: Users, color: 'green' },
    { label: 'Data Points', value: '2.4M', icon: Database, color: 'purple' },
    { label: 'Publications', value: '8', icon: FileText, color: 'orange' },
  ];

  const activeStudies = [
    {
      id: 1,
      title: "Longitudinal Impact of Gamified CBT on Anxiety",
      status: "Recruiting",
      participants: 124,
      target: 200,
      phase: "Phase 2",
      lastUpdate: "2 hours ago"
    },
    {
      id: 2,
      title: "ECCA Framework Validation in Secondary Schools",
      status: "Data Collection",
      participants: 850,
      target: 1000,
      phase: "Phase 3",
      lastUpdate: "1 day ago"
    },
    {
      id: 3,
      title: "AI-Driven Pattern Recognition in Dyslexia Screening",
      status: "Analysis",
      participants: 450,
      target: 450,
      phase: "Final Review",
      lastUpdate: "3 days ago"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Research Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Beaker className="w-8 h-8 text-blue-600" />
                Research & Validation Hub
              </h1>
              <p className="mt-2 text-gray-600 max-w-2xl">
                Manage clinical trials, validate assessment frameworks, and access anonymized datasets for educational psychology research.
              </p>
            </div>
            <button 
              onClick={() => setShowEthicsModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Study Proposal
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex mt-8 space-x-8">
            {['overview', 'studies', 'datasets', 'publications'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ethics Modal */}
      {showEthicsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">New Study Proposal</h2>
              <button onClick={() => setShowEthicsModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-bold text-yellow-800 mb-2">Ethics Committee Review Required</h3>
                <p className="text-sm text-yellow-700">
                  All research involving human participants must undergo ethical review. 
                  Your proposal will be submitted to the EdPsych Connect Ethics Board (EPCEB).
                  Expected review time: 10-14 days.
                </p>
              </div>

              <div>
                <label htmlFor="studyTitle" className="block text-sm font-medium text-gray-700 mb-1">Study Title</label>
                <input id="studyTitle" type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g., Impact of..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="principalInvestigator" className="block text-sm font-medium text-gray-700 mb-1">Principal Investigator</label>
                  <input id="principalInvestigator" type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label htmlFor="sampleSize" className="block text-sm font-medium text-gray-700 mb-1">Target Sample Size</label>
                  <input id="sampleSize" type="number" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
              </div>

              <div>
                <label htmlFor="methodology" className="block text-sm font-medium text-gray-700 mb-1">Methodology Summary</label>
                <textarea id="methodology" className="w-full border border-gray-300 rounded-lg px-4 py-2 h-32 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Describe your research design..."></textarea>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="gdpr" className="rounded text-blue-600 focus:ring-blue-500" />
                <label htmlFor="gdpr" className="text-sm text-gray-600">I confirm this study complies with GDPR and BPS Code of Ethics.</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => setShowEthicsModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    alert('Proposal submitted for Ethics Review. Reference: ETH-2025-892');
                    setShowEthicsModal(false);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
                >
                  Submit for Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {researchStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <Activity className="w-4 h-4 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Active Studies List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Active Studies</h3>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search studies..." 
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {activeStudies.map((study) => {
                  const progressStyle = { width: `${(study.participants / study.target) * 100}%` };
                  return (
                  <div key={study.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{study.title}</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            study.status === 'Recruiting' ? 'bg-green-100 text-green-800' :
                            study.status === 'Data Collection' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {study.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {study.participants} / {study.target} Participants
                          </span>
                          <span className="flex items-center gap-1">
                            <Activity className="w-4 h-4" />
                            {study.phase}
                          </span>
                        </div>
                      </div>
                      <button className="text-blue-600 font-medium text-sm hover:underline">
                        View Details
                      </button>
                    </div>
                    <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                        style={progressStyle}
                      ></div>
                    </div>
                  </div>
                )})}
              </div>
            </div>

            {/* Clinical Validation Component */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Validation Frameworks</h3>
              <ClinicalValidationShowcase />
            </div>
          </div>
        )}

        {activeTab === 'datasets' && (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
            <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Data Enclave</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Access anonymized, aggregated datasets for secondary analysis. Requires Ethics Committee approval and secure access token.
            </p>
            <button className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2 mx-auto">
              <Lock className="w-4 h-4" />
              Request Access
            </button>
          </div>
        )}
      </div>
    </div>
  );
}