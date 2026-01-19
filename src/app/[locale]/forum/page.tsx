'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Professional Forum & Community Hub
 * A space for educational professionals to collaborate, share insights,
 * and discuss evidence-based practices in educational psychology.
 */

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Users, 
  BookOpen, 
  Search,
  Plus,
  MessageCircle,
  Eye,
  Clock,
  Award,
  Pin,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Link } from '@/navigation';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/lib/auth/hooks';

// Forum categories with UK educational psychology focus
const FORUM_CATEGORIES = [
  {
    id: 'send-support',
    name: 'SEND Support Strategies',
    description: 'Discuss evidence-based approaches for supporting students with Special Educational Needs and Disabilities',
    icon: 'S',
    color: 'bg-blue-100 text-blue-700',
    topics: 156,
    posts: 1247
  },
  {
    id: 'assessment-practice',
    name: 'Assessment & Evaluation',
    description: 'Share insights on cognitive assessments, ECCA framework implementation, and evaluation methods',
    icon: 'A',
    color: 'bg-purple-100 text-purple-700',
    topics: 89,
    posts: 723
  },
  {
    id: 'ehcp-guidance',
    name: 'EHCP & Statutory Processes',
    description: 'Navigate Education, Health and Care Plans, tribunals, and statutory assessments',
    icon: 'E',
    color: 'bg-green-100 text-green-700',
    topics: 134,
    posts: 1089
  },
  {
    id: 'interventions',
    name: 'Intervention Strategies',
    description: 'Evidence-based interventions for literacy, numeracy, behaviour, and emotional wellbeing',
    icon: 'I',
    color: 'bg-amber-100 text-amber-700',
    topics: 201,
    posts: 1654
  },
  {
    id: 'mental-health',
    name: 'Mental Health & Wellbeing',
    description: 'Supporting student mental health, anxiety, and emotional regulation in educational settings',
    icon: 'M',
    color: 'bg-teal-100 text-teal-700',
    topics: 178,
    posts: 1432
  },
  {
    id: 'autism-neurodiversity',
    name: 'Autism & Neurodiversity',
    description: 'Strategies for supporting autistic students and embracing neurodiversity in schools',
    icon: 'N',
    color: 'bg-indigo-100 text-indigo-700',
    topics: 223,
    posts: 1876
  },
  {
    id: 'professional-development',
    name: 'Professional Development',
    description: 'CPD opportunities, research updates, and career development for EPs and educators',
    icon: 'P',
    color: 'bg-pink-100 text-pink-700',
    topics: 67,
    posts: 412
  },
  {
    id: 'research-evidence',
    name: 'Research & Evidence Base',
    description: 'Discuss latest research, meta-analyses, and evidence-based practice in educational psychology',
    icon: 'R',
    color: 'bg-rose-100 text-rose-700',
    topics: 98,
    posts: 567
  }
];

// Sample trending topics
const TRENDING_TOPICS = [
  {
    id: 't1',
    title: 'New SEND Code of Practice consultation - your thoughts?',
    category: 'ehcp-guidance',
    author: 'Dr Sarah Mitchell',
    authorRole: 'Senior EP',
    replies: 47,
    views: 1234,
    lastActivity: '2 hours ago',
    isPinned: true
  },
  {
    id: 't2',
    title: 'Effective strategies for managing classroom anxiety post-pandemic',
    category: 'mental-health',
    author: 'James Parker',
    authorRole: 'SENCO',
    replies: 32,
    views: 856,
    lastActivity: '4 hours ago',
    isPinned: false
  },
  {
    id: 't3',
    title: 'ECCA Framework: Implementation experiences and tips',
    category: 'assessment-practice',
    author: 'Dr Scott Ighavongbe-Patrick',
    authorRole: 'Platform Founder',
    replies: 89,
    views: 2341,
    lastActivity: '1 day ago',
    isPinned: true
  },
  {
    id: 't4',
    title: 'Supporting sensory processing differences in mainstream settings',
    category: 'autism-neurodiversity',
    author: 'Emma Thompson',
    authorRole: 'Specialist Teacher',
    replies: 28,
    views: 654,
    lastActivity: '6 hours ago',
    isPinned: false
  },
  {
    id: 't5',
    title: 'Working memory interventions: What actually works?',
    category: 'interventions',
    author: 'Dr Priya Sharma',
    authorRole: 'Educational Psychologist',
    replies: 56,
    views: 1567,
    lastActivity: '12 hours ago',
    isPinned: false
  }
];

// Sample expert contributors
const EXPERT_CONTRIBUTORS = [
  {
    id: 'e1',
    name: 'Dr Scott Ighavongbe-Patrick',
    role: 'Platform Founder & EP',
    avatar: '/images/team/dr-scott.jpg',
    posts: 234,
    helpful: 1567,
    badge: 'Founder'
  },
  {
    id: 'e2',
    name: 'Dr Sarah Mitchell',
    role: 'Senior Educational Psychologist',
    avatar: null,
    posts: 189,
    helpful: 1234,
    badge: 'Expert'
  },
  {
    id: 'e3',
    name: 'Prof. Michael Chen',
    role: 'Research Lead',
    avatar: null,
    posts: 156,
    helpful: 987,
    badge: 'Researcher'
  }
];

export default function ForumPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'categories' | 'trending' | 'latest' | 'my-topics'>('categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading forum data
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredCategories = FORUM_CATEGORIES.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTopics = TRENDING_TOPICS.filter(topic =>
    (!selectedCategory || topic.category === selectedCategory) &&
    (topic.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading forum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Professional Community Forum
              </h1>
              <p className="text-blue-100 text-lg max-w-2xl">
                Connect with educational psychologists, SENCOs, and educators. 
                Share evidence-based practices and learn from the community.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold">1,146</div>
                  <div className="text-blue-200 text-sm">Topics</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">9,000+</div>
                  <div className="text-blue-200 text-sm">Posts</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">2,340</div>
                  <div className="text-blue-200 text-sm">Members</div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, categories, or keywords..."
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          {/* Tabs */}
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border">
            {(['categories', 'trending', 'latest', 'my-topics'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab === 'categories' && 'Categories'}
                {tab === 'trending' && 'Trending'}
                {tab === 'latest' && 'Latest'}
                {tab === 'my-topics' && 'My Topics'}
              </button>
            ))}
          </div>

          {/* New Topic Button */}
          {user ? (
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              New Topic
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign in to Post
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Categories View */}
            {activeTab === 'categories' && (
              <div className="space-y-4">
                {filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setActiveTab('trending');
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl ${category.color} flex items-center justify-center text-2xl`}>
                        {category.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {category.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {category.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {category.topics} topics
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {category.posts} posts
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Trending/Latest Topics View */}
            {(activeTab === 'trending' || activeTab === 'latest') && (
              <div className="space-y-4">
                {selectedCategory && (
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      All Categories
                    </button>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 text-sm">
                      {FORUM_CATEGORIES.find(c => c.id === selectedCategory)?.name}
                    </span>
                  </div>
                )}

                {filteredTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {topic.isPinned && (
                            <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                              <Pin className="w-3 h-3" /> Pinned
                            </span>
                          )}
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {FORUM_CATEGORIES.find(c => c.id === topic.category)?.name}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                          {topic.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="font-medium text-gray-700">{topic.author}</span>
                          <span className="text-gray-400"></span>
                          <span>{topic.authorRole}</span>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {topic.replies}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {topic.views}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <Clock className="w-4 h-4" />
                          {topic.lastActivity}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredTopics.length === 0 && (
                  <EmptyState
                    title="No topics found"
                    description="Try adjusting your search or filter criteria."
                  />
                )}
              </div>
            )}

            {/* My Topics View */}
            {activeTab === 'my-topics' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                {user ? (
                  <>
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No topics yet</h3>
                    <p className="text-gray-500 mb-4">Start a discussion to see your topics here</p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Create Your First Topic
                    </button>
                  </>
                ) : (
                  <>
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in to view your topics</h3>
                    <p className="text-gray-500 mb-4">Join the community to participate in discussions</p>
                    <Link
                      href="/login"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Community Guidelines */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Community Guidelines
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500"></span>
                  Be respectful and professional
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500"></span>
                  Share evidence-based practices
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500"></span>
                  Maintain confidentiality
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500"></span>
                  Support fellow professionals
                </li>
              </ul>
            </div>

            {/* Expert Contributors */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Expert Contributors
              </h3>
              <div className="space-y-4">
                {EXPERT_CONTRIBUTORS.map((expert) => (
                  <div key={expert.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {expert.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 text-sm truncate">
                          {expert.name}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          expert.badge === 'Founder' 
                            ? 'bg-purple-100 text-purple-700' 
                            : expert.badge === 'Expert'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {expert.badge}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">{expert.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link
                  href="/help"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <ChevronRight className="w-4 h-4" />
                  Help Centre
                </Link>
                <Link
                  href="/training"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <ChevronRight className="w-4 h-4" />
                  CPD Courses
                </Link>
                <Link
                  href="/marketplace"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <ChevronRight className="w-4 h-4" />
                  EP Marketplace
                </Link>
                <Link
                  href="/research"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <ChevronRight className="w-4 h-4" />
                  Research Hub
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
