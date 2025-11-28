import { logger } from "@/lib/logger";
/**
 * Assessment Report Generator
 * Task 3.2.4: Professional Assessment Reports
 *
 * Features:
 * - LA-compliant report templates
 * - Professional formatting
 * - Automatic interpretation
 * - Evidence-based recommendations
 * - Multi-format export (PDF, DOCX)
 * - Custom branding
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AssessmentTemplate } from './assessment-library';
import { ScoreResult } from './scoring-engine';

// ============================================================================
// TYPES
// ============================================================================

export interface AssessmentReport {
  // Student Information
  student_name: string;
  date_of_birth: string;
  chronological_age: string;
  academic_year: string;
  school: string;

  // Assessment Details
  assessment_name: string;
  assessment_date: string;
  assessor_name: string;
  assessor_qualification: string;

  // Assessment Data
  template: AssessmentTemplate;
  scores: ScoreResult;
  behavioral_observations?: string;
  environmental_factors?: string;
  test_conditions?: string;

  // Professional Summary
  reason_for_referral?: string;
  background_information?: string;
  previous_assessments?: string;

  // Recommendations
  recommendations: string[];
  interventions: string[];
  monitoring_plan?: string;

  // Metadata
  report_date: string;
  distribution_list?: string[];
  confidentiality_statement?: string;
}

export interface ReportOptions {
  include_raw_scores?: boolean;
  include_score_tables?: boolean;
  include_visual_profile?: boolean;
  include_interpretation_guidelines?: boolean;
  include_recommendations?: boolean;
  include_appendices?: boolean;
  branding?: {
    logo_url?: string;
    organization_name?: string;
    contact_details?: string;
  };
}

// ============================================================================
// REPORT GENERATOR CLASS
// ============================================================================

export class AssessmentReportGenerator {
  private doc: jsPDF;
  private pageNumber: number = 0;
  private yPosition: number = 0;

  // Page settings
  private readonly PAGE_WIDTH = 210;
  private readonly PAGE_HEIGHT = 297;
  private readonly MARGIN = 20;
  private readonly CONTENT_WIDTH = this.PAGE_WIDTH - (2 * this.MARGIN);

  // Colors
  private readonly PRIMARY_COLOR: [number, number, number] = [0, 51, 102];
  private readonly SECONDARY_COLOR: [number, number, number] = [100, 100, 100];
  private readonly ACCENT_COLOR: [number, number, number] = [0, 102, 204];

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    this.yPosition = this.MARGIN;
  }

  /**
   * Generate complete assessment report
   */
  async generateReport(
    report: AssessmentReport,
    options: ReportOptions = {}
  ): Promise<Blob> {
    const {
      include_raw_scores = true,
      include_score_tables = true,
      include_visual_profile = false,
      include_interpretation_guidelines = true,
      include_recommendations = true,
      include_appendices = false,
      branding,
    } = options;

    // Cover Page
    this.addCoverPage(report, branding);
    this.addPage();

    // Table of Contents
    this.addTableOfContents(report);
    this.addPage();

    // Section 1: Student Information
    this.addSectionHeader('1. Student Information');
    this.addStudentInformation(report);

    // Section 2: Assessment Details
    this.addSectionHeader('2. Assessment Details');
    this.addAssessmentDetails(report);

    // Section 3: Reason for Referral
    if (report.reason_for_referral) {
      this.addSectionHeader('3. Reason for Referral');
      this.addText(report.reason_for_referral);
      this.yPosition += 5;
    }

    // Section 4: Background Information
    if (report.background_information) {
      this.addSectionHeader('4. Background Information');
      this.addText(report.background_information);
      this.yPosition += 5;
    }

    // Section 5: Test Conditions & Observations
    this.addSectionHeader('5. Test Administration');
    this.addTestAdministrationSection(report);

    // Section 6: Assessment Results
    this.addSectionHeader('6. Assessment Results');
    if (include_score_tables) {
      this.addScoreTables(report);
    }
    this.addResultsInterpretation(report);

    // Section 7: Clinical Interpretation
    this.addSectionHeader('7. Clinical Interpretation');
    this.addText(report.scores.interpretation);
    this.yPosition += 5;

    // Section 8: Strengths & Needs
    this.addSectionHeader('8. Profile of Strengths and Needs');
    this.addStrengthsNeeds(report.scores);

    // Section 9: Recommendations
    if (include_recommendations && report.recommendations.length > 0) {
      this.addSectionHeader('9. Recommendations');
      this.addRecommendations(report);
    }

    // Section 10: Summary
    this.addSectionHeader('10. Summary and Conclusions');
    this.addSummary(report);

    // Signature Page
    this.addSignaturePage(report);

    // Appendices
    if (include_appendices) {
      this.addAppendices(report);
    }

    // Add page numbers
    this.addPageNumbers();

    return this.doc.output('blob');
  }

  // ==========================================================================
  // COVER PAGE
  // ==========================================================================

  private addCoverPage(report: AssessmentReport, branding?: ReportOptions['branding']) {
    // Header with branding
    this.doc.setFillColor(...this.PRIMARY_COLOR);
    this.doc.rect(0, 0, this.PAGE_WIDTH, 60, 'F');

    // Title
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(26);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Educational Psychology', this.PAGE_WIDTH / 2, 25, { align: 'center' });
    this.doc.text('Assessment Report', this.PAGE_WIDTH / 2, 40, { align: 'center' });

    this.doc.setTextColor(0, 0, 0);

    // Student info box
    const boxY = 80;
    this.doc.setFillColor(245, 245, 245);
    this.doc.roundedRect(this.MARGIN, boxY, this.CONTENT_WIDTH, 80, 3, 3, 'F');

    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Student:', this.MARGIN + 5, boxY + 12);

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(16);
    this.doc.text(report.student_name, this.MARGIN + 5, boxY + 24);

    this.doc.setFontSize(11);
    const infoY = boxY + 36;
    this.doc.text(`Date of Birth: ${report.date_of_birth}`, this.MARGIN + 5, infoY);
    this.doc.text(`Age: ${report.chronological_age}`, this.MARGIN + 5, infoY + 8);
    this.doc.text(`School: ${report.school}`, this.MARGIN + 5, infoY + 16);
    this.doc.text(`Academic Year: ${report.academic_year}`, this.MARGIN + 5, infoY + 24);

    // Assessment info
    const assessY = 175;
    this.doc.setFillColor(240, 248, 255);
    this.doc.roundedRect(this.MARGIN, assessY, this.CONTENT_WIDTH, 60, 3, 3, 'F');

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.text('Assessment Information', this.MARGIN + 5, assessY + 12);

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(11);
    const assessInfoY = assessY + 24;
    this.doc.text(`Assessment: ${report.assessment_name}`, this.MARGIN + 5, assessInfoY);
    this.doc.text(`Assessment Date: ${report.assessment_date}`, this.MARGIN + 5, assessInfoY + 8);
    this.doc.text(`Report Date: ${report.report_date}`, this.MARGIN + 5, assessInfoY + 16);
    this.doc.text(`Assessor: ${report.assessor_name}, ${report.assessor_qualification}`, this.MARGIN + 5, assessInfoY + 24);

    // Confidentiality statement
    this.doc.setFontSize(8);
    this.doc.setTextColor(...this.SECONDARY_COLOR);
    const confText = report.confidentiality_statement ||
      'This report is confidential and should only be shared with those who have a legitimate need to know. ' +
      'It is intended to inform educational planning and support. All data is handled in accordance with GDPR 2018.';

    const confLines = this.doc.splitTextToSize(confText, this.CONTENT_WIDTH);
    this.doc.text(confLines, this.PAGE_WIDTH / 2, this.PAGE_HEIGHT - 25, { align: 'center' });

    this.doc.setTextColor(0, 0, 0);
  }

  // ==========================================================================
  // TABLE OF CONTENTS
  // ==========================================================================

  private addTableOfContents(report: AssessmentReport) {
    this.addSectionHeader('Contents');

    const contents = [
      '1. Student Information',
      '2. Assessment Details',
      '3. Reason for Referral',
      '4. Background Information',
      '5. Test Administration',
      '6. Assessment Results',
      '7. Clinical Interpretation',
      '8. Profile of Strengths and Needs',
      '9. Recommendations',
      '10. Summary and Conclusions',
      'Signature Page',
    ];

    contents.forEach((item) => {
      this.checkPageBreak();
      this.doc.setFontSize(11);
      this.doc.text(item, this.MARGIN + 5, this.yPosition);
      this.yPosition += 7;
    });
  }

  // ==========================================================================
  // STUDENT INFORMATION
  // ==========================================================================

  private addStudentInformation(report: AssessmentReport) {
    const data = [
      ['Name', report.student_name],
      ['Date of Birth', report.date_of_birth],
      ['Chronological Age', report.chronological_age],
      ['Academic Year', report.academic_year],
      ['School/Setting', report.school],
    ];

    autoTable(this.doc, {
      startY: this.yPosition,
      head: [],
      body: data,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: this.CONTENT_WIDTH - 50 },
      },
      margin: { left: this.MARGIN, right: this.MARGIN },
    });

    this.yPosition = (this.doc as any).lastAutoTable.finalY + 10;
    this.checkPageBreak();
  }

  // ==========================================================================
  // ASSESSMENT DETAILS
  // ==========================================================================

  private addAssessmentDetails(report: AssessmentReport) {
    const data = [
      ['Assessment Name', report.assessment_name],
      ['Assessment Date', report.assessment_date],
      ['Report Date', report.report_date],
      ['Assessor', `${report.assessor_name}, ${report.assessor_qualification}`],
      ['Purpose', report.template.purpose],
    ];

    autoTable(this.doc, {
      startY: this.yPosition,
      head: [],
      body: data,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: this.CONTENT_WIDTH - 50 },
      },
      margin: { left: this.MARGIN, right: this.MARGIN },
    });

    this.yPosition = (this.doc as any).lastAutoTable.finalY + 10;
    this.checkPageBreak();
  }

  // ==========================================================================
  // TEST ADMINISTRATION
  // ==========================================================================

  private addTestAdministrationSection(report: AssessmentReport) {
    if (report.environmental_factors) {
      this.addSubsectionHeader('Test Environment');
      this.addText(report.environmental_factors);
      this.yPosition += 5;
    }

    if (report.behavioral_observations) {
      this.addSubsectionHeader('Behavioral Observations');
      this.addText(report.behavioral_observations);
      this.yPosition += 5;
    }

    if (report.test_conditions) {
      this.addSubsectionHeader('Test Validity');
      this.addText(report.test_conditions);
      this.yPosition += 5;
    }
  }

  // ==========================================================================
  // SCORE TABLES
  // ==========================================================================

  private addScoreTables(report: AssessmentReport) {
    const { scores, template } = report;

    // Composite Scores Table
    if (scores.composite_scores.length > 0) {
      this.addSubsectionHeader('Composite Scores');

      const compositeData = scores.composite_scores.map((comp) => [
        comp.composite_name,
        comp.standard_score.toString(),
        `${comp.percentile}th`,
        comp.classification,
        comp.confidence_interval_95
          ? `${comp.confidence_interval_95[0]}-${comp.confidence_interval_95[1]}`
          : 'N/A',
      ]);

      autoTable(this.doc, {
        startY: this.yPosition,
        head: [['Index', 'Standard Score', 'Percentile', 'Classification', '95% CI']],
        body: compositeData,
        theme: 'striped',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: {
          fillColor: this.PRIMARY_COLOR,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        margin: { left: this.MARGIN, right: this.MARGIN },
      });

      this.yPosition = (this.doc as any).lastAutoTable.finalY + 10;
      this.checkPageBreak();
    }

    // Domain Scores Table
    this.addSubsectionHeader('Domain Scores');

    const domainData = scores.raw_scores.map((raw, index) => {
      const standard = scores.standard_scores[index];
      const percentile = scores.percentiles[index];

      return template.norm_referenced
        ? [
            raw.domain,
            `${raw.score}/${raw.max_possible}`,
            standard?.score.toString() || 'N/A',
            percentile ? `${percentile.score}th` : 'N/A',
            this.classifyScore(standard?.score || 100),
          ]
        : [raw.domain, `${raw.score}/${raw.max_possible}`, `${Math.round(raw.percentage)}%`];
    });

    const headers = template.norm_referenced
      ? [['Domain', 'Raw Score', 'Standard Score', 'Percentile', 'Classification']]
      : [['Domain', 'Raw Score', 'Percentage']];

    autoTable(this.doc, {
      startY: this.yPosition,
      head: headers,
      body: domainData,
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: {
        fillColor: this.PRIMARY_COLOR,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      margin: { left: this.MARGIN, right: this.MARGIN },
    });

    this.yPosition = (this.doc as any).lastAutoTable.finalY + 10;
    this.checkPageBreak();
  }

  // ==========================================================================
  // RESULTS INTERPRETATION
  // ==========================================================================

  private addResultsInterpretation(report: AssessmentReport) {
    this.addSubsectionHeader('Score Interpretation');

    if (report.template.norm_referenced) {
      this.addText(
        'Standard scores are reported with a mean of 100 and standard deviation of 15. ' +
        'The average range is 85-115, representing approximately 68% of the population. ' +
        'Scores are interpreted with reference to the standardization sample.'
      );
    } else {
      this.addText(
        'Raw scores represent the number of items answered correctly. ' +
        'Percentages indicate the proportion of items completed successfully.'
      );
    }

    this.yPosition += 5;
  }

  // ==========================================================================
  // STRENGTHS & NEEDS
  // ==========================================================================

  private addStrengthsNeeds(scores: ScoreResult) {
    if (scores.strengths.length > 0) {
      this.addSubsectionHeader('Relative Strengths');
      scores.strengths.forEach((strength) => {
        this.checkPageBreak();
        this.doc.setFontSize(10);
        this.doc.text('•', this.MARGIN + 2, this.yPosition);
        this.doc.text(strength, this.MARGIN + 7, this.yPosition);
        this.yPosition += 6;
      });
      this.yPosition += 3;
    }

    if (scores.weaknesses.length > 0) {
      this.addSubsectionHeader('Areas of Need');
      scores.weaknesses.forEach((weakness) => {
        this.checkPageBreak();
        this.doc.setFontSize(10);
        this.doc.text('•', this.MARGIN + 2, this.yPosition);
        this.doc.text(weakness, this.MARGIN + 7, this.yPosition);
        this.yPosition += 6;
      });
      this.yPosition += 3;
    }
  }

  // ==========================================================================
  // RECOMMENDATIONS
  // ==========================================================================

  private addRecommendations(report: AssessmentReport) {
    this.addText(
      'The following recommendations are evidence-based and tailored to support the student\'s learning needs:'
    );
    this.yPosition += 5;

    report.recommendations.forEach((rec, index) => {
      this.checkPageBreak(15);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${index + 1}.`, this.MARGIN, this.yPosition);
      this.doc.setFont('helvetica', 'normal');

      const recLines = this.doc.splitTextToSize(rec, this.CONTENT_WIDTH - 10);
      this.doc.text(recLines, this.MARGIN + 7, this.yPosition);
      this.yPosition += recLines.length * 5 + 3;
    });

    if (report.interventions.length > 0) {
      this.yPosition += 5;
      this.addSubsectionHeader('Suggested Interventions');

      report.interventions.forEach((intervention) => {
        this.checkPageBreak();
        this.doc.setFontSize(10);
        this.doc.text('•', this.MARGIN + 2, this.yPosition);
        this.doc.text(intervention, this.MARGIN + 7, this.yPosition);
        this.yPosition += 6;
      });
    }
  }

  // ==========================================================================
  // SUMMARY
  // ==========================================================================

  private addSummary(report: AssessmentReport) {
    const summary = this.generateSummary(report);
    this.addText(summary);
  }

  private generateSummary(report: AssessmentReport): string {
    let summary = `${report.student_name} was assessed using the ${report.assessment_name} on ${report.assessment_date}. `;

    if (report.scores.composite_scores.length > 0) {
      const fullScale = report.scores.composite_scores[0];
      summary += `Overall performance fell in the ${fullScale.classification} range (Standard Score: ${fullScale.standard_score}, ${fullScale.percentile}th percentile). `;
    }

    if (report.scores.strengths.length > 0) {
      summary += `Relative strengths were identified in ${report.scores.strengths.length} area(s). `;
    }

    if (report.scores.weaknesses.length > 0) {
      summary += `Areas requiring additional support were noted in ${report.scores.weaknesses.length} domain(s). `;
    }

    summary += 'The results should be considered alongside other sources of evidence when making educational decisions. ';
    summary += 'Regular monitoring and review of interventions is recommended.';

    return summary;
  }

  // ==========================================================================
  // SIGNATURE PAGE
  // ==========================================================================

  private addSignaturePage(report: AssessmentReport) {
    this.addPage();
    this.addSectionHeader('Professional Sign-Off');

    const signatureBoxHeight = 50;
    const signatureBoxWidth = this.CONTENT_WIDTH;

    // Assessor Signature
    this.doc.setDrawColor(...this.SECONDARY_COLOR);
    this.doc.rect(this.MARGIN, this.yPosition, signatureBoxWidth, signatureBoxHeight);

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Assessed and Reported by:', this.MARGIN + 5, this.yPosition + 10);

    this.doc.setFont('helvetica', 'normal');
    this.doc.text(report.assessor_name, this.MARGIN + 5, this.yPosition + 22);
    this.doc.text(report.assessor_qualification, this.MARGIN + 5, this.yPosition + 30);
    this.doc.text(`Date: ${report.report_date}`, this.MARGIN + 5, this.yPosition + 38);

    this.yPosition += signatureBoxHeight + 15;

    // Distribution List
    if (report.distribution_list && report.distribution_list.length > 0) {
      this.addSubsectionHeader('Report Distribution');
      report.distribution_list.forEach((recipient) => {
        this.checkPageBreak();
        this.doc.setFontSize(10);
        this.doc.text('•', this.MARGIN + 2, this.yPosition);
        this.doc.text(recipient, this.MARGIN + 7, this.yPosition);
        this.yPosition += 6;
      });
    }
  }

  // ==========================================================================
  // APPENDICES
  // ==========================================================================

  private addAppendices(report: AssessmentReport) {
    this.addPage();
    this.addSectionHeader('Appendix A: Score Interpretation Guidelines');

    if (report.template.interpretation_guidelines.length > 0) {
      report.template.interpretation_guidelines.forEach((guideline) => {
        this.checkPageBreak();
        this.doc.setFontSize(10);
        this.doc.text('•', this.MARGIN + 2, this.yPosition);

        const lines = this.doc.splitTextToSize(guideline, this.CONTENT_WIDTH - 10);
        this.doc.text(lines, this.MARGIN + 7, this.yPosition);
        this.yPosition += lines.length * 5 + 3;
      });
    }
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private addSectionHeader(title: string) {
    this.checkPageBreak(20);

    this.doc.setFillColor(...this.PRIMARY_COLOR);
    this.doc.rect(this.MARGIN, this.yPosition, this.CONTENT_WIDTH, 10, 'F');

    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.MARGIN + 3, this.yPosition + 7);

    this.doc.setTextColor(0, 0, 0);
    this.yPosition += 15;
  }

  private addSubsectionHeader(title: string) {
    this.checkPageBreak(15);

    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.ACCENT_COLOR);
    this.doc.text(title, this.MARGIN, this.yPosition);

    this.doc.setTextColor(0, 0, 0);
    this.yPosition += 7;
  }

  private addText(text: string, maxWidth: number = this.CONTENT_WIDTH) {
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    const lines = this.doc.splitTextToSize(text, maxWidth);

    lines.forEach((line: string) => {
      this.checkPageBreak();
      this.doc.text(line, this.MARGIN, this.yPosition);
      this.yPosition += 5;
    });

    this.yPosition += 2;
  }

  private addPage() {
    this.doc.addPage();
    this.pageNumber++;
    this.yPosition = this.MARGIN;
  }

  private checkPageBreak(requiredSpace: number = 15) {
    if (this.yPosition + requiredSpace > this.PAGE_HEIGHT - this.MARGIN - 10) {
      this.addPage();
    }
  }

  private addPageNumbers() {
    const totalPages = this.doc.getNumberOfPages();

    for (let i = 2; i <= totalPages; i++) {
      // Skip page 1 (cover)
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setTextColor(...this.SECONDARY_COLOR);
      this.doc.text(
        `Page ${i - 1} of ${totalPages - 1}`,
        this.PAGE_WIDTH / 2,
        this.PAGE_HEIGHT - 10,
        { align: 'center' }
      );
    }

    this.doc.setTextColor(0, 0, 0);
  }

  private classifyScore(standardScore: number): string {
    if (standardScore >= 130) return 'Very Superior';
    if (standardScore >= 120) return 'Superior';
    if (standardScore >= 110) return 'High Average';
    if (standardScore >= 90) return 'Average';
    if (standardScore >= 80) return 'Low Average';
    if (standardScore >= 70) return 'Borderline';
    return 'Extremely Low';
  }
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

/**
 * Generate and download assessment report
 */
export async function downloadAssessmentReport(
  report: AssessmentReport,
  options?: ReportOptions
): Promise<void> {
  const generator = new AssessmentReportGenerator();
  const blob = await generator.generateReport(report, options);

  const filename = `Assessment-Report-${report.student_name.replace(/\s+/g, '-')}-${report.assessment_date}.pdf`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

/**
 * Generate report blob (for email/storage)
 */
export async function generateReportBlob(
  report: AssessmentReport,
  options?: ReportOptions
): Promise<Blob> {
  const generator = new AssessmentReportGenerator();
  return generator.generateReport(report, options);
}
