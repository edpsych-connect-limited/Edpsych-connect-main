/**
 * FILE: src/lib/reports/report-generator.ts
 * PURPOSE: Professional report generation for Educational Psychologists
 *
 * FEATURES:
 * - EHCP Advice reports
 * - Assessment reports
 * - Intervention review reports
 * - Progress monitoring reports
 * - Annual review contributions
 * - Professional templates
 * - Evidence integration
 * - Citation management
 */

import { jsPDF } from 'jspdf';

export interface ReportData {
  type: 'ehcp_advice' | 'assessment' | 'intervention_review' | 'progress' | 'annual_review';
  student: {
    name: string;
    dob: Date;
    school: string;
    yearGroup: string;
    upn?: string;
  };
  ep: {
    name: string;
    hcpcNumber: string;
    organization: string;
  };
  date: Date;
  sections: ReportSection[];
  recommendations: Recommendation[];
  outcomes?: OutcomeData[];
  evidence?: EvidenceItem[];
}

export interface ReportSection {
  title: string;
  content: string;
  subsections?: { title: string; content: string }[];
}

export interface Recommendation {
  area: string;
  recommendation: string;
  rationale: string;
  responsibility: string;
  timescale: string;
  priority: 'high' | 'medium' | 'low';
}

export interface OutcomeData {
  domain: string;
  baseline: any;
  current: any;
  change: string;
  significance: string;
}

export interface EvidenceItem {
  type: 'research' | 'assessment' | 'observation' | 'collaboration';
  source: string;
  citation?: string;
  relevance: string;
}

export class ReportGenerator {
  private static readonly PAGE_WIDTH = 210; // A4
  private static readonly PAGE_HEIGHT = 297;
  private static readonly MARGIN = 20;

  /**
   * Generate professional EP report
   */
  static async generateReport(data: ReportData): Promise<Buffer> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    let yPos = this.MARGIN;

    // Title page
    yPos = this.addTitlePage(doc, data);

    // Table of contents
    doc.addPage();
    yPos = this.MARGIN;
    yPos = this.addTableOfContents(doc, data, yPos);

    // Executive summary
    doc.addPage();
    yPos = this.MARGIN;
    yPos = this.addExecutiveSummary(doc, data, yPos);

    // Main sections
    for (const section of data.sections) {
      if (yPos > 200) {
        doc.addPage();
        yPos = this.MARGIN;
      }
      yPos = this.addSection(doc, section, yPos);
    }

    // Recommendations
    doc.addPage();
    yPos = this.MARGIN;
    yPos = this.addRecommendations(doc, data, yPos);

    // Outcomes (if included)
    if (data.outcomes && data.outcomes.length > 0) {
      doc.addPage();
      yPos = this.MARGIN;
      yPos = this.addOutcomes(doc, data, yPos);
    }

    // Evidence base
    if (data.evidence && data.evidence.length > 0) {
      doc.addPage();
      yPos = this.MARGIN;
      yPos = this.addEvidenceBase(doc, data, yPos);
    }

    // Professional declaration
    doc.addPage();
    yPos = this.MARGIN;
    yPos = this.addProfessionalDeclaration(doc, data, yPos);

    // Add page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      this.addPageFooter(doc, i, pageCount, data);
    }

    // Convert to buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    return pdfBuffer;
  }

  private static addTitlePage(doc: jsPDF, data: ReportData): number {
    let yPos = 60;

    // Report type
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text(this.getReportTitle(data.type), this.PAGE_WIDTH / 2, yPos, { align: 'center' });
    yPos += 20;

    // Student details
    doc.setFontSize(18);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(data.student.name, this.PAGE_WIDTH / 2, yPos, { align: 'center' });
    yPos += 10;

    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Date of Birth: ${data.student.dob.toLocaleDateString('en-GB')}`,
      this.PAGE_WIDTH / 2,
      yPos,
      { align: 'center' }
    );
    yPos += 8;
    doc.text(`School: ${data.student.school}`, this.PAGE_WIDTH / 2, yPos, { align: 'center' });
    yPos += 8;
    doc.text(`Year Group: ${data.student.yearGroup}`, this.PAGE_WIDTH / 2, yPos, {
      align: 'center',
    });

    // Report date
    yPos += 30;
    doc.setFontSize(12);
    doc.text(
      `Report Date: ${data.date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}`,
      this.PAGE_WIDTH / 2,
      yPos,
      { align: 'center' }
    );

    // EP details
    yPos += 40;
    doc.setFillColor(245, 247, 250);
    doc.rect(this.MARGIN, yPos, this.PAGE_WIDTH - 2 * this.MARGIN, 30, 'F');

    yPos += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('Prepared by:', this.PAGE_WIDTH / 2, yPos, { align: 'center' });
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(data.ep.name, this.PAGE_WIDTH / 2, yPos, { align: 'center' });
    yPos += 6;
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`HCPC Registration: ${data.ep.hcpcNumber}`, this.PAGE_WIDTH / 2, yPos, {
      align: 'center',
    });
    yPos += 5;
    doc.text(data.ep.organization, this.PAGE_WIDTH / 2, yPos, { align: 'center' });

    // Confidentiality notice
    yPos = 270;
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('CONFIDENTIAL - For Professional Use Only', this.PAGE_WIDTH / 2, yPos, {
      align: 'center',
    });

    return yPos;
  }

  private static addTableOfContents(doc: jsPDF, data: ReportData, yPos: number): number {
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('Contents', this.MARGIN, yPos);
    yPos += 15;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);

    const contents = [
      'Executive Summary',
      ...data.sections.map((s) => s.title),
      'Recommendations',
    ];

    if (data.outcomes) contents.push('Outcomes and Impact');
    if (data.evidence) contents.push('Evidence Base');
    contents.push('Professional Declaration');

    contents.forEach((item, index) => {
      doc.text(`${index + 1}. ${item}`, this.MARGIN + 5, yPos);
      yPos += 7;
    });

    return yPos;
  }

  private static addExecutiveSummary(doc: jsPDF, data: ReportData, yPos: number): number {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('Executive Summary', this.MARGIN, yPos);
    yPos += 12;

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(this.MARGIN, yPos, this.PAGE_WIDTH - this.MARGIN, yPos);
    yPos += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);

    const summary = this.generateExecutiveSummary(data);
    const lines = doc.splitTextToSize(summary, this.PAGE_WIDTH - 2 * this.MARGIN);

    lines.forEach((line: string) => {
      if (yPos > this.PAGE_HEIGHT - 30) {
        doc.addPage();
        yPos = this.MARGIN;
      }
      doc.text(line, this.MARGIN, yPos);
      yPos += 6;
    });

    return yPos + 10;
  }

  private static addSection(doc: jsPDF, section: ReportSection, yPos: number): number {
    // Section title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text(section.title, this.MARGIN, yPos);
    yPos += 10;

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(this.MARGIN, yPos, this.PAGE_WIDTH - this.MARGIN, yPos);
    yPos += 8;

    // Section content
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);

    const contentLines = doc.splitTextToSize(section.content, this.PAGE_WIDTH - 2 * this.MARGIN);

    contentLines.forEach((line: string) => {
      if (yPos > this.PAGE_HEIGHT - 30) {
        doc.addPage();
        yPos = this.MARGIN;
      }
      doc.text(line, this.MARGIN, yPos);
      yPos += 6;
    });

    // Subsections
    if (section.subsections) {
      for (const subsection of section.subsections) {
        yPos += 5;

        if (yPos > this.PAGE_HEIGHT - 40) {
          doc.addPage();
          yPos = this.MARGIN;
        }

        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text(subsection.title, this.MARGIN + 5, yPos);
        yPos += 8;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const subLines = doc.splitTextToSize(
          subsection.content,
          this.PAGE_WIDTH - 2 * this.MARGIN - 5
        );

        subLines.forEach((line: string) => {
          if (yPos > this.PAGE_HEIGHT - 30) {
            doc.addPage();
            yPos = this.MARGIN;
          }
          doc.text(line, this.MARGIN + 5, yPos);
          yPos += 6;
        });
      }
    }

    return yPos + 10;
  }

  private static addRecommendations(doc: jsPDF, data: ReportData, yPos: number): number {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('Recommendations', this.MARGIN, yPos);
    yPos += 12;

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(this.MARGIN, yPos, this.PAGE_WIDTH - this.MARGIN, yPos);
    yPos += 10;

    // Sort by priority
    const sorted = [...data.recommendations].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    sorted.forEach((rec, index) => {
      if (yPos > this.PAGE_HEIGHT - 50) {
        doc.addPage();
        yPos = this.MARGIN;
      }

      // Recommendation box
      const boxHeight = 45;
      doc.setFillColor(249, 250, 251);
      doc.rect(this.MARGIN, yPos, this.PAGE_WIDTH - 2 * this.MARGIN, boxHeight, 'F');
      doc.setDrawColor(229, 231, 235);
      doc.rect(this.MARGIN, yPos, this.PAGE_WIDTH - 2 * this.MARGIN, boxHeight, 'S');

      // Priority badge
      const priorityColor = rec.priority === 'high' ? [220, 38, 38] : rec.priority === 'medium' ? [234, 179, 8] : [34, 197, 94];
      doc.setFillColor(...(priorityColor as [number, number, number]));
      doc.roundedRect(this.PAGE_WIDTH - this.MARGIN - 25, yPos + 3, 20, 6, 2, 2, 'F');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text(rec.priority.toUpperCase(), this.PAGE_WIDTH - this.MARGIN - 15, yPos + 7, {
        align: 'center',
      });

      // Area
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 138);
      doc.text(`${index + 1}. ${rec.area}`, this.MARGIN + 3, yPos + 8);

      // Recommendation
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      const recLines = doc.splitTextToSize(rec.recommendation, this.PAGE_WIDTH - 2 * this.MARGIN - 10);
      doc.text(recLines.slice(0, 2), this.MARGIN + 3, yPos + 15);

      // Details
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Responsibility: ${rec.responsibility} | Timescale: ${rec.timescale}`, this.MARGIN + 3, yPos + 40);

      yPos += boxHeight + 5;
    });

    return yPos;
  }

  private static addOutcomes(doc: jsPDF, data: ReportData, yPos: number): number {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('Outcomes and Impact', this.MARGIN, yPos);
    yPos += 12;

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(this.MARGIN, yPos, this.PAGE_WIDTH - this.MARGIN, yPos);
    yPos += 10;

    data.outcomes!.forEach((outcome) => {
      if (yPos > this.PAGE_HEIGHT - 40) {
        doc.addPage();
        yPos = this.MARGIN;
      }

      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 138);
      doc.text(outcome.domain, this.MARGIN, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(`Baseline: ${JSON.stringify(outcome.baseline)}`, this.MARGIN + 5, yPos);
      yPos += 6;
      doc.text(`Current: ${JSON.stringify(outcome.current)}`, this.MARGIN + 5, yPos);
      yPos += 6;
      doc.text(`Change: ${outcome.change}`, this.MARGIN + 5, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'bold');
      doc.text(`Significance: ${outcome.significance}`, this.MARGIN + 5, yPos);
      yPos += 10;
    });

    return yPos;
  }

  private static addEvidenceBase(doc: jsPDF, data: ReportData, yPos: number): number {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('Evidence Base', this.MARGIN, yPos);
    yPos += 12;

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(this.MARGIN, yPos, this.PAGE_WIDTH - this.MARGIN, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);

    data.evidence!.forEach((item, index) => {
      if (yPos > this.PAGE_HEIGHT - 30) {
        doc.addPage();
        yPos = this.MARGIN;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(`[${index + 1}] ${item.source}`, this.MARGIN, yPos);
      yPos += 6;

      if (item.citation) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.text(item.citation, this.MARGIN + 5, yPos);
        yPos += 5;
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const relevanceLines = doc.splitTextToSize(item.relevance, this.PAGE_WIDTH - 2 * this.MARGIN - 5);
      doc.text(relevanceLines, this.MARGIN + 5, yPos);
      yPos += relevanceLines.length * 5 + 5;
    });

    return yPos;
  }

  private static addProfessionalDeclaration(doc: jsPDF, data: ReportData, yPos: number): number {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('Professional Declaration', this.MARGIN, yPos);
    yPos += 12;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);

    const declaration = [
      'I confirm that this report has been prepared in accordance with the standards set by',
      'the Health and Care Professions Council (HCPC) and represents my professional',
      'opinion based on the assessment, observations, and evidence gathered.',
      '',
      'The recommendations are evidence-based and formulated to support the best interests',
      'of the child. All information has been handled in accordance with GDPR and professional',
      'confidentiality requirements.',
    ];

    declaration.forEach((line) => {
      doc.text(line, this.MARGIN, yPos);
      yPos += 5;
    });

    yPos += 15;

    // Signature line
    doc.setDrawColor(100, 116, 139);
    doc.line(this.MARGIN, yPos, this.MARGIN + 70, yPos);
    yPos += 5;
    doc.setFontSize(9);
    doc.text(`${data.ep.name}, Educational Psychologist`, this.MARGIN, yPos);
    yPos += 5;
    doc.text(`HCPC: ${data.ep.hcpcNumber}`, this.MARGIN, yPos);
    yPos += 5;
    doc.text(`Date: ${data.date.toLocaleDateString('en-GB')}`, this.MARGIN, yPos);

    return yPos;
  }

  private static addPageFooter(doc: jsPDF, pageNum: number, totalPages: number, data: ReportData) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);

    // Page number
    doc.text(
      `Page ${pageNum} of ${totalPages}`,
      this.PAGE_WIDTH / 2,
      this.PAGE_HEIGHT - 10,
      { align: 'center' }
    );

    // Confidentiality notice
    if (pageNum > 1) {
      doc.text('CONFIDENTIAL', this.MARGIN, this.PAGE_HEIGHT - 10);
    }

    // Student name
    doc.text(data.student.name, this.PAGE_WIDTH - this.MARGIN, this.PAGE_HEIGHT - 10, {
      align: 'right',
    });
  }

  private static getReportTitle(type: string): string {
    const titles = {
      ehcp_advice: 'Educational Psychology Advice for EHCP',
      assessment: 'Educational Psychology Assessment Report',
      intervention_review: 'Intervention Review Report',
      progress: 'Progress Monitoring Report',
      annual_review: 'Annual Review Contribution',
    };
    return titles[type as keyof typeof titles] || 'Educational Psychology Report';
  }

  private static generateExecutiveSummary(data: ReportData): string {
    return `This report provides professional Educational Psychology advice regarding ${data.student.name}, a ${data.student.yearGroup} student at ${data.student.school}. The report synthesizes assessment findings, observations, and collaborative input to inform understanding of ${data.student.name}'s strengths, needs, and the provision required to support their development.\n\nKey findings and recommendations are presented to support educational planning and ensure ${data.student.name} can access and benefit from education alongside their peers.`;
  }
}

export const reportGenerator = ReportGenerator;
