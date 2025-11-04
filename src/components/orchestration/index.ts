/**
 * Platform Orchestration Layer - UI Components
 *
 * This module exports all 7 production-ready React components for the Platform Orchestration Layer.
 * These components provide the user interface for EdPsych Connect World's intelligent automation system.
 *
 * @module components/orchestration
 * @version 1.0.0
 * @author Dr. Scott Ighavongbe-Patrick
 */

// Core orchestration components
export { StudentProfileCard } from './StudentProfileCard';
export type { StudentProfileCardProps } from './StudentProfileCard';

export { VoiceCommandInterface } from './VoiceCommandInterface';
export type { VoiceCommandInterfaceProps } from './VoiceCommandInterface';

export { TeacherClassDashboard } from './TeacherClassDashboard';
export type { TeacherClassDashboardProps } from './TeacherClassDashboard';

export { LessonDifferentiationView } from './LessonDifferentiationView';
export type { LessonDifferentiationViewProps } from './LessonDifferentiationView';

export { ParentPortal } from './ParentPortal';
export type { ParentPortalProps } from './ParentPortal';

export { MultiAgencyView } from './MultiAgencyView';
export type { MultiAgencyViewProps } from './MultiAgencyView';

export { AutomatedActionsLog } from './AutomatedActionsLog';
export type { AutomatedActionsLogProps } from './AutomatedActionsLog';

/**
 * Usage Examples:
 *
 * @example Teacher Dashboard
 * ```tsx
 * import { TeacherClassDashboard } from '@/components/orchestration';
 *
 * export default function TeacherDashboardPage() {
 *   return <TeacherClassDashboard classId={5} teacherId={12} />;
 * }
 * ```
 *
 * @example Parent Portal
 * ```tsx
 * import { ParentPortal } from '@/components/orchestration';
 *
 * export default function ParentPortalPage({ params }: { params: { childId: string } }) {
 *   const session = useSession();
 *   return <ParentPortal childId={Number(params.childId)} parentId={session.user.id} />;
 * }
 * ```
 *
 * @example EP Multi-Agency View
 * ```tsx
 * import { MultiAgencyView } from '@/components/orchestration';
 *
 * export default function EPDashboardPage() {
 *   const session = useSession();
 *   return <MultiAgencyView userId={session.user.id} userRole="EP" />;
 * }
 * ```
 *
 * @example Voice Command Integration
 * ```tsx
 * import { VoiceCommandInterface } from '@/components/orchestration';
 *
 * export default function VoiceAssistant() {
 *   return (
 *     <VoiceCommandInterface
 *       classId={5}
 *       contextType="dashboard"
 *       onCommandExecuted={(result) => console.log('Command executed:', result)}
 *     />
 *   );
 * }
 * ```
 */
