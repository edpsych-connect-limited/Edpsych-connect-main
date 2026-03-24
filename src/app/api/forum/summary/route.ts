/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Forum Summary API
 * Provides forum statistics and trending topics
 * 
 * NOTE: Forum backend not yet implemented. Returns empty state data.
 * When a forum database is added, replace this with real queries.
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Forum categories — structural only; topic/post counts from DB when available
const FORUM_CATEGORIES = [
  { id: 'send-support', name: 'SEND Support Strategies', topics: 0, posts: 0 },
  { id: 'assessment-practice', name: 'Assessment & Evaluation', topics: 0, posts: 0 },
  { id: 'ehcp-guidance', name: 'EHCP & Statutory Processes', topics: 0, posts: 0 },
  { id: 'interventions', name: 'Intervention Strategies', topics: 0, posts: 0 },
  { id: 'mental-health', name: 'Mental Health & Wellbeing', topics: 0, posts: 0 },
  { id: 'autism-neurodiversity', name: 'Autism & Neurodiversity', topics: 0, posts: 0 },
  { id: 'professional-development', name: 'Professional Development', topics: 0, posts: 0 },
  { id: 'research-evidence', name: 'Research & Evidence Base', topics: 0, posts: 0 }
];

export async function GET() {
  // Forum backend not yet implemented — return empty state
  // No fake names, no fake counts
  return NextResponse.json({
    success: true,
    summary: {
      stats: {
        totalTopics: 0,
        totalPosts: 0,
        totalMembers: 0,
        activeToday: 0
      },
      categories: FORUM_CATEGORIES,
      trendingTopics: [],
      expertContributors: [],
      activeUsers: [],
      recentActivity: {
        newTopicsToday: 0,
        newPostsToday: 0,
        newMembersThisWeek: 0
      }
    }
  });
}
