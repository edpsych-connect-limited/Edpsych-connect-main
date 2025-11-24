import React from 'react';
import CodingSandbox from '@/components/demo/CodingSandbox';

export const metadata = {
  title: 'Developers of Tomorrow | EdPsych Connect',
  description: 'Learn to code by modding your favorite games.',
};

export default function CodingDemoPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <CodingSandbox />
    </div>
  );
}
