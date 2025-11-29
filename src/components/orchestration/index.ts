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
// Note: StudentProfileCardProps not exported from source file

export { VoiceCommandInterface } from './VoiceCommandInterface';
// Note: VoiceCommandInterfaceProps not exported from source file

export { TeacherClassDashboard } from './TeacherClassDashboard';
// Note: TeacherClassDashboardProps not exported from source file

export { LessonDifferentiationView } from './LessonDifferentiationView';
// Note: LessonDifferentiationViewProps not exported from source file

export { ParentPortal } from './ParentPortal';
// Note: ParentPortalProps not exported from source file

export { MultiAgencyView } from './MultiAgencyView';
// Note: MultiAgencyViewProps not exported from source file

export { AutomatedActionsLog } from './AutomatedActionsLog';
// Note: AutomatedActionsLogProps not exported from source file

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
 *       onCommandExecuted={(result) => logger.debug('Command executed:', result)}
 *     />
 *   );
 * }
 * ```
 */
