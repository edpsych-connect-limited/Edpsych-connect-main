/**
 * LA Request Triage & Decision Workflow Service
 * 
 * Implements the 6-week statutory decision process:
 * - Week 0: Request received from school/parent
 * - Weeks 1-4: Initial review (quality check, adequacy of evidence)
 * - Week 5: Case discussion / panel meeting
 * - Week 6: Decision made (Assess or Refuse) + letter issued
 * 
 * SEND Code of Practice 2015: Section 9.14-9.16
 * "The LA must decide whether to conduct an EHC needs assessment
 * within six weeks of receiving a request."
 * 
 * Decision Criteria (Section 9.14):
 * - Whether child has or may have SEN
 * - Whether it may be necessary for special educational provision 
 *   to be made via an EHC plan
 * - Evidence of Graduated Approach (SEN Support)
 * 
 * @author EdPsych Connect Limited
 */

import { logger } from '@/lib/logger';
import { AdviceCoordinationService } from './advice-coordination-service';
import { AIOrchestrator } from '@/lib/ai/ai-orchestrator.service';

export type TriageStatus = 
  | 'PENDING_REVIEW'
  | 'INITIAL_REVIEW'
  | 'QUALITY_CHECK_FAILED'
  | 'AWAITING_PANEL'
  | 'PANEL_SCHEDULED'
  | 'DECISION_MADE';

export type DecisionOutcome =
  | 'ASSESS'
  | 'REFUSE_INSUFFICIENT_EVIDENCE'
  | 'REFUSE_NEEDS_MET_SEN_SUPPORT'
  | 'REFUSE_NOT_SEN'
  | 'DEFER_PENDING_INFORMATION';

export interface QualityCheckResult {
  passed: boolean;
  issues: QualityIssue[];
  recommendations: string[];
}

export interface QualityIssue {
  field: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  description: string;
  resolution: string;
}

export interface TriageDecision {
  ehcpApplicationId: number;
  decisionDate: Date;
  outcome: DecisionOutcome;
  reasoning: string;
  decisionMakers: string[];
  panelMinutesUrl?: string;
  letterSentDate?: Date;
  nextSteps: string[];
}

export interface GraduatedResponseCheck {
  adequateAssessment: boolean; // Has child been assessed?
  adequatePlanning: boolean;    // Have targets been set?
  adequateProvision: boolean;   // Has intervention been delivered?
  adequateReview: boolean;      // Has progress been reviewed?
  duration: number;             // How many months of SEN Support?
  cyclesCompleted: number;      // How many Assess-Plan-Do-Review cycles?
  overallAdequacy: 'ADEQUATE' | 'INSUFFICIENT' | 'NONE';
  evidence: string[];
  aiAnalysis?: string; // AI generated analysis of the evidence
}

export class TriageDecisionService {
  private laTenantId: number;

  constructor(laTenantId: number) {
    this.laTenantId = laTenantId;
  }

  /**
   * Run quality check on application
   * Validates that the application contains sufficient evidence
   */
  async runQualityCheck(ehcpApplicationId: number): Promise<QualityCheckResult> {
    logger.info(`[Triage] Running quality check for application ${ehcpApplicationId}`);

    // AI INTEGRATION: The "Brain" performs the validation
    const aiOrchestrator = AIOrchestrator.getInstance();

    // Mock Data to simulate Database Fetch
    // In production, fetch this from Prisma using ehcpApplicationId
    const mockApplicationData = {
        hasParentalConsent: true,
        hasSafeguardingConcerns: false,
        evidence: {
            hasMedicalReport: false, // Intentionally false to trigger AI recommendation
            hasSchoolReport: true,
            hasChildDetails: true,
            hasSENSupportEvidence: true,
            hasProfessionalReports: false,
            hasParentalViews: true,
            hasSpecificOutcomes: false
        }
    };

    const aiResult = await aiOrchestrator.performTriageQualityCheck(ehcpApplicationId, mockApplicationData);

    const mappedIssues: QualityIssue[] = aiResult.issues.map(i => ({
        field: i.field,
        severity: (i.severity === 'AMBER' ? 'MAJOR' : i.severity) as 'CRITICAL' | 'MAJOR' | 'MINOR',
        description: i.description,
        resolution: i.resolution
    }));

    return {
        passed: aiResult.passed,
        issues: mappedIssues,
        recommendations: aiResult.recommendations
    };
  }

  /**
   * Check adequacy of graduated response (SEN Support)
   * Section 6.15-6.48 SEND Code of Practice
   */
  async checkGraduatedResponse(ehcpApplicationId: number): Promise<GraduatedResponseCheck> {
    logger.info(`[Triage] Checking graduated response for application ${ehcpApplicationId}`);

    // In production, would analyze intervention records from database
    // Mock implementation based on "adequate SEN Support" criteria

    const mockCheck: GraduatedResponseCheck = {
      adequateAssessment: true,   // Has child been properly assessed?
      adequatePlanning: true,      // Have SMART targets been set?
      adequateProvision: true,     // Has intervention been delivered consistently?
      adequateReview: true,        // Has progress been reviewed regularly?
      duration: 14,                // 14 months of SEN Support
      cyclesCompleted: 3,          // 3 full cycles (termly reviews)
      overallAdequacy: 'ADEQUATE',
      evidence: [
        'Reading Recovery intervention (Sep 2024 - Dec 2024): 60 sessions, limited progress',
        'ELSA support (Jan 2025 - Apr 2025): 10 sessions, some improvement in self-regulation',
        'Speech & Language therapy block (May 2025 - Jul 2025): 6 sessions, minimal progress',
        'SEN Support Plan reviewed termly with parents and SENCo',
        'Data shows persistent gap despite Quality First Teaching plus interventions'
      ]
    };

    if (mockCheck.duration < 6) {
      mockCheck.overallAdequacy = 'INSUFFICIENT';
      mockCheck.evidence.push(' Less than 6 months of SEN Support - may need more time');
    }

    if (mockCheck.cyclesCompleted < 2) {
      mockCheck.overallAdequacy = 'INSUFFICIENT';
      mockCheck.evidence.push(' Fewer than 2 Assess-Plan-Do-Review cycles completed');
    }

    return mockCheck;
  }

  /**
   * Make triage decision
   * Called after quality check and graduated response check
   */
  async makeDecision(
    ehcpApplicationId: number,
    outcome: DecisionOutcome,
    reasoning: string,
    decisionMakers: string[]
  ): Promise<TriageDecision> {
    logger.info(`[Triage] Recording decision for application ${ehcpApplicationId}: ${outcome}`);

    const decision: TriageDecision = {
      ehcpApplicationId,
      decisionDate: new Date(),
      outcome,
      reasoning,
      decisionMakers,
      letterSentDate: new Date(), // Would send letter async
      nextSteps: this.generateNextSteps(outcome)
    };

    // If decision is ASSESS, initialize advice coordination
    if (outcome === 'ASSESS') {
      const adviceService = new AdviceCoordinationService(this.laTenantId);
      await adviceService.initializeAdviceRequests(ehcpApplicationId, 'SLCN');
      logger.info(`[Triage] Advice coordination initialized for application ${ehcpApplicationId}`);
    }

    // In production:
    // - Update EHCPApplication status to ASSESSMENT_APPROVED or REFUSED
    // - Generate and send decision letter (S9.16 letter templates)
    // - Notify school and parents via email
    // - Create ComplianceAlert if decision is late (>6 weeks)
    // - Add to LADashboard metrics

    return decision;
  }

  private generateNextSteps(outcome: DecisionOutcome): string[] {
    switch (outcome) {
      case 'ASSESS':
        return [
          'Advice requests sent to relevant professionals',
          'Educational Psychologist will contact school within 2 weeks',
          'School will be invited to contribute to Section D (Educational needs)',
          'Expected timeline: Draft plan in 16 weeks',
          'Parents have right to request particular school'
        ];
      case 'REFUSE_INSUFFICIENT_EVIDENCE':
        return [
          'Continue with SEN Support for minimum 2 more terms',
          'Ensure Assess-Plan-Do-Review cycles are documented',
          'Gather evidence of interventions and outcomes',
          'Can re-apply when adequate evidence available',
          'Parents have right to appeal to SEND Tribunal within 2 months'
        ];
      case 'REFUSE_NEEDS_MET_SEN_SUPPORT':
        return [
          'Child\'s needs can be met through SEN Support',
          'School to continue with graduated approach',
          'LA will monitor through SEN2 census data',
          'Can re-apply if circumstances change significantly',
          'Parents have right to appeal to SEND Tribunal within 2 months'
        ];
      case 'REFUSE_NOT_SEN':
        return [
          'No evidence of special educational needs',
          'Consider alternative explanations (e.g., attendance, EAL)',
          'School to continue with Quality First Teaching',
          'Parents have right to appeal to SEND Tribunal within 2 months'
        ];
      case 'DEFER_PENDING_INFORMATION':
        return [
          'Decision deferred pending additional information',
          'School to provide requested evidence within 2 weeks',
          'Decision will be made within 6 weeks of receiving complete information',
          'Clock paused until information received'
        ];
      default:
        return [];
    }
  }

  /**
   * Generate decision letter (S9.16 letter)
   * Must include reasons for decision and right of appeal
   */
  async generateDecisionLetter(
    decision: TriageDecision,
    applicationDetails: {
      childName: string;
      parentName: string;
      schoolName: string;
    }
  ): Promise<string> {
    logger.info(`[Triage] Generating decision letter for application ${decision.ehcpApplicationId}`);

    // In production, would use document template service
    // with mail merge and PDF generation

    const letterTemplate = `
Dear ${applicationDetails.parentName},

Re: ${applicationDetails.childName} - EHC Needs Assessment Request

I am writing to inform you of the Local Authority's decision regarding your request 
for an Education, Health and Care (EHC) needs assessment for ${applicationDetails.childName}.

Decision: ${decision.outcome === 'ASSESS' ? 'Proceed with Assessment' : 'Refuse Assessment'}

${decision.reasoning}

Next Steps:
${decision.nextSteps.map(step => `- ${step}`).join('\n')}

Right of Appeal:
If you disagree with this decision, you have the right to appeal to the SEND Tribunal 
within 2 months of the date of this letter.

For independent advice, please contact SENDIASS (SEND Information, Advice and Support Service).

Yours sincerely,
[LA SEND Team]
`;

    return letterTemplate;
  }
}
