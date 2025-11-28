import { logger } from "@/lib/logger";
'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import { useState, useEffect, useId } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface EnrolledCourse {
  id: string;
  title: string;
  progress: number;
  timeSpent: number;
  lastAccessed: Date;
  nextLesson: string;
  instructor: string;
  imageUrl?: string;
  deadline?: Date;
  cpdHours: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  earnedDate: Date;
  icon: string;
}

interface Activity {
  id: string;
  type: 'completed_lesson' | 'earned_certificate' | 'earned_badge' | 'started_course';
  title: string;
  timestamp: Date;
  courseTitle?: string;
}

// Helper component to avoid inline styles
const ProgressBar = ({ progress }: { progress: number }) => {
  const id = useId().replace(/:/g, '');
  return (
    <>
      <style>{`
        .progress-${id} {
          width: ${progress}%;
        }
      `}</style>
      <div
        className={`bg-blue-600 h-2 rounded-full progress-${id}`}
      />
    </>
  );
};

export default function TrainingDashboardPage() {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [achievements, _setAchievements] = useState<Achievement[]>([]);
  const [recentActivity, _setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCpdHours, setTotalCpdHours] = useState(0);
  const [targetCpdHours] = useState(30);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/training/enrollments');
      if (!response.ok) {
        throw new Error('Failed to fetch enrollments');
      }

      const enrollmentsData = await response.json();
      setEnrolledCourses(enrollmentsData);

      const completedCpdHours = enrollmentsData.reduce((acc: number, course: EnrolledCourse) => {
        return acc + (course.cpdHours * (course.progress / 100));
      }, 0);
      setTotalCpdHours(Math.round(completedCpdHours * 10) / 10);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const progressChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'CPD Hours',
        data: [2, 4.5, 7, totalCpdHours],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: targetCpdHours
      }
    }
  };

  const formatTimeSpent = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-GB');
  };

  const progressValue = Math.round((totalCpdHours / targetCpdHours) * 100);

  if (loading) {
    return (
      <div className="flex justify-centre items-centre min-h-screen" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="sr-only">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Learning Dashboard</h1>
          <p className="text-lg text-gray-600">Track your progress and continue your professional development journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-centre justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Courses in Progress</h3>
              <span className="text-2xl">📚</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{enrolledCourses.length}</p>
            <p className="text-xs text-gray-500 mt-1">Active enrollments</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-centre justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">CPD Hours</h3>
              <span className="text-2xl">⏱️</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {totalCpdHours}
              <span className="text-lg text-gray-500">/{targetCpdHours}</span>
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2" aria-hidden="true">
              <ProgressBar progress={progressValue} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-centre justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Time</h3>
              <span className="text-2xl">⏰</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatTimeSpent(enrolledCourses.reduce((acc, course) => acc + course.timeSpent, 0))}
            </p>
            <p className="text-xs text-gray-500 mt-1">Learning time this month</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-centre justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Achievements</h3>
              <span className="text-2xl">🏆</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{achievements.length}</p>
            <p className="text-xs text-gray-500 mt-1">Badges earned</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">CPD Progress</h2>
              <div className="h-64">
                <Line data={progressChartData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-centre justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Active Courses</h2>
                <Link href="/training" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Browse More →
                </Link>
              </div>

              <div className="space-y-4">
                {enrolledCourses.map((course) => (
                  <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-200 rounded-md flex-shrink-0">
                        {course.imageUrl ? (
                          <Image src={course.imageUrl} alt={course.title} width={96} height={96} className="object-cover rounded-md" />
                        ) : (
                          <div className="w-full h-full flex items-centre justify-centre text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                            <p className="text-sm text-gray-600">by {course.instructor}</p>
                          </div>
                          {course.deadline && (
                            <span className="text-xs text-orange-600 font-medium">
                              Due {formatDate(course.deadline)}
                            </span>
                          )}
                        </div>

                        <div className="mb-3">
                         <div className="flex items-centre justify-between text-sm text-gray-600 mb-1">
                           <span>Progress: {course.progress}%</span>
                           <span className="text-xs">Time spent: {formatTimeSpent(course.timeSpent)}</span>
                         </div>
                         <div className="w-full bg-gray-200 rounded-full h-2" aria-hidden="true">
                           <ProgressBar progress={course.progress} />
                         </div>
                       </div>

                        <div className="flex items-centre justify-between">
                          <p className="text-sm text-gray-500">Next: {course.nextLesson}</p>
                          <Link
                            href={`/training/courses/${course.id}`}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                          >
                            Continue
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {enrolledCourses.length === 0 && (
                <div className="text-centre py-12">
                  <p className="text-gray-500 mb-4">You haven&apos;t enrolled in any courses yet.</p>
                  <Link
                    href="/training"
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
                  >
                    Explore Courses
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Achievements</h2>
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-3xl">{achievement.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{achievement.title}</h3>
                      <p className="text-xs text-gray-600 mb-1">{achievement.description}</p>
                      <p className="text-xs text-gray-500">{formatDate(achievement.earnedDate)}</p>
                    </div>
                  </div>
                ))}
              </div>
              {achievements.length === 0 && (
                <p className="text-sm text-gray-500 text-centre py-4">
                  Complete courses to earn achievements
                </p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex gap-3 pb-3 border-b last:border-b-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-centre justify-centre flex-shrink-0">
                      {activity.type === 'completed_lesson' && '✓'}
                      {activity.type === 'earned_certificate' && '🎓'}
                      {activity.type === 'earned_badge' && '🏆'}
                      {activity.type === 'started_course' && '📚'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      {activity.courseTitle && (
                        <p className="text-xs text-gray-600">{activity.courseTitle}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">{formatDate(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">💡</div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">Keep Learning!</h3>
              <p className="text-blue-800 mb-3">
                You&apos;re {Math.round((totalCpdHours / targetCpdHours) * 100)}% of the way to your annual CPD goal.
                Keep up the great work!
              </p>
              <Link
                href="/training/certificates"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                View Your Certificates
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}