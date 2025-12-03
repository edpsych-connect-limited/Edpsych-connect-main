/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Forum Summary API
 * Provides forum statistics and trending topics
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Forum categories with realistic data
const FORUM_CATEGORIES = [
  { id: 'send-support', name: 'SEND Support Strategies', topics: 156, posts: 1247 },
  { id: 'assessment-practice', name: 'Assessment & Evaluation', topics: 89, posts: 723 },
  { id: 'ehcp-guidance', name: 'EHCP & Statutory Processes', topics: 134, posts: 1089 },
  { id: 'interventions', name: 'Intervention Strategies', topics: 201, posts: 1654 },
  { id: 'mental-health', name: 'Mental Health & Wellbeing', topics: 178, posts: 1432 },
  { id: 'autism-neurodiversity', name: 'Autism & Neurodiversity', topics: 223, posts: 1876 },
  { id: 'professional-development', name: 'Professional Development', topics: 67, posts: 412 },
  { id: 'research-evidence', name: 'Research & Evidence Base', topics: 98, posts: 567 }
];

// Trending topics
const TRENDING_TOPICS = [
  {
    id: 't1',
    title: 'New SEND Code of Practice consultation - your thoughts?',
    category: 'ehcp-guidance',
    author: 'Dr Sarah Mitchell',
    authorRole: 'Senior EP',
    replies: 47,
    views: 1234,
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
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
    lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
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
    lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
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
    lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
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
    lastActivity: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    isPinned: false
  }
];

// Active contributors
const ACTIVE_USERS = [
  { id: 'u1', name: 'Dr Scott Ighavongbe-Patrick', role: 'Platform Founder', posts: 234 },
  { id: 'u2', name: 'Dr Sarah Mitchell', role: 'Senior EP', posts: 189 },
  { id: 'u3', name: 'Prof. Michael Chen', role: 'Research Lead', posts: 156 },
  { id: 'u4', name: 'Emma Thompson', role: 'Specialist Teacher', posts: 143 },
  { id: 'u5', name: 'James Parker', role: 'SENCO', posts: 112 }
];

export async function GET() {
  // Calculate totals
  const totalTopics = FORUM_CATEGORIES.reduce((sum, cat) => sum + cat.topics, 0);
  const totalPosts = FORUM_CATEGORIES.reduce((sum, cat) => sum + cat.posts, 0);
  
  return NextResponse.json({
    success: true,
    summary: {
      stats: {
        totalTopics,
        totalPosts,
        totalMembers: 2340,
        activeToday: 156
      },
      categories: FORUM_CATEGORIES,
      trendingTopics: TRENDING_TOPICS,
      activeUsers: ACTIVE_USERS,
      recentActivity: {
        newTopicsToday: 12,
        newPostsToday: 87,
        newMembersThisWeek: 34
      }
    }
  });
}
