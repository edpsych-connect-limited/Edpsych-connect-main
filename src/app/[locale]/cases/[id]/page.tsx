import React from 'react';
import CaseDetailClient from './CaseDetailClient';

interface PageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default async function CaseDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <CaseDetailClient id={resolvedParams.id} />;
}

