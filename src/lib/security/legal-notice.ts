/**
 * 
 *                                                                               
 *                     EDPSYCH CONNECT WORLD - LEGAL NOTICE                     
 *                                                                               
 *   Copyright (c) 2025 EdPsych Connect Limited. All Rights Reserved.             
 *                                                                               
 *   Company Registration: 14989115 (England and Wales)                         
 *   HCPC Registration: PYL042340                                               
 *   Founder: Dr Scott I-Patrick, DEdPsych, CPsychol                            
 *                                                                               
 * 
 * 
 * INTELLECTUAL PROPERTY NOTICE
 * ============================
 * 
 * This software, including but not limited to:
 * 
 * 1. SOURCE CODE & ARCHITECTURE
 *    - All TypeScript, JavaScript, CSS, and configuration files
 *    - Database schemas and migration files
 *    - API route implementations and business logic
 *    - React components and UI implementations
 * 
 * 2. PROPRIETARY ALGORITHMS
 *    - ECCA Framework (Educational Context & Capabilities Assessment)
 *    - Problem Solver AI algorithms
 *    - Lesson Differentiation engine
 *    - Progress monitoring and prediction models
 *    - Intervention effectiveness scoring
 *    - Multi-sensory learning adaptation algorithms
 * 
 * 3. ASSESSMENT FRAMEWORKS
 *    - All assessment templates and scoring rubrics
 *    - EHCP support documentation workflows
 *    - Standardized evaluation methodologies
 *    - Evidence-based intervention protocols
 * 
 * 4. CONTENT & DOCUMENTATION
 *    - Training materials and courses
 *    - Help center articles and guides
 *    - Blog posts and research content
 *    - Video scripts and educational media
 * 
 * 5. BRANDING & DESIGN
 *    - EdPsych Connect World name and logo
 *    - UI/UX design patterns and components
 *    - Color schemes and visual identity
 *    - Marketing materials and messaging
 * 
 * Is the exclusive intellectual property of EdPsych Connect Limited.
 * 
 * 
 * LICENSE TERMS
 * =============
 * 
 * This software is provided under a PROPRIETARY LICENSE. You may NOT:
 * 
 * FAIL Copy, reproduce, or duplicate any part of this software
 * FAIL Modify, adapt, or create derivative works
 * FAIL Distribute, sublicense, or sell copies
 * FAIL Reverse engineer, decompile, or disassemble
 * FAIL Use any algorithms, frameworks, or methodologies in other products
 * FAIL Scrape, crawl, or bulk extract data or content
 * FAIL Remove or alter any proprietary notices
 * 
 * 
 * AUTHORIZED USE ONLY
 * ===================
 * 
 * This software is authorized for deployment ONLY on:
 * 
 *  edpsychconnect.com and subdomains
 *  Vercel deployments owned by EdPsych Connect Limited
 *  Development environments for authorized personnel
 * 
 * Any unauthorized deployment, copying, or use will be prosecuted
 * to the fullest extent of applicable law.
 * 
 * 
 * TRADE SECRETS
 * =============
 * 
 * This codebase contains trade secrets including:
 * 
 * - Assessment scoring algorithms developed through years of clinical practice
 * - AI prompt engineering for educational psychology applications
 * - Multi-tenant architecture optimized for UK school systems
 * - GDPR-compliant data handling patterns for sensitive pupil data
 * - Integration patterns for UK educational systems (MIS, SIMS, etc.)
 * 
 * Unauthorized disclosure of these trade secrets may result in
 * civil and criminal liability.
 * 
 * 
 * ENFORCEMENT
 * ===========
 * 
 * EdPsych Connect Limited actively monitors for:
 * 
 * - Unauthorized deployments through digital fingerprinting
 * - API scraping and bulk data extraction attempts
 * - Code copying and derivative works
 * - Trademark and brand infringement
 * 
 * All violations are logged with full audit trails for legal proceedings.
 * 
 * 
 * CONTACT
 * =======
 * 
 * For licensing inquiries:
 * Email: legal@edpsychconnect.com
 * 
 * For partnership opportunities:
 * Email: partnerships@edpsychconnect.com
 * 
 * For reporting IP violations:
 * Email: ip-enforcement@edpsychconnect.com
 * 
 * 
 * 
 * 
 * By accessing this codebase, you acknowledge that you have read,
 * understood, and agreed to be bound by these terms.
 * 
 * 
 */

export const LEGAL_NOTICE = {
  company: 'EdPsych Connect Limited',
  companyNumber: '14989115',
  jurisdiction: 'England and Wales',
  hcpcRegistration: 'PYL042340',
  founder: 'Dr Scott I-Patrick, DEdPsych, CPsychol',
  copyright: `(c) ${new Date().getFullYear()} EdPsych Connect Limited. All Rights Reserved.`,
  licenseType: 'Proprietary',
  authorizedDomains: [
    'edpsychconnect.com',
    'www.edpsychconnect.com',
    '*.edpsychconnect.com',
  ],
  contact: {
    legal: 'legal@edpsychconnect.com',
    partnerships: 'partnerships@edpsychconnect.com',
    ipEnforcement: 'ip-enforcement@edpsychconnect.com',
    support: 'help@edpsychconnect.com',
  },
};

/**
 * Get copyright notice for display
 */
export function getCopyrightNotice(): string {
  return LEGAL_NOTICE.copyright;
}

/**
 * Get full legal attribution
 */
export function getLegalAttribution(): string {
  return `${LEGAL_NOTICE.copyright} | Company No: ${LEGAL_NOTICE.companyNumber} | HCPC: ${LEGAL_NOTICE.hcpcRegistration}`;
}
