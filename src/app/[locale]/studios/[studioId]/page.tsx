'use client';

import React from 'react';
import { notFound } from 'next/navigation';
import { VideoTutorialPlayer } from '@/components/video/VideoTutorialPlayer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import { ArrowLeft, BookOpen, Users, Settings, Activity } from 'lucide-react';

// Configuration for each Studio
const STUDIO_CONFIG: Record<string, {
  title: string;
  description: string;
  videoKey: string;
  icon: React.ElementType;
  features: string[];
  ctaLink: string;
  ctaText: string;
}> = {
  'clinical': {
    title: 'Clinical Studio',
    description: 'Comprehensive assessment, intervention, and case management for Educational Psychologists.',
    videoKey: 'clinical-studio-overview',
    icon: Activity,
    features: [
      'EHCP Management & Automation',
      'Clinical Assessment Suite',
      'Intervention Library',
      'Case File Management'
    ],
    ctaLink: '/ehcp',
    ctaText: 'Go to EHCP Dashboard'
  },
  'engagement': {
    title: 'Engagement Studio',
    description: 'Tools to boost student participation, track rewards, and manage gamified learning journeys.',
    videoKey: 'engagement-studio-overview',
    icon: Users, // Using likely icons, import might need adjustment based on what's available
    features: [
      'Gamification Zone',
      'Token Economy System',
      'Training Centre',
      'AI Companions (Beta)'
    ],
    ctaLink: '/gamification',
    ctaText: 'Enter Gamification Zone'
  },
  'classroom': {
    title: 'Classroom Studio',
    description: 'Empowering teachers with behaviour tracking, progress monitoring, and peer networking.',
    videoKey: 'classroom-studio-overview',
    icon: BookOpen,
    features: [
      'Classroom Management',
      'Pupil Progress Tracking',
      'Behaviour Tracker',
      'Staff Community'
    ],
    ctaLink: '/teachers',
    ctaText: 'Manage Classroom'
  },
  'admin': {
    title: 'Admin Studio',
    description: 'System-wide control, compliance, and institutional administration for LA and Superadmins.',
    videoKey: 'admin-studio-overview',
    icon: Settings,
    features: [
      'Institutional Management',
      'System Administration',
      'LA Dashboard',
      'Compliance & Audits'
    ],
    ctaLink: '/admin',
    ctaText: 'System Administration'
  }
};

interface StudioPageProps {
  params: {
    studioId: string;
    locale: string;
  };
}

export default function StudioPage({ params }: StudioPageProps) {
  // Normalize studioId
  const studioId = params.studioId.toLowerCase();
  const config = STUDIO_CONFIG[studioId];

  if (!config) {
    notFound();
  }

  const Icon = config.icon;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-gray-500 hover:text-primary-600 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>
        
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-primary-100 rounded-lg">
            <Icon className="w-8 h-8 text-primary-700" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{config.title}</h1>
            <p className="text-lg text-gray-600 mt-1">{config.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Video */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-2 border-primary-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary-50 to-white pb-2">
              <CardTitle className="flex items-center text-xl">
                <Icon className="w-5 h-5 mr-2 text-primary-600" />
                Studio Overview
              </CardTitle>
              <CardDescription>
                Watch Dr. Scott introduce the key capabilities of the {config.title}.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="aspect-video w-full bg-gray-900">
                <VideoTutorialPlayer
                  videoKey={config.videoKey}
                  title={`${config.title} Overview`}
                  description={config.description}
                  className="w-full h-full"
                  autoPlay={false} // User explicitly navigates here, but maybe let them choose to play
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions / Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.features.map((feature, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full bg-primary-500" />
                  <span className="font-medium text-gray-700">{feature}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar - Context & Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to the Studio</CardTitle>
              <CardDescription>
                Your central hub for {studioId} workflows.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                This studio provides a specialized environment tailored for your role. 
                Use the tools below to get started immediately.
              </p>
              
              <Link href={config.ctaLink} className="w-full block">
                <Button className="w-full" size="lg">
                  {config.ctaText}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-100">
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-sm text-blue-800 mb-3">
                Our AI Support can guide you through any workflow in this studio.
              </p>
              <Link href="/help">
                <Button variant="outline" className="w-full bg-white hover:bg-blue-50 border-blue-200 text-blue-700">
                  Visit Help Centre
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
