import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useState, useEffect, useId } from 'react';
import { FaUser, FaChartLine, FaExclamationTriangle, FaTrophy, FaClock, FaBook } from 'react-icons/fa';

const ProgressBar = ({ width, className }: { width: number, className?: string }) => {
  const id = useId().replace(/:/g, '');
  return (
    <>
      <style>{`
        #pb-${id} {
          width: ${width}%;
        }
      `}</style>
      <div id={`pb-${id}`} className={className} />
    </>
  );
};

interface StudentData {
  studentId: string;
  name: string;
  grade: string;
  performanceMetrics: {
    attendance: {
      rate: number;
      trend: 'improving' | 'declining' | 'stable';
      absences: number;
      lates: number;
    };
    academic: {
      averageScore: number;
      trend: 'improving' | 'declining' | 'stable';
      subjects: {
        subject: string;
        score: number;
        trend: 'improving' | 'declining' | 'stable';
        recentAssessments: number;
      }[];
    };
    engagement: {
      participationRate: number;
      trend: 'improving' | 'declining' | 'stable';
      loginFrequency: number;
      averageSessionDuration: number;
    };
  };
  alerts: {
    type: 'attendance' | 'performance' | 'engagement' | 'behavior';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: string;
  }[];
  predictions: {
    performance: {
      predictedEndOfTermGrade: string;
      confidence: number;
    };
    engagement: {
      predictedDropoutRisk: number;
      confidence: number;
    };
  };
  recentActivity: {
    type: string;
    description: string;
    timestamp: string;
    duration?: number;
  }[];
}

interface StudentAnalyticsProps {
  studentId?: string;
  classId?: string;
  timeRange?: 'week' | 'month' | 'term';
}

export default function StudentAnalytics({ studentId, classId, timeRange = 'week' }: StudentAnalyticsProps) {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudentData = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (studentId) params.append('studentId', studentId);
      if (classId) params.append('classId', classId);
      if (timeRange) params.append('timeRange', timeRange);

      const response = await fetch(`/api/analytics/students?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch student data');
      }
      const data = await response.json();
      setStudents(data.students || []);

      if (studentId && data.students?.length > 0) {
        setSelectedStudent(data.students[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [studentId, classId, timeRange]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return 'text-red-600 bg-red-100';
    if (risk >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <span className="text-green-600">↗</span>;
      case 'declining':
        return <span className="text-red-600">↘</span>;
      default:
        return <span className="text-gray-600">→</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <FaExclamationTriangle className="h-6 w-6 text-red-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-red-800">Error Loading Student Data</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FaUser className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Analytics</h1>
              <p className="text-gray-600">Comprehensive student performance and engagement insights</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              aria-label="Time Range"
              value={timeRange}
              onChange={(e) => window.location.search = `?timeRange=${e.target.value}`}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="term">This Term</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student List / Selection */}
      {!studentId && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Student</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <div
                key={student.studentId}
                onClick={() => setSelectedStudent(student)}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{student.name}</h3>
                  <span className="text-sm text-gray-500">{student.grade}</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Attendance:</span>
                    <span className={getPerformanceColor(student.performanceMetrics.attendance.rate)}>
                      {student.performanceMetrics.attendance.rate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Score:</span>
                    <span className={getPerformanceColor(student.performanceMetrics.academic.averageScore)}>
                      {student.performanceMetrics.academic.averageScore}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dropout Risk:</span>
                    <span className={`px-2 py-1 rounded text-xs ${getRiskColor(student.predictions.engagement.predictedDropoutRisk)}`}>
                      {student.predictions.engagement.predictedDropoutRisk}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Student View */}
      {selectedStudent && (
        <div className="space-y-6">
          {/* Student Header */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaUser className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedStudent.name}</h2>
                  <p className="text-gray-600">Grade {selectedStudent.grade} • Student ID: {selectedStudent.studentId}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Predicted Grade</div>
                <div className="text-2xl font-bold text-blue-600">{selectedStudent.predictions.performance.predictedEndOfTermGrade}</div>
                <div className="text-xs text-gray-500">{selectedStudent.predictions.performance.confidence}% confidence</div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Attendance */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Attendance</h3>
                <FaClock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Attendance Rate</span>
                  <div className="flex items-center space-x-2">
                    <span className={`font-semibold ${getPerformanceColor(selectedStudent.performanceMetrics.attendance.rate)}`}>
                      {selectedStudent.performanceMetrics.attendance.rate}%
                    </span>
                    {getTrendIcon(selectedStudent.performanceMetrics.attendance.trend)}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <ProgressBar
                    width={selectedStudent.performanceMetrics.attendance.rate}
                    className="bg-blue-600 h-2 rounded-full"
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{selectedStudent.performanceMetrics.attendance.absences} absences</span>
                  <span>{selectedStudent.performanceMetrics.attendance.lates} lates</span>
                </div>
              </div>
            </div>

            {/* Academic Performance */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Academic Performance</h3>
                <FaChartLine className="h-6 w-6 text-green-600" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Average Score</span>
                  <div className="flex items-center space-x-2">
                    <span className={`font-semibold ${getPerformanceColor(selectedStudent.performanceMetrics.academic.averageScore)}`}>
                      {selectedStudent.performanceMetrics.academic.averageScore}%
                    </span>
                    {getTrendIcon(selectedStudent.performanceMetrics.academic.trend)}
                  </div>
                </div>
                <div className="space-y-2">
                  {selectedStudent.performanceMetrics.academic.subjects.slice(0, 3).map((subject) => (
                    <div key={subject.subject} className="flex justify-between text-sm">
                      <span>{subject.subject}</span>
                      <div className="flex items-center space-x-1">
                        <span className={getPerformanceColor(subject.score)}>{subject.score}%</span>
                        {getTrendIcon(subject.trend)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Engagement */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Engagement</h3>
                <FaBook className="h-6 w-6 text-purple-600" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Participation Rate</span>
                  <div className="flex items-center space-x-2">
                    <span className={`font-semibold ${getPerformanceColor(selectedStudent.performanceMetrics.engagement.participationRate)}`}>
                      {selectedStudent.performanceMetrics.engagement.participationRate}%
                    </span>
                    {getTrendIcon(selectedStudent.performanceMetrics.engagement.trend)}
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Login Frequency</span>
                    <span>{selectedStudent.performanceMetrics.engagement.loginFrequency}/week</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Session</span>
                    <span>{selectedStudent.performanceMetrics.engagement.averageSessionDuration}min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
              <FaExclamationTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Dropout Risk</h4>
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <ProgressBar
                        width={selectedStudent.predictions.engagement.predictedDropoutRisk}
                        className={`h-3 rounded-full ${selectedStudent.predictions.engagement.predictedDropoutRisk >= 70 ? 'bg-red-600' : selectedStudent.predictions.engagement.predictedDropoutRisk >= 40 ? 'bg-yellow-600' : 'bg-green-600'}`}
                      />
                    </div>
                  </div>
                  <span className={`font-semibold ${getRiskColor(selectedStudent.predictions.engagement.predictedDropoutRisk)}`}>
                    {selectedStudent.predictions.engagement.predictedDropoutRisk}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedStudent.predictions.engagement.confidence}% confidence
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Performance Prediction</h4>
                <div className="flex items-center space-x-3">
                  <FaTrophy className="h-8 w-8 text-yellow-500" />
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedStudent.predictions.performance.predictedEndOfTermGrade}
                    </div>
                    <p className="text-sm text-gray-600">
                      {selectedStudent.predictions.performance.confidence}% confidence
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Alerts */}
          {selectedStudent.alerts.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Alerts</h3>
              <div className="space-y-3">
                {selectedStudent.alerts.map((alert, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                    alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                    alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <FaExclamationTriangle className={`h-4 w-4 ${
                            alert.severity === 'critical' ? 'text-red-600' :
                            alert.severity === 'high' ? 'text-orange-600' :
                            alert.severity === 'medium' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`} />
                          <span className="font-medium text-gray-900 capitalize">{alert.type} Alert</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-gray-700 mt-1">{alert.message}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(alert.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {selectedStudent.recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                        {activity.type}
                      </span>
                      <span className="text-sm text-gray-600">{activity.description}</span>
                    </div>
                    {activity.duration && (
                      <p className="text-sm text-gray-500 mt-1">Duration: {activity.duration} minutes</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}