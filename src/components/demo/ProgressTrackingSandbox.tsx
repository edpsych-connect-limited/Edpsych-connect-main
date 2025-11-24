'use client';

import React, { useState } from 'react';
import { LineChart, BarChart, PieChart, TrendingUp, Users, Calendar, ArrowUpRight, ArrowDownRight, Filter, Download, Plus } from 'lucide-react';

// Enterprise-Grade Pedagogical Data
const MOCK_STUDENTS = [
  { id: 1, name: "Leo Thompson", year: 4, need: "SEMH", progress: "Accelerated", intervention: "ELSA Support", score: 94, trend: +8 },
  { id: 2, name: "Mia Chen", year: 3, need: "C&L", progress: "Expected", intervention: "Precision Teaching", score: 88, trend: +4 },
  { id: 3, name: "Noah Williams", year: 5, need: "C&I", progress: "Below", intervention: "Talkabout Social Skills", score: 76, trend: -2 },
  { id: 4, name: "Ava Patel", year: 2, need: "SEMH", progress: "Expected", intervention: "Boxall Profile Targets", score: 91, trend: +5 },
  { id: 5, name: "Lucas Brown", year: 6, need: "Sensory", progress: "Accelerated", intervention: "Sensory Circuits", score: 102, trend: +12 },
];

const MOCK_INTERVENTIONS = [
  { name: "ELSA Support", students: 12, avgImpact: "+6 SS Pts", cost: "£450", rating: 4.8 },
  { name: "Precision Teaching", students: 24, avgImpact: "+4 SS Pts", cost: "£0", rating: 4.2 },
  { name: "Talkabout", students: 8, avgImpact: "+5 SS Pts", cost: "£150", rating: 4.9 },
  { name: "Zones of Regulation", students: 35, avgImpact: "+3 SS Pts", cost: "£200", rating: 4.5 },
];

export default function ProgressTrackingSandbox() {
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [timeframe, setTimeframe] = useState('term');

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-blue-500" />
          Progress Tracking & Analytics
        </h1>
        <p className="text-slate-400">Monitor student outcomes, evaluate intervention impact, and generate reports.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-blue-900/30 rounded-lg text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> +12%
            </span>
          </div>
          <div className="text-2xl font-bold text-white">142</div>
          <div className="text-xs text-slate-400">Students on SEN Register</div>
        </div>

        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-purple-900/30 rounded-lg text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> +4.5 SS
            </span>
          </div>
          <div className="text-2xl font-bold text-white">High</div>
          <div className="text-xs text-slate-400">Avg. Standardised Score Gain</div>
        </div>

        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-orange-900/30 rounded-lg text-orange-400">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-slate-500 text-xs font-medium">Due soon</span>
          </div>
          <div className="text-2xl font-bold text-white">8</div>
          <div className="text-xs text-slate-400">Annual Reviews Pending</div>
        </div>

        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-emerald-900/30 rounded-lg text-emerald-400">
              <PieChart className="w-5 h-5" />
            </div>
            <span className="text-emerald-400 text-xs font-medium">On budget</span>
          </div>
          <div className="text-2xl font-bold text-white">£12.4k</div>
          <div className="text-xs text-slate-400">Notional SEN Budget Remaining</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Progress Chart Mockup */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white">Intervention Impact Analysis</h3>
              <div className="flex gap-2">
                <select 
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="term">This Term</option>
                  <option value="year">Academic Year</option>
                  <option value="all">All Time</option>
                </select>
                <button className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* CSS-only Bar Chart Mockup */}
            <div className="h-64 flex items-end justify-between gap-4 px-4 pb-4 border-b border-slate-700">
              {MOCK_INTERVENTIONS.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
                  <div className="relative w-full bg-slate-700/30 rounded-t-lg h-full flex items-end overflow-hidden">
                    <div 
                      className="w-full bg-blue-600/80 group-hover:bg-blue-500 transition-all relative"
                      style={{ height: `${Math.random() * 60 + 20}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700 z-10">
                        {item.avgImpact}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 text-center truncate w-full">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Student List */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Student Progress Watchlist</h3>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors">
                <Plus className="w-4 h-4" /> Add Student
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-900/50 text-slate-200 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3">Student</th>
                    <th className="px-6 py-3">Year</th>
                    <th className="px-6 py-3">Primary Need</th>
                    <th className="px-6 py-3">Current Intervention</th>
                    <th className="px-6 py-3">Progress</th>
                    <th className="px-6 py-3 text-right">SS Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {MOCK_STUDENTS.map((student) => (
                    <tr 
                      key={student.id} 
                      className="hover:bg-slate-700/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedStudent(student.id)}
                    >
                      <td className="px-6 py-4 font-medium text-white">{student.name}</td>
                      <td className="px-6 py-4">Y{student.year}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs border ${
                          student.need === 'SEMH' ? 'bg-orange-900/30 text-orange-400 border-orange-500/30' :
                          student.need === 'C&L' ? 'bg-blue-900/30 text-blue-400 border-blue-500/30' :
                          'bg-purple-900/30 text-purple-400 border-purple-500/30'
                        }`}>
                          {student.need}
                        </span>
                      </td>
                      <td className="px-6 py-4">{student.intervention}</td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1.5 ${
                          student.progress === 'Accelerated' ? 'text-emerald-400' :
                          student.progress === 'Expected' ? 'text-blue-400' :
                          'text-red-400'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            student.progress === 'Accelerated' ? 'bg-emerald-400' :
                            student.progress === 'Expected' ? 'bg-blue-400' :
                            'bg-red-400'
                          }`}></span>
                          {student.progress}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`flex items-center justify-end gap-1 ${
                          student.trend > 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {student.trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          {Math.abs(student.trend)} pts
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar / Details */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors flex items-center gap-3 text-slate-300 hover:text-white">
                <div className="p-2 bg-blue-900/30 rounded text-blue-400">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium">Log New Assessment</div>
                  <div className="text-xs text-slate-500">Record test scores or observations</div>
                </div>
              </button>
              <button className="w-full text-left px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors flex items-center gap-3 text-slate-300 hover:text-white">
                <div className="p-2 bg-purple-900/30 rounded text-purple-400">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium">Export Census Data</div>
                  <div className="text-xs text-slate-500">Generate SEND census report</div>
                </div>
              </button>
            </div>
          </div>

          {/* Cost Effectiveness */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Cost Effectiveness</h3>
            <div className="space-y-4">
              {MOCK_INTERVENTIONS.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-200">{item.name}</div>
                    <div className="text-xs text-slate-500">{item.students} students • {item.cost}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-400">{item.avgImpact}</div>
                    <div className="flex gap-0.5 justify-end">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-1 h-1 rounded-full ${i < Math.floor(item.rating) ? 'bg-yellow-500' : 'bg-slate-700'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}