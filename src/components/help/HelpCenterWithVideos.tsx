'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Help Centre with Video Tutorials
 * 
 * Features comprehensive video guides for:
 * - Getting Started
 * - Assessments & Reports
 * - Interventions
 * - EHCP Process
 * - Data Security & Compliance
 * - Technical Support
 */

import React, { useState } from 'react';
import { 
  Search, Book, FileText, MessageCircle, ChevronRight, 
  Play, Video, Shield, Users, GraduationCap, Settings,
  HelpCircle, Phone, Mail, Clock, CheckCircle
} from 'lucide-react';
import { VideoTutorialPlayer, VideoThumbnail, VideoModal } from '@/components/video/VideoTutorialPlayer';

// Video tutorial categories with videos mapped to heygen-video-urls keys
const VIDEO_CATEGORIES = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Book,
    description: 'Quick start guides for new users',
    videos: [
      { key: 'help-getting-started', title: 'Platform Overview', duration: '3:45', description: 'Learn how to navigate the platform and discover key features' },
      { key: 'help-first-assessment', title: 'Running Your First Assessment', duration: '4:20', description: 'Step-by-step guide to conducting your first stealth assessment' },
      { key: 'onboarding-welcome', title: 'Welcome to EdPsych Connect', duration: '2:30', description: 'Introduction to the platform and its mission' },
    ]
  },
  {
    id: 'features',
    title: 'Platform Features',
    icon: Settings,
    description: 'Deep dives into core functionality',
    videos: [
      { key: 'feature-dashboard', title: 'Dashboard Overview', duration: '3:15', description: 'Navigate your personalised dashboard effectively' },
      { key: 'feature-no-child-engine', title: 'No Child Left Behind Engine', duration: '4:50', description: 'Discover how AI ensures every child is identified for support' },
      { key: 'feature-interventions', title: 'Intervention Library', duration: '3:30', description: 'Browse and select evidence-based interventions' },
      { key: 'feature-reports', title: 'Reports & Analytics', duration: '4:00', description: 'Generate professional reports for stakeholders' },
      { key: 'feature-collaboration', title: 'Team Collaboration', duration: '3:20', description: 'Work seamlessly with colleagues and external professionals' },
      { key: 'feature-senco-analytics', title: 'SENCO Analytics Dashboard', duration: '5:10', description: 'Advanced analytics for SENCOs and school leaders' },
    ]
  },
  {
    id: 'ehcp',
    title: 'EHCP Process',
    icon: FileText,
    description: 'Navigate the EHCP journey',
    videos: [
      { key: 'ehcp-application-journey', title: 'EHCP Application Journey', duration: '6:00', description: 'Complete guide to the EHCP application process' },
      { key: 'ehcp-evidence-gathering', title: 'Gathering Evidence', duration: '5:30', description: 'How to collect and organise evidence for EHCP applications' },
      { key: 'ehcp-annual-review-process', title: 'Annual Review Process', duration: '4:45', description: 'Managing and conducting annual reviews effectively' },
      { key: 'ehcp-appeals-process', title: 'Appeals & Tribunals', duration: '5:15', description: 'Understanding the appeals process and your rights' },
    ]
  },
  {
    id: 'parent-portal',
    title: 'For Parents',
    icon: Users,
    description: 'Guides for parents and carers',
    videos: [
      { key: 'parent-portal-welcome', title: 'Parent Portal Welcome', duration: '3:00', description: 'Introduction to the parent portal and your child\'s profile' },
      { key: 'parent-support-plan', title: 'Understanding Support Plans', duration: '4:30', description: 'How to read and contribute to your child\'s support plan' },
      { key: 'parent-communication', title: 'Communicating with School', duration: '3:15', description: 'Effective communication tools and tips' },
      { key: 'parent-home-support', title: 'Home Support Strategies', duration: '5:00', description: 'Evidence-based strategies to support learning at home' },
    ]
  },
  {
    id: 'send-conditions',
    title: 'Understanding SEND',
    icon: GraduationCap,
    description: 'Educational content on specific needs',
    videos: [
      { key: 'understanding-autism', title: 'Understanding Autism', duration: '6:30', description: 'Comprehensive overview of autism spectrum condition' },
      { key: 'understanding-adhd', title: 'Understanding ADHD', duration: '5:45', description: 'ADHD explained for educators and parents' },
      { key: 'understanding-dyscalculia', title: 'Understanding Dyscalculia', duration: '4:30', description: 'Recognising and supporting mathematical learning difficulties' },
      { key: 'understanding-slcn', title: 'Speech & Language Needs', duration: '5:00', description: 'Supporting children with communication difficulties' },
      { key: 'understanding-semh', title: 'Social, Emotional & Mental Health', duration: '5:30', description: 'Understanding and supporting SEMH needs' },
      { key: 'understanding-physical-medical', title: 'Physical & Medical Needs', duration: '4:45', description: 'Coordinating support for physical and medical conditions' },
    ]
  },
  {
    id: 'security',
    title: 'Data & Security',
    icon: Shield,
    description: 'Data protection and compliance',
    videos: [
      { key: 'help-data-security', title: 'Data Security Overview', duration: '4:00', description: 'How we protect your data with enterprise-grade security' },
      { key: 'compliance-data-protection', title: 'GDPR & Data Protection', duration: '5:15', description: 'Your rights and our compliance obligations' },
      { key: 'safeguarding-features', title: 'Safeguarding Features', duration: '4:30', description: 'How the platform supports safeguarding responsibilities' },
      { key: 'data-export-portability', title: 'Data Export & Portability', duration: '3:45', description: 'Exporting your data and maintaining control' },
    ]
  },
  {
    id: 'admin',
    title: 'Administration',
    icon: Settings,
    description: 'For IT admins and school leaders',
    videos: [
      { key: 'admin-dashboard-guide', title: 'Admin Dashboard Guide', duration: '5:00', description: 'Managing users, permissions, and school settings' },
      { key: 'admin-sso-configuration', title: 'SSO Configuration', duration: '4:30', description: 'Setting up single sign-on with Google, Microsoft, or SAML' },
      { key: 'admin-mis-integration', title: 'MIS Integration', duration: '4:15', description: 'Connecting to SIMS, Arbor, Bromcom and other systems' },
      { key: 'subscription-billing-management', title: 'Billing & Subscriptions', duration: '3:30', description: 'Managing your subscription and billing settings' },
    ]
  },
  {
    id: 'support',
    title: 'Technical Support',
    icon: HelpCircle,
    description: 'Troubleshooting and help',
    videos: [
      { key: 'help-technical-support', title: 'Getting Technical Help', duration: '2:45', description: 'How to contact support and report issues' },
      { key: 'error-general', title: 'Common Error Solutions', duration: '3:30', description: 'Fixing common issues you may encounter' },
      { key: 'error-connection', title: 'Connection Issues', duration: '2:30', description: 'Troubleshooting connectivity problems' },
      { key: 'mobile-app-guide', title: 'Mobile App Guide', duration: '3:45', description: 'Using EdPsych Connect on mobile devices' },
      { key: 'accessibility-features', title: 'Accessibility Features', duration: '4:00', description: 'Using accessibility options and accommodations' },
    ]
  },
];

const POPULAR_ARTICLES = [
  { id: 1, title: 'How to run a Stealth Assessment', category: 'assessments', views: 1204, videoKey: 'help-first-assessment' },
  { id: 2, title: 'Interpreting the Cognitive Profile', category: 'assessments', views: 982 },
  { id: 3, title: 'Setting up the Self-Driving SENCO', category: 'interventions', views: 856, videoKey: 'feature-senco-analytics' },
  { id: 4, title: 'Importing students from SIMS/Arbor', category: 'getting-started', views: 2103, videoKey: 'admin-mis-integration' },
  { id: 5, title: 'Understanding the Universal Translator', category: 'interventions', views: 654 },
  { id: 6, title: 'EHCP Application Best Practices', category: 'ehcp', views: 1567, videoKey: 'ehcp-application-journey' },
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{ key: string; title: string } | null>(null);
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());

  const handleVideoComplete = (videoKey: string) => {
    setWatchedVideos(prev => new Set([...prev, videoKey]));
  };

  const filteredCategories = VIDEO_CATEGORIES.filter(cat =>
    searchQuery === '' ||
    cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.videos.some(v => 
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const currentCategory = selectedCategory 
    ? VIDEO_CATEGORIES.find(c => c.id === selectedCategory) 
    : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Search Section */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">How can we help you?</h1>
          <p className="text-indigo-200 mb-6">Search our knowledge base or browse video tutorials</p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for articles, guides, and tutorials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-lg"
            />
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center justify-center gap-8 mt-8 text-sm">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-indigo-300" />
              <span className="text-indigo-200">{VIDEO_CATEGORIES.reduce((acc, cat) => acc + cat.videos.length, 0)} Video Tutorials</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-300" />
              <span className="text-indigo-200">50+ Help Articles</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-300" />
              <span className="text-indigo-200">24/7 Support</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Featured Video Section */}
        {!selectedCategory && !searchQuery && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Play className="w-6 h-6 text-indigo-600" />
              Featured Tutorial
            </h2>
            <div className="grid lg:grid-cols-2 gap-8">
              <VideoTutorialPlayer
                videoKey="help-getting-started"
                title="Getting Started with EdPsych Connect"
                description="A comprehensive introduction to the platform, covering navigation, key features, and how to get the most out of your experience. Perfect for new users."
                duration="3:45"
                onComplete={() => handleVideoComplete('help-getting-started')}
              />
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">Quick Start Videos</h3>
                <div className="grid gap-4">
                  {[
                    { key: 'help-first-assessment', title: 'Run Your First Assessment', duration: '4:20' },
                    { key: 'feature-dashboard', title: 'Navigate Your Dashboard', duration: '3:15' },
                    { key: 'feature-interventions', title: 'Find the Right Interventions', duration: '3:30' },
                  ].map(video => (
                    <button
                      key={video.key}
                      onClick={() => setSelectedVideo({ key: video.key, title: video.title })}
                      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all text-left group"
                    >
                      <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                        <Play className="w-5 h-5 text-indigo-600 group-hover:text-white ml-0.5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 group-hover:text-indigo-700">{video.title}</h4>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {video.duration}
                        </p>
                      </div>
                      {watchedVideos.has(video.key) && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Detail View */}
        {currentCategory && (
          <div className="mb-12">
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-indigo-600 hover:text-indigo-700 font-medium mb-4 flex items-center gap-1"
            >
              ← Back to all categories
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <currentCategory.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{currentCategory.title}</h2>
                <p className="text-slate-500">{currentCategory.description}</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentCategory.videos.map(video => (
                <VideoThumbnail
                  key={video.key}
                  videoKey={video.key}
                  title={video.title}
                  description={video.description}
                  duration={video.duration}
                  onClick={() => setSelectedVideo({ key: video.key, title: video.title })}
                  isWatched={watchedVideos.has(video.key)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Categories Grid */}
        {!currentCategory && (
          <>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Browse by Topic</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {filteredCategories.map(cat => {
                const Icon = cat.icon;
                const watchedCount = cat.videos.filter(v => watchedVideos.has(v.key)).length;
                return (
                  <button 
                    key={cat.id} 
                    onClick={() => setSelectedCategory(cat.id)}
                    className="bg-white p-6 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all text-left group"
                  >
                    <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1 group-hover:text-indigo-700">{cat.title}</h3>
                    <p className="text-sm text-slate-500 mb-2">{cat.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Video className="w-3 h-3" /> {cat.videos.length} videos
                      </span>
                      {watchedCount > 0 && (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> {watchedCount} watched
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Popular Articles */}
        {!currentCategory && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">
                {searchQuery ? 'Search Results' : 'Popular Articles'}
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {POPULAR_ARTICLES.filter(article =>
                !searchQuery || article.title.toLowerCase().includes(searchQuery.toLowerCase())
              ).map(article => (
                <button 
                  key={article.id} 
                  onClick={() => article.videoKey && setSelectedVideo({ key: article.videoKey, title: article.title })}
                  className="w-full p-4 hover:bg-slate-50 flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {article.videoKey ? (
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Play className="w-4 h-4 text-indigo-600" />
                      </div>
                    ) : (
                      <FileText className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                    )}
                    <span className="text-slate-700 font-medium group-hover:text-indigo-700">{article.title}</span>
                    {article.videoKey && (
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Video</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-400">{article.views.toLocaleString()} views</span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Contact Support */}
        <div className="mt-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-2">Still need help?</h3>
            <p className="text-indigo-100 mb-6">Our support team is here to assist you</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a 
                href="mailto:support@edpsychconnect.com"
                className="px-6 py-3 bg-white text-indigo-700 rounded-xl font-medium hover:bg-indigo-50 transition-colors inline-flex items-center gap-2"
              >
                <Mail className="w-5 h-5" /> Email Support
              </a>
              <button className="px-6 py-3 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition-colors inline-flex items-center gap-2">
                <MessageCircle className="w-5 h-5" /> Live Chat
              </button>
              <a 
                href="tel:+442012345678"
                className="px-6 py-3 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition-colors inline-flex items-center gap-2"
              >
                <Phone className="w-5 h-5" /> Call Us
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal
          videoKey={selectedVideo.key}
          title={selectedVideo.title}
          isOpen={true}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
}
