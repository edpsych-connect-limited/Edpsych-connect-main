'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  FileText, 
  Activity, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Star,
  BookOpen,
  PlayCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';

// Types matching the API response
interface ParentPortalResponse {
  childId: string;
  childName: string;
  parentName: string;
  progressSummary: {
    overallMessage: string;
    recentAchievements: string[];
    currentFocus: string;
    areasOfGrowth: string[];
  };
  recentLessons: {
    subject: string;
    title: string;
    completedDate: string | null;
    successLevel: 'excellent' | 'good' | 'satisfactory' | 'needs_support';
    teacherComment: string | null;
  }[];
  strengthsAndSupport: {
    strengths: string[];
    workingOn: string[];
    supportProvided: string[];
  };
  homeReinforcement: {
    suggestedActivities: string[];
    practiceAreas: string[];
    celebrationHighlights: string[];
  };
  upcomingMilestones: {
    type: string;
    description: string;
    date: string | null;
  }[];
  teacherContact: {
    teacherName: string;
    lastMessageDate: string | null;
    unreadMessages: number;
  };
  lastUpdated: string;
}

interface Child {
  id: number;
  name: string;
  yearGroup: string;
  schoolId: number;
  relationship: string;
}

export default function ParentDashboard() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [portalData, setPortalData] = useState<ParentPortalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchPortalData(selectedChild.id);
    }
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      const res = await fetch('/api/parent/children');
      if (!res.ok) throw new Error('Failed to fetch children');
      const data = await res.json();
      setChildren(data);
      if (data.length > 0) {
        setSelectedChild(data[0]);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('Could not load your children profiles.');
      setLoading(false);
    }
  };

  const fetchPortalData = async (childId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/parent/portal/${childId}`);
      if (!res.ok) throw new Error('Failed to fetch portal data');
      const data = await res.json();
      setPortalData(data);
    } catch (err) {
      console.error(err);
      setError('Could not load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !portalData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!selectedChild || !portalData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Student Profiles Found</h2>
          <p className="text-slate-600">Please contact your school to link your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              EdPsych Connect
            </span>
            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">Parent Portal</span>
          </div>
          <div className="flex items-center gap-4">
            {children.length > 1 && (
              <select 
                className="text-sm border-slate-200 rounded-md"
                value={selectedChild.id}
                onChange={(e) => {
                  const child = children.find(c => c.id === parseInt(e.target.value));
                  if (child) setSelectedChild(child);
                }}
              >
                {children.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                {portalData.parentName.charAt(0)}
              </div>
              <span className="text-sm font-medium text-slate-700">{portalData.parentName}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {portalData.parentName.split(' ')[0]}</h1>
          <p className="text-slate-600">{portalData.progressSummary.overallMessage}</p>
        </div>
        <div className="mb-8 rounded-lg border border-indigo-100 bg-indigo-50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-indigo-900">Decision Support</p>
              <p className="text-sm text-indigo-800">
                Start with the current focus, then review recent lessons and try one home activity this
                week. Message the teacher if you need help or clarity.
              </p>
            </div>
            <div className="text-xs text-indigo-700">
              Focus: current support, lessons, home practice.
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Active Support Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" /> Support & Progress
                </h2>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="font-bold text-slate-900 mb-3">Current Focus</h3>
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                    <p className="text-indigo-800 font-medium">{portalData.progressSummary.currentFocus}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-bold text-slate-900 mb-3">Support Provided</h3>
                  <div className="space-y-3">
                    {portalData.strengthsAndSupport.supportProvided.map((support, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <p className="text-slate-700">{support}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {portalData.progressSummary.recentAchievements.length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <h4 className="text-sm font-bold text-slate-900 mb-2">Recent Achievement</h4>
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      {portalData.progressSummary.recentAchievements[0]}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Lessons */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" /> Recent Lessons
                </h2>
              </div>
              <div className="divide-y divide-slate-100">
                {portalData.recentLessons.map((lesson, idx) => (
                  <div key={idx} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-slate-900">{lesson.title}</h3>
                        <p className="text-sm text-slate-500">{lesson.subject} - {new Date(lesson.completedDate || '').toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        lesson.successLevel === 'excellent' ? 'bg-green-100 text-green-700' :
                        lesson.successLevel === 'good' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {lesson.successLevel.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    {lesson.teacherComment && (
                      <p className="text-sm text-slate-600 italic">"{lesson.teacherComment}"</p>
                    )}
                  </div>
                ))}
                {portalData.recentLessons.length === 0 && (
                  <div className="p-6 text-center text-slate-500">No recent lessons recorded.</div>
                )}
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Home Reinforcement */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-600" /> Try at Home
              </h2>
              <div className="space-y-4">
                {portalData.homeReinforcement.suggestedActivities.map((activity, idx) => (
                  <div key={idx} className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <p className="text-sm text-purple-900">{activity}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Teacher Contact */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" /> Teacher Contact
              </h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                  {portalData.teacherContact.teacherName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{portalData.teacherContact.teacherName}</p>
                  <p className="text-xs text-slate-500">Class Teacher</p>
                </div>
              </div>
              <button className="w-full py-2 px-4 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Send Message
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

function Users(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
