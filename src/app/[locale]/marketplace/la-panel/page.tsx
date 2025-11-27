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
import EHCPWorkflow from '@/components/la-panel/EHCPWorkflow';
import { 
  Building, 
  Users, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Search,
  Filter,
  Download,
  Clock,
  BarChart2,
  ShieldCheck
} from 'lucide-react';

export default function LAAPanelPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCase, setSelectedCase] = useState<{id: string, name: string} | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/la/dashboard');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const stats = data?.stats || [];
  const recentApplications = data?.recentApplications || [];
  const timelineCases = data?.timelineCases || [];

  // Map icon strings back to components
  const iconMap: any = {
    FileText,
    AlertCircle,
    Building,
    Users
  };

  const mappedStats = stats.map((s: any) => ({
    ...s,
    icon: iconMap[s.icon] || FileText
  }));

  if (selectedCase) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <EHCPWorkflow 
            caseId={selectedCase.id} 
            studentName={selectedCase.name} 
            onBack={() => setSelectedCase(null)} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Local Authority Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage SEND provision, panels, and professional vetting.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Data
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Invite Professional
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {mappedStats.map((stat: any, index: number) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {['overview', 'ehcp-tracker', 'quality-assurance', 'professionals'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-900">Recent Panel Applications</h3>
                  <button className="text-blue-600 text-sm font-medium hover:underline">View All</button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Professional</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentApplications.map((app) => (
                        <tr key={app.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                {app.name.charAt(0)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{app.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              app.status === 'approved' ? 'bg-green-100 text-green-800' :
                              app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900">Review</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'ehcp-tracker' && (
              <div className="space-y-8">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900">20-Week Statutory Timeline</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      Monitor all active cases against the statutory 20-week deadline. 
                      Cases approaching breach (Week 18+) are highlighted in red.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {timelineCases.map((c) => {
                    const progressStyle = { width: `${(c.week / 20) * 100}%` };
                    return (
                    <div key={c.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{c.student}</h4>
                          <p className="text-sm text-gray-500">{c.id} • {c.school}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                          c.risk === 'high' ? 'bg-red-100 text-red-800' :
                          c.risk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          Week {c.week} / 20
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="relative pt-6 pb-2">
                        <div className="flex mb-2 items-center justify-between text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          <span className={c.week >= 1 ? 'text-blue-600' : ''}>Request (Wk 1-6)</span>
                          <span className={c.week >= 6 ? 'text-blue-600' : ''}>Assessment (Wk 6-16)</span>
                          <span className={c.week >= 16 ? 'text-blue-600' : ''}>Draft Plan (Wk 16-20)</span>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                          <style>{`
                            .progress-bar-${c.id} {
                              width: ${(c.week / 20) * 100}%;
                            }
                          `}</style>
                          <div 
                            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center progress-bar-${c.id} ${
                              c.risk === 'high' ? 'bg-red-500' : 'bg-blue-500'
                            }`}
                          ></div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-500">Current Stage: <strong>{c.status}</strong></span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500">Deadline: <strong>{c.deadline}</strong></span>
                          <button 
                            onClick={() => setSelectedCase({ id: c.id, name: c.student })}
                            className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-md font-medium hover:bg-blue-100"
                          >
                            Manage Workflow
                          </button>
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
              </div>
            )}

            {activeTab === 'quality-assurance' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <ShieldCheck className="w-6 h-6 text-green-600" />
                      <h3 className="font-bold text-gray-900">Audit Compliance</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">98.5%</p>
                    <p className="text-sm text-gray-500">Last 30 days</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-6 h-6 text-blue-600" />
                      <h3 className="font-bold text-gray-900">Timeliness</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">92%</p>
                    <p className="text-sm text-gray-500">Within 20 weeks</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <BarChart2 className="w-6 h-6 text-purple-600" />
                      <h3 className="font-bold text-gray-900">Parent Satisfaction</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">4.8/5</p>
                    <p className="text-sm text-gray-500">Based on feedback</p>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Quality Assurance Framework</h3>
                  <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                    Our automated QA tools check every EHCP draft against the Code of Practice standards before finalization.
                  </p>
                  <button className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 font-medium">
                    Run QA Audit Report
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'professionals' && (
              <div className="text-center py-12 text-gray-500">
                Professional directory management coming soon.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
