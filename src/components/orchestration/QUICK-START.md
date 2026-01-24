# Platform Orchestration Components - Quick Start Guide

## Installation (5 minutes)

### 1. Verify Dependencies

```bash
npm list @tanstack/react-query react-hot-toast lucide-react
```

If missing, install:

```bash
npm install @tanstack/react-query react-hot-toast lucide-react
```

### 2. Setup React Query Provider

```tsx
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 2,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
```

```tsx
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## Usage Examples (Copy-Paste Ready)

### Teacher Dashboard

```tsx
// app/teacher/dashboard/page.tsx
import { TeacherClassDashboard } from '@/components/orchestration';

export default function TeacherDashboard() {
  return <TeacherClassDashboard classId={5} teacherId={12} />;
}
```

### Parent Portal

```tsx
// app/parent/portal/page.tsx
import { ParentPortal } from '@/components/orchestration';

export default function ParentPortalPage() {
  return <ParentPortal childId={42} parentId={123} />;
}
```

### EP Dashboard

```tsx
// app/ep/dashboard/page.tsx
import { MultiAgencyView } from '@/components/orchestration';

export default function EPDashboard() {
  return <MultiAgencyView userId={42} userRole="EP" />;
}
```

### Student Profile Card (Standalone)

```tsx
// Any component
import { StudentProfileCard } from '@/components/orchestration';

export function MyComponent() {
  return (
    <StudentProfileCard
      studentId={42}
      onVoiceQuery={(query) => console.log('Voice:', query)}
      onViewDetails={() => console.log('View details')}
    />
  );
}
```

### Voice Commands (Standalone)

```tsx
// Any component
import { VoiceCommandInterface } from '@/components/orchestration';

export function MyComponent() {
  return (
    <VoiceCommandInterface
      classId={5}
      contextType="dashboard"
      onCommandExecuted={(result) => console.log('Result:', result)}
    />
  );
}
```

### Lesson Differentiation

```tsx
// app/teacher/lessons/[id]/differentiate/page.tsx
import { LessonDifferentiationView } from '@/components/orchestration';

export default function DifferentiatePage({ params }: { params: { id: string } }) {
  return (
    <LessonDifferentiationView
      lessonPlan={{ id: Number(params.id), title: 'Fractions', subject: 'Maths' }}
      classId={5}
      onAssignAll={(assignments) => console.log('Assigned:', assignments)}
    />
  );
}
```

### Automated Actions Log

```tsx
// app/teacher/actions/page.tsx
import { AutomatedActionsLog } from '@/components/orchestration';

export default function ActionsPage() {
  return (
    <AutomatedActionsLog
      classId={5}
      teacherId={12}
      timeRange="today"
    />
  );
}
```

---

## API Endpoints Required

### Mock API Setup (for testing without backend)

Create `app/api/mock/route.ts`:

```typescript
// Mock data for development
export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Mock responses based on path
  if (path.includes('/students/')) {
    return Response.json({
      id: 42,
      name: 'Amara Johnson',
      learningStyle: 'Visual Learner',
      performanceLevel: 'below',
      urgencyLevel: 'needs_support',
      strengths: [
        { description: 'Creative problem-solving', confidence: 85 },
        { description: 'Visual memory', confidence: 89 },
      ],
      struggles: [
        { description: 'Abstract concepts', severity: 70 },
        { description: 'Written expression', severity: 65 },
      ],
      confidenceScore: 78,
      todayLessons: [
        { id: 1, title: 'Fractions (simplified)', subject: 'Maths', status: 'completed' },
        { id: 2, title: 'Reading comprehension', subject: 'English', status: 'in_progress' },
      ],
    });
  }

  return Response.json({ error: 'Not found' }, { status: 404 });
}
```

---

## Troubleshooting

### "Module not found: @tanstack/react-query"

```bash
npm install @tanstack/react-query
```

### Voice commands not working

1. Use Chrome or Edge (best support)
2. Enable microphone permissions
3. Ensure HTTPS (required for Web Speech API)

### Components not rendering

1. Verify React Query provider is wrapping the app
2. Check browser console for errors
3. Verify API endpoints are returning data

### TypeScript errors

Ensure `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "strict": true
  }
}
```

---

## Component Props Reference

### TeacherClassDashboard

```typescript
interface TeacherClassDashboardProps {
  classId: number;
  teacherId: number;
  className?: string;
}
```

### StudentProfileCard

```typescript
interface StudentProfileCardProps {
  studentId: number;
  onVoiceQuery?: (query: string) => void;
  onViewDetails?: () => void;
  compact?: boolean;
  className?: string;
}
```

### VoiceCommandInterface

```typescript
interface VoiceCommandInterfaceProps {
  classId?: number;
  contextType?: 'dashboard' | 'student' | 'lesson';
  onCommandExecuted?: (result: any) => void;
  compact?: boolean;
  initialQuery?: string;
  className?: string;
}
```

### LessonDifferentiationView

```typescript
interface LessonDifferentiationViewProps {
  lessonPlan: { id: number; title: string; subject: string };
  classId: number;
  onAssignAll?: (assignments: Assignment[]) => void;
  onPreview?: (difficulty: 'below' | 'at' | 'above') => void;
  className?: string;
}
```

### ParentPortal

```typescript
interface ParentPortalProps {
  childId: number;
  parentId: number;
  className?: string;
}
```

### MultiAgencyView

```typescript
interface MultiAgencyViewProps {
  userId: number;
  userRole: 'EP' | 'head_teacher' | 'secondary_teacher';
  className?: string;
}
```

### AutomatedActionsLog

```typescript
interface AutomatedActionsLogProps {
  classId?: number;
  teacherId?: number;
  timeRange: 'today' | 'week' | 'month';
  className?: string;
}
```

---

## Next Steps

1. DONE Install dependencies
2. DONE Setup React Query provider
3. DONE Copy-paste usage examples
4. NEXT Implement API endpoints (see README.md for details)
5. NEXT Test in browser
6. NEXT Customize styling (Tailwind classes)

**Full Documentation:** See `README.md` for comprehensive guide
**Implementation Details:** See `PHASE-2-BLOCK-3-IMPLEMENTATION-SUMMARY.md`
