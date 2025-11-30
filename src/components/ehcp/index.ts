/**
 * EHCP Components Index
 * 
 * Comprehensive Local Authority EHCP Management System
 * UK SEND Code of Practice 2015 Compliant
 * 
 * @module ehcp
 */

// Main Dashboard Components
export { default as LADashboard } from './LADashboard';
export { default as ProfessionalContributionPortal } from './ProfessionalContributionPortal';

// Application Management
export { default as ApplicationDetailView } from './ApplicationDetailView';
export { default as SchoolSubmissionInterface } from './SchoolSubmissionInterface';

// EHCP Document Tools
export { default as EHCPMergeTool } from './EHCPMergeTool';

// Type exports for external use
export type {
  // These would be exported from individual component files
  // when they have explicit type exports
};

/**
 * EHCP System Architecture Overview
 * ==================================
 * 
 * This module provides a complete LA EHCP management system following
 * the UK SEND Code of Practice 2015 statutory guidelines.
 * 
 * Key Components:
 * ---------------
 * 
 * 1. LADashboard
 *    - Main LA caseworker/manager dashboard
 *    - Application inbox with search/filter
 *    - Compliance tracking with Week 6/16/20 deadlines
 *    - At-risk applications highlighting
 *    - School-level analytics
 * 
 * 2. ApplicationDetailView
 *    - Individual application management
 *    - Child and application details
 *    - Statutory deadline tracking
 *    - Professional assignments
 *    - Week 6 decision recording
 *    - Timeline/audit trail
 *    - Document management
 * 
 * 3. ProfessionalContributionPortal
 *    - EP, Health, Social Care professional interface
 *    - Assigned case management
 *    - Section-specific contribution forms
 *    - Deadline tracking
 *    - Autosave functionality
 * 
 * 4. EHCPMergeTool
 *    - Combines professional contributions
 *    - Section-by-section editing
 *    - Auto-merge functionality
 *    - Section locking
 *    - PDF export
 *    - Draft preview
 * 
 * 5. SchoolSubmissionInterface
 *    - SENCO application submission
 *    - Multi-step wizard
 *    - Child details collection
 *    - Parent/carer management
 *    - SEN profile and history
 *    - Evidence upload
 *    - Views and aspirations
 *    - Consent and declaration
 * 
 * Statutory Workflow:
 * -------------------
 * 
 * Week 0: School submits EHCP request
 *         ↓
 * Week 1-5: LA reviews request, gathers initial information
 *         ↓
 * Week 6: LA makes decision (agree/refuse assessment)
 *         ↓
 * Week 7-15: Multi-agency assessment
 *            - EP assessment (Section B, E, F)
 *            - Health assessment (Section C, G)
 *            - Social care assessment (Section D, H)
 *            - School input (Section A)
 *         ↓
 * Week 16: Draft EHCP issued to parents
 *         ↓
 * Week 17-19: Consultation period (15 calendar days minimum)
 *         ↓
 * Week 20: Final EHCP issued
 * 
 * API Endpoints:
 * --------------
 * 
 * LA Dashboard:
 * - GET  /api/la/applications         - List all applications
 * - GET  /api/la/applications/[id]    - Get application details
 * - POST /api/la/applications         - Create new application
 * - PUT  /api/la/applications/[id]    - Update application
 * 
 * Professional Assignments:
 * - POST /api/la/applications/[id]/assign   - Assign professional
 * - POST /api/la/applications/[id]/decision - Record decision
 * 
 * Contributions:
 * - GET  /api/la/applications/[id]/contributions  - List contributions
 * - GET  /api/professional/contributions          - Professional's cases
 * - POST /api/professional/contributions/[id]     - Submit contribution
 * 
 * EHCP Document:
 * - GET  /api/la/applications/[id]/ehcp-draft - Get draft content
 * - POST /api/la/applications/[id]/ehcp-draft - Save draft
 * - PUT  /api/la/applications/[id]/ehcp-draft - Finalize draft
 * 
 * Compliance:
 * - GET /api/la/compliance - Get compliance metrics
 * 
 * Pages:
 * ------
 * - /la/dashboard              - LA Dashboard
 * - /la/applications/[id]      - Application Detail/Merge Tool
 * - /professional/portal       - Professional Portal
 * - /school/ehcp-request       - School Submission
 * 
 * User Roles:
 * -----------
 * - LA_CASEWORKER: Day-to-day case management
 * - LA_MANAGER: Oversight, decisions, approvals
 * - LA_ADMIN: Full LA administration
 * - EDUCATIONAL_PSYCHOLOGIST: Section B, E, F contributions
 * - HEALTH_PROFESSIONAL: Section C, G contributions
 * - SOCIAL_WORKER: Section D, H contributions
 * - SCHOOL_SENCO: Application submission, Section A
 * 
 * Data Models:
 * ------------
 * - ehcp_applications: Main application record
 * - ehcp_timeline_events: Audit trail
 * - ehcp_professional_contributions: Section contributions
 */
