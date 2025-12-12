import React from 'react';
import LessonPlayer from '@/components/student/LessonPlayer';

export default function LessonPlayerPage({
  params: { id }
}: {
  params: { id: string };
}) {
  return (
    <div className="-mt-6 -mx-4 sm:-mx-6 lg:-mx-8">
      <LessonPlayer lessonId={id} />
    </div>
  );
}
