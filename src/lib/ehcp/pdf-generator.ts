/**
 * EHCP PDF Generator
 * Task 3.1.3: Document Generation
 *
 * Generates LA-compliant EHCP documents in PDF format
 * Supports:
 * - Full EHCP export
 * - Section-by-section export
 * - Professional formatting
 * - Digital signatures
 * - Watermarks for draft status
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ============================================================================
// TYPES
// ============================================================================

interface EHCPData {
  id: number;
  student_id: string;
  tenant_id: number;
  plan_details: {
    status?: string;
    issue_date?: string;
    review_date?: string;
    local_authority?: string;

    // Student Information
    student_name?: string;
    date_of_birth?: string;
    academic_year?: string;
    current_setting?: string;

    // Sections
    section_a?: {
      child_views?: string;
      parent_views?: string;
      aspirations?: string;
    };
    section_b?: {
      primary_need?: string;
      needs_description?: string;
      strengths?: string;
      difficulties?: string;
    };
    section_e?: {
      outcomes?: Array<{
        outcome_description: string;
        success_criteria: string;
        timeframe: string;
      }>;
    };
    section_f?: {
      provision?: Array<{
        provision_type: string;
        description: string;
        frequency: string;
        provider: string;
      }>;
    };
    section_i?: {
      placement_type?: string;
      placement_name?: string;
      placement_reasoning?: string;
    };
  };
  created_at?: Date;
  updated_at?: Date;
}

interface PDFOptions {
  sections?: ('A' | 'B' | 'E' | 'F' | 'I')[];
  includeCoverPage?: boolean;
  includeSignatures?: boolean;
  watermark?: string;
  branding?: {
    logo?: string;
    name?: string;
    contact?: string;
  };
}

// ============================================================================
// PDF GENERATOR CLASS
// ============================================================================

export class EHCPPDFGenerator {
  private doc: jsPDF;
  private pageNumber: number = 0;
  private yPosition: number = 0;

  // Page settings
  private readonly PAGE_WIDTH = 210; // A4 width in mm
  private readonly PAGE_HEIGHT = 297; // A4 height in mm
  private readonly MARGIN = 20;
  private readonly CONTENT_WIDTH = this.PAGE_WIDTH - (2 * this.MARGIN);

  // Colors (LA branding)
  private readonly PRIMARY_COLOR: [number, number, number] = [0, 51, 102]; // Dark blue
  private readonly SECONDARY_COLOR: [number, number, number] = [100, 100, 100]; // Gray
  private readonly ACCENT_COLOR: [number, number, number] = [0, 102, 204]; // Light blue

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    this.yPosition = this.MARGIN;
  }

  /**
   * Generate complete EHCP PDF
   */
  async generateEHCPPDF(ehcp: EHCPData, options: PDFOptions = {}): Promise<Blob> {
    const {
      sections = ['A', 'B', 'E', 'F', 'I'],
      includeCoverPage = true,
      includeSignatures = true,
      watermark,
      branding,
    } = options;

    // Cover page
    if (includeCoverPage) {
      this.addCoverPage(ehcp, branding);
      this.addPage();
    }

    // Add watermark if draft
    if (watermark || ehcp.plan_details.status === 'draft') {
      this.addWatermark(watermark || 'DRAFT');
    }

    // Student information summary
    this.addStudentInformation(ehcp);

    // Generate sections
    if (sections.includes('A')) {
      this.addSectionA(ehcp);
    }
    if (sections.includes('B')) {
      this.addSectionB(ehcp);
    }
    if (sections.includes('E')) {
      this.addSectionE(ehcp);
    }
    if (sections.includes('F')) {
      this.addSectionF(ehcp);
    }
    if (sections.includes('I')) {
      this.addSectionI(ehcp);
    }

    // Signatures page
    if (includeSignatures) {
      this.addSignaturesPage(ehcp);
    }

    return this.doc.output('blob');
  }

  /**
   * Generate section-specific PDF
   */
  async generateSectionPDF(
    ehcp: EHCPData,
    section: 'A' | 'B' | 'E' | 'F' | 'I'
  ): Promise<Blob> {
    this.addStudentInformation(ehcp);

    switch (section) {
      case 'A':
        this.addSectionA(ehcp);
        break;
      case 'B':
        this.addSectionB(ehcp);
        break;
      case 'E':
        this.addSectionE(ehcp);
        break;
      case 'F':
        this.addSectionF(ehcp);
        break;
      case 'I':
        this.addSectionI(ehcp);
        break;
    }

    return this.doc.output('blob');
  }

  // ==========================================================================
  // COVER PAGE
  // ==========================================================================

  private addCoverPage(ehcp: EHCPData, _branding?: PDFOptions['branding']) {
    // Header with LA branding
    this.doc.setFillColor(...this.PRIMARY_COLOR);
    this.doc.rect(0, 0, this.PAGE_WIDTH, 60, 'F');

    // Title
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(28);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(
      'Education, Health and Care Plan',
      this.PAGE_WIDTH / 2,
      30,
      { align: 'center' }
    );

    // LA name
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(
      ehcp.plan_details.local_authority || 'Local Authority',
      this.PAGE_WIDTH / 2,
      45,
      { align: 'center' }
    );

    // Reset text color
    this.doc.setTextColor(0, 0, 0);

    // Student information box
    const boxY = 80;
    this.doc.setFillColor(245, 245, 245);
    this.doc.roundedRect(this.MARGIN, boxY, this.CONTENT_WIDTH, 60, 3, 3, 'F');

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Student Information', this.MARGIN + 5, boxY + 10);

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(11);

    const infoY = boxY + 20;
    const lineHeight = 8;

    this.doc.text(`Name: ${ehcp.plan_details.student_name || 'N/A'}`, this.MARGIN + 5, infoY);
    this.doc.text(`Date of Birth: ${ehcp.plan_details.date_of_birth || 'N/A'}`, this.MARGIN + 5, infoY + lineHeight);
    this.doc.text(`Academic Year: ${ehcp.plan_details.academic_year || 'N/A'}`, this.MARGIN + 5, infoY + (lineHeight * 2));
    this.doc.text(`Current Setting: ${ehcp.plan_details.current_setting || 'N/A'}`, this.MARGIN + 5, infoY + (lineHeight * 3));

    // Document information
    const docInfoY = 160;
    this.doc.setFillColor(240, 248, 255);
    this.doc.roundedRect(this.MARGIN, docInfoY, this.CONTENT_WIDTH, 50, 3, 3, 'F');

    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Document Information', this.MARGIN + 5, docInfoY + 10);

    this.doc.setFont('helvetica', 'normal');
    const docY = docInfoY + 20;

    this.doc.text(`Status: ${ehcp.plan_details.status?.toUpperCase() || 'DRAFT'}`, this.MARGIN + 5, docY);
    this.doc.text(`Issue Date: ${ehcp.plan_details.issue_date || 'Pending'}`, this.MARGIN + 5, docY + lineHeight);
    this.doc.text(`Review Date: ${ehcp.plan_details.review_date || 'Not set'}`, this.MARGIN + 5, docY + (lineHeight * 2));

    // Footer
    this.doc.setFontSize(9);
    this.doc.setTextColor(...this.SECONDARY_COLOR);
    this.doc.text(
      'This document is confidential and should be handled in accordance with GDPR regulations',
      this.PAGE_WIDTH / 2,
      this.PAGE_HEIGHT - 15,
      { align: 'center' }
    );

    this.doc.text(
      `Generated: ${new Date().toLocaleDateString('en-GB')}`,
      this.PAGE_WIDTH / 2,
      this.PAGE_HEIGHT - 10,
      { align: 'center' }
    );

    this.doc.setTextColor(0, 0, 0);
  }

  // ==========================================================================
  // STUDENT INFORMATION (Summary)
  // ==========================================================================

  private addStudentInformation(ehcp: EHCPData) {
    this.addSectionHeader('Student Information');

    const data = [
      ['Full Name', ehcp.plan_details.student_name || 'N/A'],
      ['Date of Birth', ehcp.plan_details.date_of_birth || 'N/A'],
      ['Academic Year', ehcp.plan_details.academic_year || 'N/A'],
      ['Current Setting', ehcp.plan_details.current_setting || 'N/A'],
      ['EHCP Status', ehcp.plan_details.status?.toUpperCase() || 'DRAFT'],
      ['Issue Date', ehcp.plan_details.issue_date || 'Pending'],
      ['Review Date', ehcp.plan_details.review_date || 'Not set'],
    ];

    autoTable(this.doc, {
      startY: this.yPosition,
      head: [],
      body: data,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
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
  // SECTION A: VIEWS, INTERESTS AND ASPIRATIONS
  // ==========================================================================

  private addSectionA(ehcp: EHCPData) {
    this.addSectionHeader('Section A: Views, Interests and Aspirations');

    const sectionA = ehcp.plan_details.section_a;

    if (!sectionA) {
      this.addText('No information available for Section A', true);
      return;
    }

    // Child's Views
    this.addSubsectionHeader("The Child's Views");
    this.addText(sectionA.child_views || 'Not provided');

    this.checkPageBreak(20);

    // Parent's Views
    this.addSubsectionHeader("Parent's/Carer's Views");
    this.addText(sectionA.parent_views || 'Not provided');

    this.checkPageBreak(20);

    // Aspirations
    this.addSubsectionHeader('Aspirations for the Future');
    this.addText(sectionA.aspirations || 'Not provided');

    this.yPosition += 10;
  }

  // ==========================================================================
  // SECTION B: SPECIAL EDUCATIONAL NEEDS
  // ==========================================================================

  private addSectionB(ehcp: EHCPData) {
    this.addSectionHeader('Section B: Special Educational Needs');

    const sectionB = ehcp.plan_details.section_b;

    if (!sectionB) {
      this.addText('No information available for Section B', true);
      return;
    }

    // Primary Need
    this.addSubsectionHeader('Primary Area of Need');
    this.addText(sectionB.primary_need || 'Not specified');

    this.checkPageBreak(20);

    // Needs Description
    this.addSubsectionHeader('Description of Special Educational Needs');
    this.addText(sectionB.needs_description || 'Not provided');

    this.checkPageBreak(20);

    // Strengths
    if (sectionB.strengths) {
      this.addSubsectionHeader('Areas of Strength');
      this.addText(sectionB.strengths);
      this.checkPageBreak(20);
    }

    // Difficulties
    if (sectionB.difficulties) {
      this.addSubsectionHeader('Areas of Difficulty');
      this.addText(sectionB.difficulties);
    }

    this.yPosition += 10;
  }

  // ==========================================================================
  // SECTION E: OUTCOMES
  // ==========================================================================

  private addSectionE(ehcp: EHCPData) {
    this.addSectionHeader('Section E: Outcomes');

    const sectionE = ehcp.plan_details.section_e;

    if (!sectionE?.outcomes || sectionE.outcomes.length === 0) {
      this.addText('No outcomes specified', true);
      return;
    }

    this.addText(
      'The following outcomes describe what the child or young person can reasonably be expected to achieve within a specified timeframe.'
    );

    this.yPosition += 5;

    // Create table data
    const tableData = sectionE.outcomes.map((outcome, index) => [
      `Outcome ${index + 1}`,
      outcome.outcome_description,
      outcome.success_criteria,
      outcome.timeframe,
    ]);

    autoTable(this.doc, {
      startY: this.yPosition,
      head: [['#', 'Outcome Description', 'Success Criteria', 'Timeframe']],
      body: tableData,
      theme: 'striped',
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: this.PRIMARY_COLOR,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 60 },
        2: { cellWidth: 55 },
        3: { cellWidth: 35 },
      },
      margin: { left: this.MARGIN, right: this.MARGIN },
    });

    this.yPosition = (this.doc as any).lastAutoTable.finalY + 10;
    this.checkPageBreak();
  }

  // ==========================================================================
  // SECTION F: SPECIAL EDUCATIONAL PROVISION
  // ==========================================================================

  private addSectionF(ehcp: EHCPData) {
    this.addSectionHeader('Section F: Special Educational Provision');

    const sectionF = ehcp.plan_details.section_f;

    if (!sectionF?.provision || sectionF.provision.length === 0) {
      this.addText('No provision specified', true);
      return;
    }

    this.addText(
      'The following special educational provision is required to meet the identified needs and achieve the outcomes specified in Section E.'
    );

    this.yPosition += 5;

    // Create table data
    const tableData = sectionF.provision.map((prov, index) => [
      `${index + 1}`,
      prov.provision_type,
      prov.description,
      prov.frequency,
      prov.provider,
    ]);

    autoTable(this.doc, {
      startY: this.yPosition,
      head: [['#', 'Type', 'Description', 'Frequency', 'Provider']],
      body: tableData,
      theme: 'striped',
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: this.PRIMARY_COLOR,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 35 },
        2: { cellWidth: 60 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
      },
      margin: { left: this.MARGIN, right: this.MARGIN },
    });

    this.yPosition = (this.doc as any).lastAutoTable.finalY + 10;
    this.checkPageBreak();
  }

  // ==========================================================================
  // SECTION I: PLACEMENT
  // ==========================================================================

  private addSectionI(ehcp: EHCPData) {
    this.addSectionHeader('Section I: Placement');

    const sectionI = ehcp.plan_details.section_i;

    if (!sectionI) {
      this.addText('No placement information available', true);
      return;
    }

    // Placement Type
    this.addSubsectionHeader('Type of Placement');
    this.addText(sectionI.placement_type || 'Not specified');

    this.checkPageBreak(20);

    // Placement Name
    if (sectionI.placement_name) {
      this.addSubsectionHeader('Name of Institution');
      this.addText(sectionI.placement_name);
      this.checkPageBreak(20);
    }

    // Reasoning
    this.addSubsectionHeader('Reasoning for Placement Decision');
    this.addText(sectionI.placement_reasoning || 'Not provided');

    this.yPosition += 10;
  }

  // ==========================================================================
  // SIGNATURES PAGE
  // ==========================================================================

  private addSignaturesPage(_ehcp: EHCPData) {
    this.addPage();
    this.addSectionHeader('Signatures and Approvals');

    this.addText(
      'This Education, Health and Care Plan has been reviewed and approved by the following parties:'
    );

    this.yPosition += 10;

    const signatureBoxHeight = 40;
    const signatureBoxWidth = this.CONTENT_WIDTH;

    // Parent/Carer Signature
    this.doc.setDrawColor(...this.SECONDARY_COLOR);
    this.doc.rect(this.MARGIN, this.yPosition, signatureBoxWidth, signatureBoxHeight);

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Parent/Carer Signature:', this.MARGIN + 5, this.yPosition + 8);

    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Date: _______________', this.MARGIN + 5, this.yPosition + signatureBoxHeight - 5);

    this.yPosition += signatureBoxHeight + 10;

    // Educational Psychologist Signature
    this.doc.rect(this.MARGIN, this.yPosition, signatureBoxWidth, signatureBoxHeight);

    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Educational Psychologist Signature:', this.MARGIN + 5, this.yPosition + 8);

    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Name: _______________', this.MARGIN + 5, this.yPosition + 18);
    this.doc.text('Date: _______________', this.MARGIN + 5, this.yPosition + signatureBoxHeight - 5);

    this.yPosition += signatureBoxHeight + 10;

    // Local Authority Officer Signature
    this.doc.rect(this.MARGIN, this.yPosition, signatureBoxWidth, signatureBoxHeight);

    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Local Authority Officer Signature:', this.MARGIN + 5, this.yPosition + 8);

    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Name: _______________', this.MARGIN + 5, this.yPosition + 18);
    this.doc.text('Date: _______________', this.MARGIN + 5, this.yPosition + signatureBoxHeight - 5);

    this.yPosition += signatureBoxHeight + 10;

    // Disclaimer
    this.yPosition += 10;
    this.doc.setFontSize(8);
    this.doc.setTextColor(...this.SECONDARY_COLOR);
    this.addText(
      'This document constitutes a legal agreement under the Children and Families Act 2014. ' +
      'All parties named must ensure the provision specified in this plan is delivered as described.',
      false,
      this.CONTENT_WIDTH
    );

    this.doc.setTextColor(0, 0, 0);
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private addSectionHeader(title: string) {
    this.checkPageBreak(30);

    // Section header box
    this.doc.setFillColor(...this.PRIMARY_COLOR);
    this.doc.rect(this.MARGIN, this.yPosition, this.CONTENT_WIDTH, 12, 'F');

    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.MARGIN + 5, this.yPosition + 8);

    this.doc.setTextColor(0, 0, 0);
    this.yPosition += 17;
  }

  private addSubsectionHeader(title: string) {
    this.checkPageBreak(20);

    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.ACCENT_COLOR);
    this.doc.text(title, this.MARGIN, this.yPosition);

    this.doc.setTextColor(0, 0, 0);
    this.yPosition += 7;
  }

  private addText(text: string, italic: boolean = false, maxWidth: number = this.CONTENT_WIDTH) {
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', italic ? 'italic' : 'normal');

    const lines = this.doc.splitTextToSize(text, maxWidth);

    lines.forEach((line: string) => {
      this.checkPageBreak();
      this.doc.text(line, this.MARGIN, this.yPosition);
      this.yPosition += 5;
    });

    this.yPosition += 3;
  }

  private addWatermark(text: string) {
    const totalPages = this.doc.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      this.doc.setTextColor(200, 200, 200);
      this.doc.setFontSize(60);
      this.doc.setFont('helvetica', 'bold');

      // Rotate and center
      this.doc.text(
        text,
        this.PAGE_WIDTH / 2,
        this.PAGE_HEIGHT / 2,
        {
          align: 'center',
          angle: 45,
        }
      );
    }

    // Reset
    this.doc.setPage(totalPages);
    this.doc.setTextColor(0, 0, 0);
  }

  private addPage() {
    this.doc.addPage();
    this.pageNumber++;
    this.yPosition = this.MARGIN;
    this.addPageHeader();
    this.addPageFooter();
  }

  private addPageHeader() {
    this.doc.setFontSize(8);
    this.doc.setTextColor(...this.SECONDARY_COLOR);
    this.doc.text('Education, Health and Care Plan', this.MARGIN, 10);
    this.doc.setTextColor(0, 0, 0);
  }

  private addPageFooter() {
    const pageStr = `Page ${this.pageNumber + 1}`;
    this.doc.setFontSize(8);
    this.doc.setTextColor(...this.SECONDARY_COLOR);
    this.doc.text(pageStr, this.PAGE_WIDTH - this.MARGIN, this.PAGE_HEIGHT - 10, {
      align: 'right',
    });
    this.doc.text(
      'Confidential - GDPR Protected',
      this.PAGE_WIDTH / 2,
      this.PAGE_HEIGHT - 10,
      { align: 'center' }
    );
    this.doc.setTextColor(0, 0, 0);
  }

  private checkPageBreak(requiredSpace: number = 15) {
    if (this.yPosition + requiredSpace > this.PAGE_HEIGHT - this.MARGIN) {
      this.addPage();
    }
  }
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

/**
 * Generate and download EHCP PDF
 */
export async function downloadEHCPPDF(
  ehcp: EHCPData,
  options?: PDFOptions
): Promise<void> {
  const generator = new EHCPPDFGenerator();
  const blob = await generator.generateEHCPPDF(ehcp, options);

  const filename = `EHCP-${ehcp.id}-${ehcp.plan_details.student_name?.replace(/\s+/g, '-') || 'Draft'}.pdf`;

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  // Cleanup
  URL.revokeObjectURL(url);
}

/**
 * Generate EHCP PDF blob (for email attachment)
 */
export async function generateEHCPBlob(
  ehcp: EHCPData,
  options?: PDFOptions
): Promise<Blob> {
  const generator = new EHCPPDFGenerator();
  return generator.generateEHCPPDF(ehcp, options);
}

/**
 * Generate section-specific PDF
 */
export async function downloadSectionPDF(
  ehcp: EHCPData,
  section: 'A' | 'B' | 'E' | 'F' | 'I'
): Promise<void> {
  const generator = new EHCPPDFGenerator();
  const blob = await generator.generateSectionPDF(ehcp, section);

  const filename = `EHCP-${ehcp.id}-Section-${section}.pdf`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}
