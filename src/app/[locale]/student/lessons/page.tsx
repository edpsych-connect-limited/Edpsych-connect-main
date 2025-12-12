import React from 'react';
import LessonList from '@/components/student/LessonList';

export default function LessonsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Lessons</h1>
        <p className="mt-1 text-sm text-gray-500">
          Select a lesson to start learning.
        </p>
      </div>
      <LessonList />
    </div>
  );
}
