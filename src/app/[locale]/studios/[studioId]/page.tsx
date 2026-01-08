'use client';

import React from 'react';
import { notFound } from 'next/navigation';
import { VideoTutorialPlayer } from '@/components/video/VideoTutorialPlayer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/navigation';
import { STUDIO_DEFINITIONS } from '@/services/navigation-service';
import { NAVIGATION_CONFIG, NavGroup } from '@/config/navigation';
import { 
  ArrowLeft, 
  ArrowRight, 
  LayoutDashboard, 
  ExternalLink,
  Clock,
  Sparkles
} from 'lucide-react';

interface StudioPageProps {
  params: {
    studioId: string;
    locale: string;
  };
}

// Find the corresponding NavGroup for the studio
function getStudioNavGroup(studioId: string): NavGroup | undefined {
  const targetId = `${studioId}_studio`;
  return NAVIGATION_CONFIG.find(g => g.id === targetId || g.id === studioId);
}

export default function StudioPage({ params }: StudioPageProps) {
  // Normalize studioId
  const studioId = params.studioId.toLowerCase();
  const config = STUDIO_DEFINITIONS[studioId];

  if (!config) {
    notFound();
  }

  const Icon = config.icon;
  const navGroup = getStudioNavGroup(studioId);

  // Filter out the "Overview" link itself to avoid recursion in the dashboard/widgets
  const quickActions = navGroup?.items.filter(item => 
    !item.href.includes('/studios/') && item.label !== 'Studio Overview'
  ) || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in duration-500">
      {/* Navigation Header */}
      <div className="mb-6">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Studio Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-50 rounded-xl border border-primary-100 shadow-sm">
              <Icon className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{config.title}</h1>
              <p className="text-gray-500 mt-1">{config.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="px-3 py-1 bg-white">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              Live Mode
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Hero & Widgets (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Hero Video Widget */}
          <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-gray-200 bg-white">
            <div className="border-b border-gray-100 bg-gray-50/50 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="font-semibold text-gray-700 text-sm">Studio Orientation</span>
              </div>
              <Badge variant="secondary" className="text-xs font-normal">Essential</Badge>
            </div>
            <div className="aspect-video w-full bg-slate-900">
              <VideoTutorialPlayer
                videoKey={config.videoKey}
                title={`${config.title} Orientation`}
                description={`Master the core workflows of the ${config.title}`}
                className="w-full h-full"
                autoPlay={false} 
              />
            </div>
            <CardFooter className="bg-gray-50 p-4 text-sm text-gray-500 border-t border-gray-100 flex justify-between">
              <span>Duration: ~2 mins</span>
              <Link href="/training" className="text-primary-600 hover:underline flex items-center">
                View full training library <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </CardFooter>
          </Card>

          {/* Launchpad Grid (Dashboard Widgets) */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <LayoutDashboard className="w-5 h-5 mr-2 text-gray-500" />
              Tools & Workflows
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, idx) => (
                <Link key={idx} href={action.href} className="block group h-full">
                  <Card className="h-full hover:shadow-md transition-all duration-200 border-gray-200 group-hover:border-primary-200 group-hover:bg-primary-50/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold text-gray-800 group-hover:text-primary-700 flex justify-between items-start">
                        {action.label}
                        {action.beta && (
                          <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-0 text-[10px] px-2">BETA</Badge>
                        )}
                        {!action.beta && (
                          <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="line-clamp-2">
                        Access {action.label} tools and manage your workflows within the {config.title}.
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              
              {/* Fallback if no actions found in nav config */}
              {quickActions.length === 0 && config.features.map((feature, idx) => (
                <Card key={idx} className="bg-gray-50 border-dashed border-gray-200">
                  <CardContent className="p-6 flex flex-col items-center text-center justify-center text-gray-500">
                    <h3 className="font-medium text-gray-700 mb-1">{feature}</h3>
                    <p className="text-xs">Feature available in menu</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Activity & Status (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Primary CTA Card */}
          <Card className="bg-gradient-to-br from-primary-600 to-primary-700 text-white border-0 shadow-lg relative overflow-hidden">
             
             {/* Decorative circle */}
             <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

             <CardHeader>
              <CardTitle className="text-xl">Quick Start</CardTitle>
              <CardDescription className="text-primary-100">
                Ready to begin your work?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={config.ctaLink}>
                <Button className="w-full bg-white text-primary-700 hover:bg-gray-100 shadow-sm border-0 font-semibold h-11">
                  {config.ctaText}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Activity Widget (Mock) */}
          <Card>
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-base font-semibold flex items-center">
                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5 mr-3 shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">System updated</p>
                      <p className="text-xs text-gray-500 block">2 hours ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t border-gray-100 p-3">
              <Button variant="ghost" size="sm" className="w-full text-xs text-gray-500 h-8">
                View Activity Log
              </Button>
            </CardFooter>
          </Card>

          {/* Tips Widget */}
          <Card className="bg-amber-50 border-amber-100">
            <CardContent className="p-4">
              <h3 className="font-semibold text-amber-900 mb-2 text-sm">Did you know?</h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                You can pin your most frequently used {config.title} tools to your sidebar by dragging them in the settings menu.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
