/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  Users, 
  Send,
  Edit3,
  Eye
} from 'lucide-react';

export default function EHCPWorkflow({ caseId, studentName, onBack }: { caseId: string, studentName: string, onBack: () => void }) {
  const phases = [
    { id: 1, name: 'Request & Triage', weeks: '1-6', status: 'completed' },
    { id: 2, name: 'Assessment & Advice', weeks: '6-12', status: 'active' },
    { id: 3, name: 'Drafting Plan', weeks: '13-16', status: 'pending' },
    { id: 4, name: 'Consultation', weeks: '17-20', status: 'pending' },
  ];

  // Demo data for demonstration purposes - real professionals will be populated from database
  const professionals = [
    { id: 1, role: 'Educational Psychologist', name: '[Demo] EP Assignment', status: 'submitted', date: '2025-11-15' },
    { id: 2, role: 'Speech & Language', name: '[Demo] SALT Assignment', status: 'in-progress', deadline: '2 days left' },
    { id: 3, role: 'Occupational Therapy', name: '[Demo] OT Assignment', status: 'requested', deadline: '1 week left' },
    { id: 4, role: 'Social Care', name: 'Pending Assignment', status: 'pending', deadline: '-' },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1">
          ← Back to Dashboard
        </button>
        <div className="h-6 w-px bg-gray-300"></div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{studentName}</h2>
          <p className="text-sm text-gray-500">Case ID: {caseId} • Statutory Deadline: Dec 20, 2025</p>
        </div>
      </div>

      {/* Phase Stepper */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center relative">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10"></div>
          
          {phases.map((phase) => (
            <div key={phase.id} className="flex flex-col items-center bg-white px-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors ${
                phase.status === 'completed' ? 'bg-green-100 text-green-600' :
                phase.status === 'active' ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                'bg-gray-100 text-gray-400'
              }`}>
                {phase.status === 'completed' ? <CheckCircle className="w-6 h-6" /> : phase.id}
              </div>
              <span className={`text-sm font-bold ${phase.status === 'active' ? 'text-blue-900' : 'text-gray-500'}`}>
                {phase.name}
              </span>
              <span className="text-xs text-gray-400">Weeks {phase.weeks}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Workflow Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Actions & Status */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Advice Gathering Section (Active Phase) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Multi-Agency Advice Portal
              </h3>
              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded">Week 9 of 20</span>
            </div>
            
            <div className="p-6">
              <div className="mb-6 bg-yellow-50 border border-yellow-100 p-4 rounded-lg flex gap-3">
                <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-yellow-900 text-sm">6-Week Advice Deadline Approaching</h4>
                  <p className="text-xs text-yellow-800 mt-1">
                    Statutory advice from SALT and OT is due in 5 days. Automated reminders have been sent.
                  </p>
                </div>
              </div>

              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    <th className="pb-3">Professional Role</th>
                    <th className="pb-3">Assigned To</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {professionals.map((prof) => (
                    <tr key={prof.id}>
                      <td className="py-4 text-sm font-medium text-gray-900">{prof.role}</td>
                      <td className="py-4 text-sm text-gray-500">{prof.name}</td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          prof.status === 'submitted' ? 'bg-green-100 text-green-800' :
                          prof.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          prof.status === 'requested' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {prof.status === 'submitted' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {prof.status.charAt(0).toUpperCase() + prof.status.slice(1)}
                        </span>
                        {prof.deadline !== '-' && prof.status !== 'submitted' && (
                          <div className="text-xs text-red-500 mt-1 font-medium">{prof.deadline}</div>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        {prof.status === 'submitted' ? (
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View Report</button>
                        ) : (
                          <button className="text-gray-400 hover:text-gray-600 text-sm font-medium">Nudge</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* The "Golden Thread" Master Report Preview */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Draft Master Report (Amalgamated)
              </h3>
              <button className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                <Eye className="w-4 h-4" /> Preview Full Draft
              </button>
            </div>
            <div className="p-6 bg-gray-50 min-h-[200px] text-sm text-gray-600 space-y-4">
              <div className="p-4 bg-white border border-gray-200 rounded shadow-sm">
                <h4 className="font-bold text-gray-900 mb-2">Section B: Special Educational Needs</h4>
                <p className="italic text-gray-400 mb-2">Amalgamating advice from EP and SALT (Pending)...</p>
                <div className="pl-4 border-l-2 border-green-500">
                  <p className="text-gray-800">"Alice demonstrates significant difficulty with working memory..." <span className="text-xs text-green-600 font-bold">- Educational Psychologist</span></p>
                </div>
              </div>
              <div className="p-4 bg-white border border-gray-200 rounded shadow-sm opacity-60">
                <h4 className="font-bold text-gray-900 mb-2">Section F: Provision</h4>
                <p className="italic text-gray-400">Waiting for SALT and OT advice to populate this section...</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Timeline & Actions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Next Actions</h3>
            <div className="space-y-3">
              <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                Send Reminders
              </button>
              <button className="w-full py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center justify-center gap-2">
                <Edit3 className="w-4 h-4" />
                Edit Case Details
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Statutory Clock</h3>
            <div className="relative pt-2">
              <div className="flex mb-2 items-center justify-between">
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                  Week 9
                </span>
                <span className="text-xs font-semibold inline-block text-blue-600">
                  45%
                </span>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                <style>{`
                  .progress-bar-workflow {
                    width: 45%;
                  }
                `}</style>
                <div className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 progress-bar-workflow"></div>
              </div>
              <p className="text-xs text-gray-500">
                Target Final Date: <span className="font-bold text-gray-900">Dec 20, 2025</span>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
