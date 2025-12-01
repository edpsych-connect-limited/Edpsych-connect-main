/**
 * Automation Templates API
 * Manage intervention templates
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export const dynamic = 'force-dynamic';

const DEFAULT_TEMPLATES = [
  {
    id: 'engagement_reminder',
    name: 'Engagement Reminder',
    type: 'engagement',
    description: 'Send personalized reminder to increase engagement',
    triggerConditions: { riskLevel: 'medium', factors: ['low_login_frequency'] },
    actions: [
      { type: 'email', template: 'engagement_reminder', priority: 'normal' },
      { type: 'notification', message: 'Continue your learning journey!' }
    ],
    deliveryMethods: ['email', 'in_app'],
    effectivenessMetrics: ['login_increase', 'completion_rate'],
    targetAudience: 'all_students',
    priority: 'medium',
    usageCount: 42,
    successRate: 0.73
  },
  {
    id: 'academic_support',
    name: 'Academic Support Intervention',
    type: 'academic_support',
    description: 'Provide targeted academic support',
    triggerConditions: { riskLevel: 'high', factors: ['low_performance', 'missed_deadlines'] },
    actions: [
      { type: 'tutoring', schedule: 'immediate' },
      { type: 'resources', materials: ['study_guides', 'practice_exercises'] },
      { type: 'mentoring', match: 'subject_expert' }
    ],
    deliveryMethods: ['email', 'phone', 'in_person'],
    effectivenessMetrics: ['grade_improvement', 'completion_rate', 'engagement_increase'],
    targetAudience: 'at_risk_students',
    priority: 'high',
    usageCount: 28,
    successRate: 0.85
  },
  {
    id: 'motivational',
    name: 'Motivational Intervention',
    type: 'motivation',
    description: 'Boost student motivation and confidence',
    triggerConditions: { riskLevel: 'medium', factors: ['low_motivation', 'progress_plateau'] },
    actions: [
      { type: 'message', content: 'personalised_encouragement' },
      { type: 'achievement', unlock: 'badges_and_rewards' },
      { type: 'community', connect: 'peer_group' }
    ],
    deliveryMethods: ['in_app', 'email'],
    effectivenessMetrics: ['engagement_increase', 'progress_acceleration'],
    targetAudience: 'all_students',
    priority: 'medium',
    usageCount: 156,
    successRate: 0.68
  }
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');

    let templates = [...DEFAULT_TEMPLATES];

    if (type) {
      templates = templates.filter(t => t.type === type);
    }

    if (priority) {
      templates = templates.filter(t => t.priority === priority);
    }

    return NextResponse.json({
      templates,
      count: templates.length,
      categories: ['engagement', 'academic_support', 'motivation']
    });
  } catch (_error) {
    console.error('Automation Templates API error:', _error);
    return NextResponse.json(
      { error: 'Failed to retrieve templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, description, triggerConditions, actions, deliveryMethods } = body;

    if (!name || !type || !actions) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, actions' },
        { status: 400 }
      );
    }

    const newTemplate = {
      id: `template_${Date.now()}`,
      name,
      type,
      description,
      triggerConditions: triggerConditions || {},
      actions,
      deliveryMethods: deliveryMethods || ['email'],
      effectivenessMetrics: [],
      targetAudience: 'all_students',
      priority: 'medium',
      usageCount: 0,
      successRate: 0,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      template: newTemplate,
      message: 'Template created successfully'
    });
  } catch (_error) {
    console.error('Create template error:', _error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
