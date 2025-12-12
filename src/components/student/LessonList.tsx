'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

interface Lesson {
  id: string;
  title: string;
  description: string;
  lesson_order: number;
  estimated_minutes: number;
  cognitive_load: number;
  has_audio_version: boolean;
  has_visual_guide: boolean;
  has_simplified_version: boolean;
}

interface Curriculum {
  id: string;
  title: string;
  description: string;
  level: string;
  lessons: Lesson[];
}

export default function LessonList() {
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [loading, setLoading] = useState(true);
  const locale = useLocale();

  useEffect(() => {
    const fetchCurricula = async () => {
      try {
        const response = await fetch('/api/coding/curriculum?type=curricula');
        if (response.ok) {
          const data = await response.json();
          setCurricula(data);
        }
      } catch (error) {
        console.error('Failed to fetch curricula', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurricula();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {curricula.map((curriculum) => (
        <div key={curriculum.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-indigo-50">
            <h3 className="text-lg leading-6 font-medium text-indigo-900">
              {curriculum.title}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-indigo-700">
              {curriculum.description}
            </p>
          </div>
          <div className="border-t border-gray-200">
            <ul role="list" className="divide-y divide-gray-200">
              {curriculum.lessons?.map((lesson) => (
                <li key={lesson.id}>
                  <Link href={`/${locale}/student/lessons/${lesson.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                            {lesson.lesson_order}
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-indigo-600 truncate">{lesson.title}</p>
                            <div className="flex space-x-2 mt-1">
                              {lesson.has_audio_version && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  Audio
                                </span>
                              )}
                              {lesson.has_visual_guide && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  Visual Guide
                                </span>
                              )}
                              {lesson.has_simplified_version && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Simplified
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex flex-col items-end">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            {lesson.estimated_minutes} mins
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            Cognitive Load: {lesson.cognitive_load}/5
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {lesson.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
      {curricula.length === 0 && (
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No lessons found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by enrolling in a course.</p>
        </div>
      )}
    </div>
  );
}
