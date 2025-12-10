import React from 'react';
import InterventionDetailClient from './InterventionDetailClient';

interface InterventionDetailProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function InterventionDetailPage({ params }: InterventionDetailProps) {
  const { id } = await params;
  return <InterventionDetailClient id={id} />;
}
