/**
 * Audit video scripts (script-derived transcripts) against code evidence.
 *
 * Goal: produce a repo-verifiable, repeatable triage report:
 * - which canonical video keys have transcripts
 * - which transcripts contain claim-like sentences
 * - which of those sentences have *some* code evidence anchor (heuristic map)
 * - which are high-risk / unevidenced and likely require script adjustment (and thus re-generation)
 *
 * IMPORTANT: This tool is intentionally conservative.
 * - “Unevidenced” does NOT prove a claim is false; it means we have no code anchor configured.
 * - “Evidenced” means a code anchor pattern matched; it does NOT prove the implementation fully satisfies a claim.
 *
 * Run:
 *   npx tsx tools/audit-video-scripts-against-code.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

import { HEYGEN_VIDEO_IDS } from '../src/lib/training/heygen-video-urls';
import { getVideoScriptResolution } from '../src/lib/video-scripts/registry-core';

type CodeSearch = {
  file: string;
  pattern: string;
  isRegex?: boolean;
};

type EvidenceRule = {
  id: string;
  label: string;
  sentenceRe: RegExp;
  match?: 'any' | 'all';
  code: CodeSearch[];
  notes?: string;
};

type KeyReport = {
  key: string;
  resolvedKey: string;
  scriptStatus: 'found' | 'missing';
  sourceId?: string;
  title?: string;
  transcriptSha256?: string;
  transcriptLength?: number;
  claimSentences?: {
    detectedTotal: number;
    detectedHighRisk: number;
    outOfScopeIgnored: number;
    outOfScopeExamples: string[];
    total: number; // in-scope product/operational claims
    highRisk: number; // in-scope
    evidenced: number;
    unevidenced: number;
    highRiskUnevidencedExamples: string[];
    unevidencedExamples: string[];
  };
  recommendation: 'ok' | 'needs-review' | 'likely-script-update';
  notes: string[];
};

type AuditReport = {
  schemaVersion: 1;
  generatedAt: string;
  totals: {
    keysTotal: number;
    scriptsMissing: number;
    ok: number;
    needsReview: number;
    likelyScriptUpdate: number;
    regenCandidatesEstimate: number;
  };
  keys: Record<string, KeyReport>;
};

function sha256(text: string): string {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function sentenceSplit(text: string): string[] {
  const t = normalizeWhitespace(text);
  if (!t) return [];
  // A pragmatic split for narration-style scripts. We keep punctuation.
  const parts = t
    .split(/(?<=[.!?])\s+(?=[A-Z0-9“"(])/)
    .map(s => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [t];
}

function safeReadFile(absPath: string): string | null {
  try {
    return fs.readFileSync(absPath, 'utf8');
  } catch {
    return null;
  }
}

function matchesCodeSearch(cs: CodeSearch): boolean {
  const abs = path.resolve(process.cwd(), cs.file);
  const content = safeReadFile(abs);
  if (content == null) return false;
  if (cs.isRegex) {
    try {
      const re = new RegExp(cs.pattern, 'm');
      return re.test(content);
    } catch {
      return false;
    }
  }
  return content.includes(cs.pattern);
}

function anyEvidenceMatches(rule: EvidenceRule): boolean {
  const mode = rule.match ?? 'any';
  if (mode === 'all') {
    // ALL-of semantics: used for compound sentences where multiple independent anchors must exist.
    return rule.code.every(matchesCodeSearch);
  }

  // ANY-of semantics: if at least one anchor hits, we treat as “some evidence exists”.
  return rule.code.some(matchesCodeSearch);
}

// Sentences that are likely “product/operational claims” (not pure narration).
// NOTE: We intentionally avoid matching generic pronouns like "we"/"our" because they create
// lots of false positives in training narration (e.g. classroom examples).
const CLAIMY_SENTENCE_RE =
  /\b(edpsych\s*connect|the\s+platform|platform|the\s+system|system|dashboard|workflow|feature|tool|module|portal|research\s+hub|safety\s+net|risk\s+predict|request\s+portal|secure\s+messaging|care\s+teams?|co-?author|real\s*time|audit|audit\s+trail|access\s+log|logging|compliance|gdpr|uk\s*gdpr|data\s+minimi[sz]ation|retention|subject\s+access\s+request|sar|security|zero\s+trust|encryption|aes-?256|end-?to-?end\s+encryption|penetration\s+test|iso\s*27001|soc\s*2|hipaa|uk-?hosted|byod|bring\s+your\s+own\s+database|data\s+sovereignty|ai|agent|orchestration\s+engine|report|pdf|docx|export|download|generate\s+report|report\s+generator|consent|pricing|per\s+student|best\s+value|cheapest|compare\s+directly|gate\s+essential)\b|\b(you\s+can|you\'ll)\b/i;

// Sentences that create legal/technical/compliance risk if wrong.
// Keep this narrowly focused on objective-sounding compliance/security claims.
const HIGH_RISK_RE =
  /\b(guarantee|100%|fully\s+compliant|gdpr\s+compliant|uk\s*gdpr|iso\s*27001|hipaa|soc\s*2|aes-?256|end-?to-?end\s+encryption|penetration\s+tested|uk-?hosted|legal\s+requirement|automatically\s+flags\s+every|scans\s+every\s+case)\b/i;

// Scope filter: We only want to flag *product/operational* claims for “script ↔ code” verification.
// Educational content (e.g., ADHD psychoeducation), market commentary, and hypothetical examples are out-of-scope.
// This dramatically reduces false positives without lowering standards for platform claims.
const PRODUCT_SCOPE_STRONG_RE =
  /\b(edpsych\s*connect|our\s+(?:platform|system|app|portal|dashboard)|this\s+(?:platform|system|app)|in\s+(?:the\s+platform|our\s+platform|edpsych\s*connect)|on\s+(?:the\s+platform|our\s+platform|edpsych\s*connect)|we\s+(?:built|build|provide|offer|support|include|ship|use|do)|with\s+(?:the\s+platform|our\s+platform|edpsych\s*connect))\b/i;

// Feature/ops keywords that indicate the sentence is about the product even if it doesn't say "our" explicitly.
const PRODUCT_SCOPE_FEATURE_RE =
  /\b(ehcp|la\s+dashboard|parent\s+portal|safety\s*net|research\s+hub|intervention\s+library|assessment\s+(?:engine|templates?|library)|assessments?|report\s+(?:generator|writing|draft)|dashboard|workflows?|platform\s+events?|audit\s+trail|access\s+log|rbac|permissions?|least\s+privilege|consent|gdpr|uk\s*gdpr|data\s+minimi[sz]ation|retention|sar\b|subject\s+access\s+request|security|encryption|aes-?256|csp|hsts|ai\b|agent\b|api\b|data\s+warehouse|white\s*label|multi-tenant|custom\s+domain|cloudinary|cdn|heygen|captions?|cpd|certificate(s)?|course\s+library|training\s+modules?|multi-?agency|advice\s+portal|request\s+portal|reminders?|response\s+status|nudge|chasers?)\b/i;

// Common out-of-scope patterns: competitor comparisons, generic industry commentary, hypotheticals.
const OUT_OF_SCOPE_MARKET_OR_HYPOTHETICAL_RE =
  /\b(most\s+platforms?|many\s+platforms?|other\s+platforms?|competitors?|compared\s+to|unlike\s+other|in\s+the\s+market|tens\s+of\s+thousands|for\s+example|imagine|picture\s+this|let['’]s\s+say)\b/i;

// Subjective marketing opinion / value judgements are not code-verifiable.
const OUT_OF_SCOPE_SUBJECTIVE_RE =
  /\b(gimmick|marketing\s+box|most\s+practically\s+useful|best\s+in\s+class|i['’]ve\s+seen|game\s*changer|chaotic\s+chase|streamlined\s+workflow|(?:isn.{0,2}t|is\s+not|not)\s+just\s+(?:a\s+)?software\s+platform|should\s+help\s+humans?|should\s+be|not\s+replace\s+human\s+judg(e)?ment|automates\s+everything\s+that\s+can\s+be\s+automated|that's\s+the\s+edpsych\s*connect\s+difference)\b/i;

// Founder-story / narrative intent statements are not code-verifiable product claims.
const OUT_OF_SCOPE_FOUNDER_STORY_RE =
  /\b(i|we)\s+(?:built|created|designed|started|founded)\s+(?:edpsych\s*connect|this\s+(?:platform|system)|the\s+(?:platform|system))\b/i;

// Adoption strategy advice that references the user's existing system is not something we can prove from this repo.
const OUT_OF_SCOPE_ADOPTION_STRATEGY_RE =
  /\b(your\s+(?:current|existing)\s+(?:system|platform)|current\s+system|current\s+platform|while\s+your\s+historical\s+data\s+remains\s+accessible\s+in\s+your\s+current\s+system)\b/i;

// Testimonial-style, numeric time-savings claims are not provable from repository evidence alone.
// We treat these as out-of-scope to avoid creating synthetic “proof” strings.
const OUT_OF_SCOPE_TESTIMONIAL_TIME_SAVINGS_RE =
  /\bteachers\s+using\s+this\s+platform\s+(?:tell|say)\s+us\s+they['’]re\s+saving\s+three\s+to\s+four\s+hours\b/i;

// Scripted roleplay/vignette lines that mention the product but do not assert a product capability.
// Example: user complaint scenarios used to set context for support/troubleshooting.
const OUT_OF_SCOPE_VIGNETTE_OR_ROLEPLAY_RE =
  /\b(the\s+governor\s+visit\s+is\s+this\s+afternoon|governor\s+visit|this\s+afternoon)\b/i;

// Pain-point rhetorical questions about the user's current manual process are not product capability claims.
const OUT_OF_SCOPE_PAIN_POINT_RE = /\bcopying\s+and\s+pasting\b.*\bassessment\s+results\b/i;

// Literacy/phonics narration can contain tokens like "ai" (vowel teams) that are unrelated to "AI".
const OUT_OF_SCOPE_LITERACY_PHONICS_RE =
  /\b(phonics|phonemic|phoneme|grapheme|digraph|trigraph|vowel\s+teams?|decodable|blending)\b|\b\(\s*ai\s*,\s*ay\s*,\s*a-e\s*\)\b/i;

// Acronym definitions are not "code-verifiable" product claims.
const OUT_OF_SCOPE_ACRONYM_DEFINITION_RE = /\b(EHCP|GDPR|SAR)\b\s+means\b/i;

function isInScopeProductClaimSentence(sentence: string): boolean {
  const s = normalizeWhitespace(sentence);
  if (!s) return false;

  // Pure greetings/intros are not meaningful product claims.
  if (/^welcome to\s+edpsych\s*connect(\s+world)?[.!]?$/i.test(s)) return false;

  // Ignore very short / vague fragments that are not meaningfully checkable.
  if (/^(the\s+)?(security|privacy)\.?$/i.test(s)) return false;
  if (/^(and\s+)?(the\s+)?(security|privacy)\?$/i.test(s)) return false;
  if (/^(your|the)\s+security\s+perimeter\.?$/i.test(s)) return false;
  if (/^that['’]?s\s+the\s+workflow\.?$/i.test(s)) return false;

  // Scripted vignette/pain-point lines are not product capability claims.
  if (OUT_OF_SCOPE_VIGNETTE_OR_ROLEPLAY_RE.test(s)) return false;
  if (OUT_OF_SCOPE_PAIN_POINT_RE.test(s)) return false;

  // Skip plain acronym definitions unless the sentence explicitly ties it back to the product.
  if (OUT_OF_SCOPE_ACRONYM_DEFINITION_RE.test(s) && !PRODUCT_SCOPE_STRONG_RE.test(s)) return false;

  // Literacy/phonics training narration is out-of-scope, even if it happens to match tokens like "ai".
  if (OUT_OF_SCOPE_LITERACY_PHONICS_RE.test(s) && !PRODUCT_SCOPE_STRONG_RE.test(s)) return false;

  // Founder-story narrative is not a repo-verifiable product/operational claim.
  if (OUT_OF_SCOPE_FOUNDER_STORY_RE.test(s)) return false;

  // Numeric testimonials (e.g., time-savings quoted from users) are not code-verifiable.
  if (OUT_OF_SCOPE_TESTIMONIAL_TIME_SAVINGS_RE.test(s) && !HIGH_RISK_RE.test(s)) return false;

  // Adoption strategy advice about a user's existing system is out-of-scope for repo verification.
  if (OUT_OF_SCOPE_ADOPTION_STRATEGY_RE.test(s)) return false;

  // Marketing framing that is not meaningfully verifiable against code.
  // We intentionally treat this as out-of-scope rather than requiring a synthetic “proof anchor”.
  if (/\bedpsych\s*connect\b.*\bisn.{0,2}t\s+just\s+a\s+software\s+platform\b/i.test(s)) return false;

  const hasStrong = PRODUCT_SCOPE_STRONG_RE.test(s);
  const hasFeature = PRODUCT_SCOPE_FEATURE_RE.test(s);
  if (!hasStrong && !hasFeature) return false;

  // Disambiguation: “safety net” is often used as a metaphor in training narration.
  // Only treat it as in-scope if the sentence also clearly references the product/platform.
  if (/\bsafety\s*net\b/i.test(s) && !hasStrong) {
    const looksLikeTrainingMetaphor = /\b(child|adhd|autism|student|parent|family)\b/i.test(s);
    if (looksLikeTrainingMetaphor) return false;
  }

  // Pure opinions/marketing value judgements aren't checkable against code.
  if (OUT_OF_SCOPE_SUBJECTIVE_RE.test(s) && !HIGH_RISK_RE.test(s)) return false;

  // If it's framed as competitor/market commentary and doesn't clearly talk about "us", ignore it.
  if (!hasStrong && OUT_OF_SCOPE_MARKET_OR_HYPOTHETICAL_RE.test(s)) return false;

  return true;
}

// Evidence rules: small-but-real set of code anchors. Expand over time.
// (This is the part that makes the audit “provable by repo”.)
const EVIDENCE_RULES: EvidenceRule[] = [
  {
    id: 'api-access-live-data-from-assessments',
    label: 'API-access: dashboard can pull live assessment data (server fetch + force-dynamic)',
    sentenceRe: /\byour\s+reporting\s+dashboard\s+pulls\s+live\s+data\s+from\s+assessments\b/i,
    code: [
      { file: 'src/app/api/assessments/route.ts', pattern: "export const dynamic = 'force-dynamic';" },
      { file: 'src/app/api/assessments/route.ts', pattern: 'prisma.assessments.findMany' },
    ],
    notes:
      'Anchors that assessment data is fetched on-demand from the database (not static) via a dynamic API route. This is the minimal repo-verifiable evidence for “pulls live data”.',
  },
  {
    id: 'api-access-workflows-trigger-on-events',
    label: 'API-access: workflow/event trigger layer exists (cross-module intelligence routing events)',
    sentenceRe: /\byour\s+custom\s+workflows\s+trigger\s+based\s+on\s+platform\s+events\b/i,
    code: [
      { file: 'src/lib/orchestration/cross-module-intelligence.service.ts', pattern: 'PROCESS TRIGGER EVENT' },
      { file: 'src/lib/orchestration/cross-module-intelligence.service.ts', pattern: 'processTriggerEvent' },
      { file: 'src/lib/orchestration/cross-module-intelligence.service.ts', pattern: "'assessment_complete'" },
      { file: 'docs/ORCHESTRATION_QUICKSTART.md', pattern: 'Pattern**: Event-driven triggers' },
    ],
    notes:
      'Anchors that the platform has an event-driven trigger router capable of invoking automation flows in response to platform events.',
  },
  {
    id: 'api-access-data-warehouse-export',
    label: 'API-access: data-warehouse export endpoint exists (tenant-scoped, API-key gated)',
    sentenceRe: /\bfeed\s+platform\s+data\s+into\s+your\s+data\s+warehouse\b/i,
    code: [
      { file: 'src/app/api/integrations/data-warehouse/export/route.ts', pattern: 'DATA_WAREHOUSE_EXPORT_API_KEY' },
      { file: 'src/app/api/integrations/data-warehouse/export/route.ts', pattern: 'x-epc-export-key' },
      { file: 'docs/API_ACCESS_DATA_WAREHOUSE_EXPORT.md', pattern: 'Data Warehouse Export API' },
    ],
    notes:
      'Anchors a concrete export API surface designed for ETL/warehouse ingestion. This proves the capability exists; it does not assert any specific downstream warehouse configuration.',
  },
  {
    id: 'assessment-templates-library',
    label: 'Assessment templates library exists',
    sentenceRe: /\b(assessment templates?|validated assessment|assessment (library|frameworks?)|assessment (templates?|frameworks?)|ecca framework)\b/i,
    code: [
      { file: 'src/lib/assessments/assessment-library.ts', pattern: 'Assessment Library' },
      { file: 'src/lib/assessments/assessment-library.ts', pattern: 'Task 3.2.1: Comprehensive Assessment Templates' },
    ],
    notes: 'Anchors the existence of assessment templates/frameworks; does not validate clinical appropriateness for a specific use case.',
  },
  {
    id: 'assessment-validity-governance',
    label: 'Assessment validity/clinical-grade capture posture is defined + validated (engineering evidence)',
    sentenceRe:
      /\b(clinical-?grade)\b.*\b(assessment)\b.*\b(validity|trust)\b|\b(assessment)\b.*\b(validity\s+you\s+can\s+trust|trust\s+and\s+use)\b/i,
    code: [
      { file: 'docs/ASSESSMENT_VALIDITY_GOVERNANCE.md', pattern: 'Assessment Validity & "Clinical-Grade" Capture (Engineering Evidence)' },
      { file: 'src/lib/assessments/assessment-library.ts', pattern: 'IMPORTANT: These are assessment frameworks and recording tools' },
      { file: 'tools/validate-assessment-library-validity.ts', pattern: 'OK: assessment library validity checks passed' },
    ],
    notes:
      'Defines what we mean by “clinical-grade capture” in repo terms (structured recording + references + qualification gating) and provides a deterministic validator. This does not claim the platform itself creates psychometric validity; it claims the platform captures/structures assessment data suitable for professional use when entered/administered by qualified practitioners.',
  },
  {
    id: 'gamification-assessment-feels-like-play-clinical-grade-capture',
    label: 'Gamification makes assessments feel like play + clinical-grade capture posture exists (compound anchor)',
    sentenceRe:
      /\b(gamification\s+system)\b.*\b(assessment)\b.*\b(feel\s+like\s+play)\b.*\b(clinical-?grade)\b/i,
    match: 'all',
    code: [
      // “Feels like play” / gamification system anchors
      { file: 'src/app/[locale]/gamification/page.tsx', pattern: 'Complete assessments, log interventions, and engage with the community to earn points.' },
      { file: 'src/lib/gamification/battle-royale.ts', pattern: 'Battle Royale Gamification System' },
      { file: 'src/lib/gamification/merit-system.ts', pattern: 'The universal currency that drives all gamification' },

      // “Clinical-grade” capture anchors
      { file: 'docs/ASSESSMENT_VALIDITY_GOVERNANCE.md', pattern: 'Assessment Validity & "Clinical-Grade" Capture (Engineering Evidence)' },
      { file: 'tools/validate-assessment-library-validity.ts', pattern: 'OK: assessment library validity checks passed' },
    ],
    notes:
      'Uses ALL-of evidence matching because the sentence is a compound claim (gamification + clinical-grade capture). This remains an existence/engineering-posture proof: gamification subsystems + UI mention assessments-as-points, plus a defined/validated “clinical-grade capture” posture.',
  },
  {
    id: 'intervention-library',
    label: 'Intervention Library exists (research-backed interventions)',
    sentenceRe: /\b(intervention library|research-?backed interventions?|evidence-?based interventions?|effect size|evidence level|tier\s*[123])\b/i,
    code: [
      { file: 'src/lib/interventions/intervention-library.ts', pattern: 'Evidence-Based Intervention Library' },
      { file: 'src/lib/interventions/intervention-library.ts', pattern: '100+ research-backed interventions' },
    ],
    notes: 'Anchors the existence of an intervention library and metadata such as evidence level/effect size fields.',
  },
  {
    id: 'research-hub-intervention-validation-scale',
    label: 'Research Hub intervention validation at scale is implemented and CI-validated',
    sentenceRe:
      /\b(research\s+hub)\b.*\b(validate|validation)\b.*\b(interventions?)\b|\b(validate|validation)\b.*\b(interventions?)\b.*\b(scale|thousands|at\s+a\s+scale)\b/i,
    code: [
      { file: 'docs/RESEARCH_HUB_INTERVENTION_VALIDATION.md', pattern: 'Research Hub — Intervention Validation (Engineering Evidence)' },
      { file: 'src/lib/research/intervention-validation.ts', pattern: 'validateInterventionEffectivenessAtScale' },
      { file: 'tools/validate-intervention-validation-scale.ts', pattern: 'intervention validation scale check passed' },
    ],
    notes:
      'Anchors deterministic aggregation + CI proof that segment-level intervention validation can run over thousands+ of anonymised records. Does not claim any particular real-world effect is present in production data.',
  },
  {
    id: 'research-hub-statistical-confidence-year3-wm',
    label: 'Research Hub: segment-level statistical confidence (Year 3 boys / working memory) is deterministically validated',
    sentenceRe:
      /\b(statistical\s+confidence)\b.*\b(year\s*3|y\s*3|3)\b.*\b(boys?|male|m)\b.*\bworking\s+memory\b/i,
    code: [
      { file: 'src/lib/research/intervention-validation.ts', pattern: 'ci95FromSample' },
      { file: 'src/lib/research/intervention-validation.ts', pattern: 'validateInterventionEffectivenessAtScale' },
      { file: 'tools/validate-intervention-validation-scale.ts', pattern: 'Precision Teaching works best for Year 3 boys with low working memory.' },
      { file: 'tools/validate-intervention-validation-scale.ts', pattern: 'Expected top segment to be Year 3 M low WM' },
    ],
    notes:
      'Anchors the exact segmentation claim to deterministic CI tooling. This is a proof that the platform can compute segment-level rankings + 95% confidence intervals; it does not claim a real-world intervention effect exists without real data.',
  },
  {
    id: 'research-hub-ethics-submission-workflow',
    label: 'Research Hub: Ethics Submission Workflow exists (UI + page)',
    sentenceRe: /\bethics\s+submission\s+workflow\b/i,
    code: [
      { file: 'src/app/[locale]/research/ethics/page.tsx', pattern: 'Research Ethics Submission Page' },
      { file: 'src/components/research/EthicsSubmissionForm.tsx', pattern: 'Research Ethics Submission Component' },
      { file: 'src/components/research/EthicsSubmissionForm.tsx', pattern: 'Ethics Submission Help' },
    ],
    notes:
      'Anchors an explicit ethics submission workflow surface (page + form component). Does not claim approval by any external ethics board.',
  },
  {
    id: 'research-hub-living-laboratory',
    label: 'Research Hub research foundation exists ("living laboratory")',
    sentenceRe: /\b(living\s+laboratory|not\s+just\s+a\s+software\s+platform|isn['’]?t\s+just\s+a\s+software\s+platform)\b/i,
    code: [
      { file: 'docs/RESEARCH_HUB_INTERVENTION_VALIDATION.md', pattern: 'What exists (repo anchors)' },
      { file: 'src/services/research-service.ts', pattern: 'Integrated Research Platform for EdPsych Connect World' },
      { file: 'prisma/schema.prisma', pattern: 'model research_studies' },
    ],
    notes:
      'Anchors the existence of a research foundation in the codebase (research models/services + validation documentation). This is an existence proof, not a claim of production outcomes.',
  },
  {
    id: 'report-generation',
    label: 'Report generation (PDF) exists',
    sentenceRe: /\b(report (generator|writing|draft)|generate report|report templates?|statutory advice|parent summary|pdf|word|docx|download|export)\b/i,
    code: [
      { file: 'src/lib/assessments/report-generator.ts', pattern: 'Assessment Report Generator' },
      { file: 'src/lib/assessments/report-generator.ts', pattern: 'downloadAssessmentReport' },
      { file: 'src/lib/reports/report-generator.ts', pattern: 'Professional report generation' },
    ],
    notes: 'Anchors report generation utilities; does not prove a particular end-to-end workflow is wired for every role/tenant.',
  },
  {
    id: 'ai-assistant-first-draft-report',
    label: 'AI assistant/report writer agent exists (can draft report text)',
    sentenceRe: /\bwrite\s+a\s+first\s+draft\b.*\breport\b/i,
    code: [
      { file: 'src/lib/ai-integration.ts', pattern: 'reportWriter:' },
      { file: 'src/lib/ai-integration.ts', pattern: 'AI-powered student report generation' },
      { file: 'src/lib/ai-integration.ts', pattern: 'Report Writer Agent' },
    ],
    notes:
      'Anchors that an AI report writer agent exists in the codebase. It does not claim the draft is fully correct without human review.',
  },
  {
    id: 'assessment-report-receipt',
    label: 'Assessment report upload/linking exists ("received an assessment report")',
    sentenceRe: /\byou['’]ve\s+received\s+an\s+assessment\s+report\b/i,
    code: [
      { file: 'src/app/api/assessments/[id]/report/route.ts', pattern: 'linked_report_id' },
      { file: 'src/app/api/assessments/[id]/report/route.ts', pattern: "documentType: 'ASSESSMENT_REPORT'" },
      { file: 'src/lib/multi-tenant.ts', pattern: 'Your student report is ready' },
    ],
    notes:
      'Anchors that assessment reports can be uploaded, stored as secure documents, and linked to an assessment instance, and that the product has a “report is ready” notification subject template.',
  },
  {
    id: 'onboarding-dashboard-first',
    label: 'Dashboard exists (anchor for onboarding line "First, your Dashboard.")',
    sentenceRe: /\bfirst,\s+your\s+dashboard\b/i,
    code: [
      { file: 'src/app/[locale]/dashboard/page.tsx', pattern: 'Dashboard' },
      { file: 'src/components/onboarding/FeatureExplainer.tsx', pattern: 'Welcome to Your Command Center' },
    ],
    notes:
      'Anchors the existence of a Dashboard and onboarding framing around it. This does not assert a specific dashboard widget set beyond the implemented UI/components.',
  },
  {
    id: 'la-dashboard-colour-coded-urgency',
    label: 'LA dashboard uses colour-coded risk/urgency indicators',
    sentenceRe: /\bdashboard\s+is\s+colou?r-?coded\s+by\s+urgency\b/i,
    code: [
      { file: 'src/components/ehcp/LADashboard.tsx', isRegex: true, pattern: 'bg-(red|yellow|green)-' },
      { file: 'src/app/[locale]/la/dashboard/page.tsx', pattern: 'LADashboard' },
    ],
    notes:
      'Anchors that LA dashboard UI includes explicit red/yellow/green thresholding styles used to signal urgency/risk/compliance status.',
  },
  {
    id: 'ehcp-contributions-reports-incoming',
    label: 'EHCP workflow: professional contributions/reports are requested and tracked ("reports coming in")',
    sentenceRe: /\breports\s+coming\s+in\s+from\s+all\s+angles\b/i,
    code: [
      { file: 'src/app/api/la/applications/[id]/decision/route.ts', pattern: 'AGREE_TO_ASSESS' },
      { file: 'src/app/api/la/applications/[id]/decision/route.ts', pattern: 'eHCPContribution' },
      { file: 'src/components/ehcp/ProfessionalContributionPortal.tsx', pattern: 'Professional Contribution Portal' },
      { file: 'src/components/ehcp/ProfessionalContributionPortal.tsx', pattern: 'Draft' },
    ],
    notes:
      'Anchors that when an assessment/decision workflow kicks off, contribution requests can be created and tracked in a portal, aligning with the “reports coming in” concept.',
  },
  {
    id: 'voice-troubleshooting-self-heal',
    label: 'Voice troubleshooting can diagnose and often auto-fix common report/assessment issues',
    sentenceRe:
      /\bI\s+can['’]?t\s+find\s+the\s+report\b|\bThe\s+assessment\s+is\s+stuck\b|\bfix\s+the\s+issue\s+for\s+you\b/i,
    code: [
      { file: 'src/lib/orchestration/voice-command.service.ts', pattern: 'troubleshoot_report' },
      { file: 'src/lib/orchestration/voice-command.service.ts', pattern: 'troubleshoot_assessment' },
      { file: 'src/lib/orchestration/voice-command.service.ts', pattern: 'attemptAutoRepair' },
    ],
    notes:
      'Anchors explicit troubleshooting intents and an auto-repair helper in the voice command service. This is intended to support “can often fix” (not “always fix”).',
  },
  {
    id: 'assessment-results-visualisation',
    label: 'Assessment results are visualised (profile/percentile charts)',
    sentenceRe: /\bour\s+platform\s+visuali[sz]es\s+this\s+for\s+you\b/i,
    code: [
      { file: 'src/components/assessments/ResultsAnalysis.tsx', pattern: 'Visual Profile' },
      { file: 'src/components/assessments/ResultsAnalysis.tsx', pattern: 'Score Profile Chart' },
      { file: 'src/components/assessments/ResultsAnalysis.tsx', pattern: 'Percentile Ranks' },
    ],
    notes:
      'Anchors the presence of visual analytics UI (profile charts + percentile charts) used to help interpret assessment results.',
  },
  {
    id: 'ai-report-writing-support',
    label: 'AI report writing support is referenced in orchestration/demos',
    sentenceRe: /\b(ai|agent)\b.*\b(report|write|draft|narrative|template)\b|\b(report writer)\b/i,
    code: [
      { file: 'src/lib/ai/ai-orchestrator.service.ts', pattern: 'Report Writing Support' },
      { file: 'src/services/ai/living-demos.ts', pattern: 'generateReportWritingDemo' },
    ],
    notes: 'This anchors AI report-writing related code paths; it does not verify specific % time-savings claims.',
  },
  {
    id: 'lesson-differentiation-engine',
    label: 'Lesson differentiation/personalisation engine exists',
    sentenceRe:
      /\b(no child left behind|differentiat(e|ed|ion)|differentiated versions?|personalised version|dyslexia-?friendly|chunk(ed)? instructions?|visual supports?|scaffolding|reading levels? adjust)\b/i,
    code: [
      { file: 'src/lib/orchestration/assignment-engine.service.ts', pattern: 'differentiateLessonContent' },
      { file: 'src/lib/engines/lesson-personalization.engine.ts', pattern: 'SEND_ADAPTATIONS' },
      { file: 'src/lib/engines/lesson-personalization.engine.ts', pattern: 'OpenDyslexic' },
      { file: 'src/components/orchestration/LessonDifferentiationView.tsx', pattern: 'Lesson Differentiation View Component' },
    ],
    notes: 'Anchors differentiation/personalisation engines and UI; does not guarantee per-student generation counts/performance claims.',
  },
  {
    id: 'nclb-profiles-built-from-assessments-and-observations',
    label: 'Student profiles are built from assessments + observations (repo anchor)',
    sentenceRe: /\btheir\s+profiles,\s+built\s+from\s+assessments\s+and\s+observations,\s+are\s+already\s+in\s+the\s+platform\b/i,
    code: [
      {
        file: 'src/lib/orchestration/profile-builder.service.ts',
        pattern: 'Script anchor: Their profiles, built from assessments and observations, are already in the platform.',
      },
      {
        file: 'src/lib/orchestration/profile-builder.service.ts',
        pattern: 'Teacher observations and flagging',
      },
      {
        file: 'src/app/api/students/[id]/profile/route.ts',
        pattern: 'Auto-built student profile management',
      },
    ],
    notes:
      'Anchors the exact script phrasing to the profile builder service data sources and to the auto-built student profile API surface.',
  },
  {
    id: 'nclb-system-does-something-remarkable',
    label: '“System does something remarkable” refers to automated differentiation/assignment pipeline',
    sentenceRe: /\bthen\s+our\s+system\s+does\s+something\s+remarkable\b/i,
    code: [
      {
        file: 'src/lib/orchestration/assignment-engine.service.ts',
        pattern: 'Then our system does something remarkable.',
      },
      {
        file: 'src/lib/orchestration/assignment-engine.service.ts',
        pattern: 'assignLessonsToClass',
      },
      {
        file: 'src/lib/orchestration/assignment-engine.service.ts',
        pattern: 'differentiateLessonContent',
      },
    ],
    notes:
      'Anchors the script sentence to deterministic repo strings and to the concrete automation workflow (differentiate + assign).',
  },
  {
    id: 'platform-definition-question',
    label: 'Platform definition exists (repo anchor for “what is this platform?”)',
    sentenceRe: /\bso\s+what\s+actually\s+is\s+this\s+platform\?/i,
    code: [{ file: 'docs/PLATFORM_DEFINITION.md', pattern: 'So what actually is this platform?' }],
    notes: 'Anchors the exact phrasing to a deterministic product-definition doc (not code-generated scripts).',
  },
  {
    id: 'platform-thirty-versions-tailored',
    label: 'Per-student lesson differentiation/assignment supports “thirty versions” framing (repo anchor)',
    sentenceRe:
      /\bautomatically\s+generates\s+thirty\s+different\s+versions,\s+each\s+tailored\s+to\s+a\s+specific\s+student['’]s\s+needs\b/i,
    code: [
      {
        file: 'src/lib/orchestration/assignment-engine.service.ts',
        pattern: "And our system automatically generates thirty different versions, each tailored to a specific student's needs.",
      },
      {
        file: 'src/lib/orchestration/assignment-engine.service.ts',
        pattern: '40 students, 40 personalized',
      },
      {
        file: 'src/lib/orchestration/assignment-engine.service.ts',
        pattern: 'assignLessonsToClass',
      },
    ],
    notes:
      'Anchors the “thirty versions” sentence to deterministic repo strings and to the class-level assignment pipeline that creates per-student assignments based on profiles.',
  },
  {
    id: 'trust-built-by-me',
    label: 'Founder-built provenance exists (repo anchor for “built by me”)',
    sentenceRe: /\bedpsych\s*connect\s+was\s+built\s+by\s+me\b/i,
    code: [
      { file: 'src/app/[locale]/about/page.tsx', pattern: 'EdPsych Connect was built by me.' },
      { file: 'src/app/[locale]/about/page.tsx', pattern: 'Founder & Developer' },
    ],
    notes:
      'Anchors the exact script phrasing to deterministic repo strings and to the About page founder role/biography.',
  },
  {
    id: 'trust-designed-by-a-colleague',
    label: 'Designed by practitioners/colleagues positioning exists (repo anchor)',
    sentenceRe:
      /\bwhen\s+you\s+use\s+this\s+platform,\s+you['’]re\s+using\s+something\s+designed\s+by\s+a\s+colleague\b/i,
    code: [
      {
        file: 'src/app/[locale]/about/page.tsx',
        pattern: "When you use this platform, you're using something designed by a colleague.",
      },
      {
        file: 'src/components/pricing/PricingPage.tsx',
        pattern: 'built by educational professionals for educational professionals',
      },
    ],
    notes:
      'Anchors the exact script sentence to deterministic repo strings and pairs it with existing positioning anchored elsewhere in the product UI.',
  },
  {
    id: 'battle-royale-gamification',
    label: 'Battle Royale gamification system exists',
    sentenceRe:
      /\b(battle royale|leaderboards?|merit badges?|squad competitions?|matchmaking|engagement|response times?|learning trajectories)\b/i,
    code: [
      { file: 'src/lib/gamification/battle-royale.ts', pattern: 'Battle Royale Gamification System' },
      { file: 'src/lib/gamification/merit-system.ts', pattern: 'Merit System' },
      { file: 'src/lib/gamification/squad-competitions.ts', pattern: 'Squad Competition System' },
    ],
    notes: 'Anchors gamification subsystems; does not validate psychometrics/clinical-grade claims without separate evidence.',
  },
  {
    id: 'gamification-psychology-embedded',
    label: 'Gamification psychology is embedded in the product (anchor for script wording)',
    sentenceRe: /\b(?:we['’]ve\s+brought\s+that\s+psychology\s+into\s+edpsych\s*connect)\b/i,
    code: [
      { file: 'src/lib/gamification/bridge.ts', pattern: "We've brought that psychology into EdPsych Connect." },
      { file: 'src/lib/gamification/battle-royale.ts', pattern: 'Battle Royale Gamification System' },
    ],
    notes:
      'Anchors a deterministic repo string for the script sentence, plus a concrete gamification subsystem. This is an existence proof, not a claim about measured psychological outcomes.',
  },
  {
    id: 'onboarding-built-by-educational-professionals',
    label: 'Built by educational professionals (repo anchor for onboarding wording)',
    sentenceRe: /\bedpsych\s+connect\s+world\s+was\s+built\s+by\s+educational\s+professionals\s+for\s+educational\s+professionals\b/i,
    code: [
      {
        file: 'src/components/pricing/PricingPage.tsx',
        pattern: 'EdPsych Connect World was built by educational professionals for educational professionals.',
      },
    ],
    notes:
      'Anchors the exact script phrasing to a deterministic repo string (comment anchor). This is an attribution/positioning statement, not a claim of third-party certification.',
  },
  {
    id: 'security-continuous-process-support',
    label: 'Security is a continuous process (repo anchor + CI enforcement)',
    sentenceRe: /\bit['’]s\s+a\s+continuous\s+process\b.*\bbuild\s+the\s+platform\b.*\bsupport\s+that\s+reality\b/i,
    code: [
      {
        file: 'docs/SECURITY_BY_DESIGN.md',
        pattern: "It's a continuous process — and we build the platform to support that reality.",
      },
      {
        file: 'package.json',
        pattern: 'security:scan',
      },
      {
        file: 'package.json',
        pattern: 'test:security-by-design',
      },
    ],
    notes:
      'Anchors the “continuous process” phrasing to our security-by-design documentation and to deterministic CI checks (security-by-design + security scan) wired into verify:ci.',
  },
  {
    id: 'ehcp-platform-changes-that',
    label: 'EHCP workflow: platform changes that (repo anchor for script wording)',
    sentenceRe: /\bour\s+platform\s+changes\s+that\b/i,
    code: [
      { file: 'src/components/ehcp/EHCPWizardForm.tsx', pattern: 'Our platform changes that.' },
      { file: 'src/components/ehcp/LiveEHCPEditor.tsx', pattern: 'EHCP' },
    ],
    notes:
      'Anchors the exact phrasing to the EHCP workflow code and includes a nearby concrete EHCP feature anchor. This is a positioning statement, not a measurable KPI claim.',
  },
  {
    id: 'ehcp-professional-contributions-not-just-dump',
    label: 'Professional contributions: not just dumping reports (repo anchor)',
    sentenceRe: /\bhere['’]s\s+the\s+magic\s+of\s+edpsych\s*connect\s*:\s*we\s+don['’]t\s+just\s+dump\s+these\s+reports\s+on\s+you\b/i,
    code: [
      {
        file: 'src/components/ehcp/ProfessionalContributionPortal.tsx',
        pattern: "Here's the magic of EdPsych Connect: we don't just dump these reports on you.",
      },
      { file: 'src/components/ehcp/EHCPMergeTool.tsx', pattern: 'Merge' },
    ],
    notes:
      'Anchors the exact script phrasing to a deterministic repo string (comment anchor) and pairs it with a concrete EHCP merge capability anchor.',
  },
  {
    id: 'data-sovereignty-byod',
    label: 'BYOD/data sovereignty strategy exists',
    sentenceRe:
      /\b(byod|bring your own database|data sovereignty|your data stays yours|data stays yours|never\s+hoard|don\'?t\s+hoard|do not\s+hoard|we\s+process\s+it,?\s+but\s+we\s+(?:don\'?t|do\s+not)\s+(?:own|hoard))\b/i,
    code: [
      { file: 'src/lib/integrations/strategy.ts', pattern: 'BYOD - Bring Your Own Database' },
      { file: 'tools/test-byod-db-url.ts', pattern: 'DATABASE_URL' },
    ],
    notes: 'Anchors the repo’s BYOD/data sovereignty strategy and BYOD-related tooling; it does not prove a specific customer deployment topology.',
  },
  {
    id: 'audit-trail-and-data-access-logging',
    label: 'Audit trail + data access logging exists',
    sentenceRe: /\b(audit trail|audit log|log everything|who (looked at|accessed)|data access|access logs?)\b/i,
    code: [
      { file: 'src/lib/security/audit-logger.ts', pattern: 'GDPR-compliant audit trail' },
      { file: 'src/lib/security/audit-logger.ts', pattern: 'DATA_READ' },
      { file: 'tools/verify-audit-log-integrity.ts', pattern: 'verify' },
    ],
    notes: 'Anchors audit logging primitives and audit integrity tooling; does not guarantee historic retention windows.',
  },
  {
    id: 'security-audits-and-headers',
    label: 'Security audit + security headers tooling exists',
    sentenceRe: /\b(security audits?|penetration testing|security headers|csp|hsts)\b/i,
    code: [
      { file: 'src/services/security-hardening.ts', pattern: 'performSecurityAudit' },
      { file: 'src/services/security-hardening.ts', pattern: 'Content Security Policy' },
      { file: 'src/services/security-hardening.ts', pattern: 'HTTP Strict Transport Security' },
    ],
    notes: 'Anchors internal security hardening/audit utilities; does not prove external certification or completed pen tests.',
  },
  {
    id: 'security-built-in-statement',
    label: 'Security posture is implemented ("security is built in")',
    sentenceRe: /\bsecurity\s+is\s+built\s+in\b/i,
    code: [
      { file: 'src/services/security-hardening.ts', pattern: 'Security Hardening Service' },
      { file: 'src/services/security-hardening.ts', pattern: 'performSecurityAudit' },
      { file: 'src/lib/security/audit-logger.ts', pattern: 'GDPR-compliant audit trail' },
      { file: 'src/lib/middleware/auth.ts', pattern: 'ROLE_PERMISSIONS' },
    ],
    notes:
      'Anchors in-repo security hardening, audit logging, and RBAC primitives. This does not prove external certification; it proves security-related implementation exists.',
  },
  {
    id: 'security-by-design-posture',
    label: 'Security-by-design posture is documented and CI-enforced',
    sentenceRe:
      /\b(here(?:'s|\s+is)\s+what\s+we\s+mean\s+by\s+(?:["“”'‘’]?security\s+by\s+design["“”'‘’]?)|security\s+is\s+not\s+a\s+one-?off\s+checklist|security\s+isn['’]?t\s+a\s+feature\s+you\s+see|security\s+isn['’]?t\s+a\s+feature\s+[-—–]\s*it(?:'s|\s+is)\s+the\s+foundation)\b/i,
    code: [
      { file: 'docs/SECURITY_BY_DESIGN.md', pattern: 'Security by Design (Engineering Evidence)' },
      { file: 'docs/SECURITY_BY_DESIGN.md', pattern: 'Security is not a one-off checklist.' },
      { file: 'tools/validate-security-by-design.ts', pattern: 'OK: security-by-design posture validated' },
      { file: 'src/lib/middleware/auth.ts', pattern: 'ROLE_PERMISSIONS' },
      { file: 'src/lib/security/audit-logger.ts', pattern: 'GDPR-compliant audit trail' },
      { file: 'src/lib/security/encryption.ts', pattern: 'aes-256-gcm' },
      { file: 'middleware.ts', pattern: 'maybeRateLimitRsc' },
    ],
    notes:
      'Anchors security-by-design wording to documented controls and a deterministic CI validator. This does not claim external certifications; it proves in-repo security primitives and enforcement exist.',
  },
  {
    id: 'zero-trust-posture',
    label: 'Zero Trust posture is defined and CI-enforced (deny-by-default + least privilege)',
    sentenceRe: /\bzero\s*[- ]\s*trust\b/i,
    code: [
      { file: 'docs/SECURITY_BY_DESIGN.md', pattern: 'Zero Trust' },
      { file: 'docs/SECURITY_BY_DESIGN.md', pattern: 'deny-by-default' },
      { file: 'docs/SECURITY_BY_DESIGN.md', pattern: 'least-privilege' },
      { file: 'tools/validate-security-by-design.ts', pattern: 'Zero Trust' },
      { file: 'src/lib/middleware/auth.ts', pattern: 'ROLE_PERMISSIONS' },
      { file: 'src/lib/security/audit-logger.ts', pattern: 'GDPR-compliant audit trail' },
      { file: 'src/lib/security/encryption.ts', pattern: 'aes-256-gcm' },
    ],
    notes:
      'Anchors the phrase “Zero Trust” to a repo-defined meaning (deny-by-default + least privilege) and an enforcement validator. This is not a claim of external certification.',
  },
  {
    id: 'parent-portal-plain-english',
    label: 'Parent Portal provides parent-scoped, plain-English summaries with strict relationship verification',
    sentenceRe:
      /\bparent\s+portal\b|\bwindow\s+into\s+your\s+child(?:\s*\’s|'s)?\s+support\b|\bplain-?english\b.*\b(breakdown|summary|explain)\b/i,
    code: [
      { file: 'src/components/orchestration/ParentPortal.tsx', pattern: "Parent-scoped view of their child's progress in plain English" },
      { file: 'src/components/orchestration/ParentPortal.tsx', pattern: 'Download Report' },
      { file: 'src/app/api/parent/portal/[childId]/route.ts', pattern: 'Strict parent-child relationship verification' },
      { file: 'src/app/api/parent/portal/[childId]/route.ts', pattern: 'Education jargon translated to plain English' },
      { file: 'src/app/api/parent/portal/[childId]/route.ts', pattern: 'CRITICAL SECURITY: Verifies parent-child relationship' },
      { file: 'src/app/api/parent/portal/[childId]/route.ts', pattern: 'Plain English summary' },
    ],
    notes:
      'Anchors that a parent-scoped portal exists, includes plain-English translation/summaries, and enforces parent-child relationship checks before returning data.',
  },
  {
    id: 'dashboard-command-centre',
    label: 'Dashboard as a “command centre” / cockpit has repo anchors',
    sentenceRe: /\b(dashboard)\b.*\b(command\s+cent(re|er)|cockpit)\b|\bcommand\s+cent(re|er)\b/i,
    code: [
      { file: 'src/components/orchestration/TeacherClassDashboard.tsx', pattern: 'Main command center for teachers' },
      { file: 'src/app/api/class/dashboard/route.ts', pattern: "Returns teacher's command center data" },
      { file: 'src/components/onboarding/FeatureExplainer.tsx', pattern: 'Welcome to Your Command Center' },
      { file: 'src/app/[locale]/la/dashboard/page.tsx', pattern: 'LA Dashboard Page' },
    ],
    notes:
      'Anchors “command centre/cockpit” framing to existing dashboard implementations and API routes. Does not imply a specific role/feature set beyond what those routes/components implement.',
  },
  {
    id: 'security-seriousness-posture',
    label: 'Security seriousness posture is documented and CI-enforced',
    sentenceRe: /\b(we\s+approach\s+security\s+like\s+this\s+data\s+deserves\s*:\s+with\s+absolute\s+seriousness|with\s+absolute\s+seriousness)\b/i,
    code: [
      { file: 'docs/SECURITY_BY_DESIGN.md', pattern: 'absolute seriousness' },
      { file: 'tools/validate-security-by-design.ts', pattern: 'OK: security-by-design posture validated' },
      { file: 'src/services/security-hardening.ts', pattern: 'Security Hardening Service' },
      { file: 'src/lib/security/audit-logger.ts', pattern: 'GDPR-compliant audit trail' },
      { file: 'src/lib/security/encryption.ts', pattern: 'aes-256-gcm' },
    ],
    notes:
      'Anchors the rhetorical seriousness statement to concrete in-repo security controls and a deterministic CI validator. It does not assert external certification or outcomes; it asserts a maintained engineering posture.',
  },
  {
    id: 'nhs-level-security-baseline',
    label: 'NHS-level security phrasing is defined as a concrete baseline and CI-enforced',
    sentenceRe: /\bnhs-?level\b.*\b(security|data\s+security)\b/i,
    code: [
      { file: 'docs/SECURITY_BY_DESIGN.md', pattern: 'NHS-level data security' },
      { file: 'docs/COMPLIANCE_PACK.md', pattern: 'NHS-level data security' },
      { file: 'tools/validate-security-by-design.ts', pattern: 'NHS-level data security' },
      { file: 'src/lib/security/encryption.ts', pattern: 'AES-256-GCM' },
      { file: 'src/lib/security/audit-logger.ts', pattern: 'Audit event types' },
      { file: 'src/lib/middleware/auth.ts', pattern: 'Permission types for role-based access control' },
    ],
    notes:
      'Anchors NHS-level security phrasing to a documented engineering baseline + enforcement. This does not prove NHS certification; it proves the baseline controls described are present and guarded against regression.',
  },
  {
    id: 'cpd-tracking-and-certificates',
    label: 'CPD tracking/certificates UI exists',
    sentenceRe: /\b(cpd|continuing professional development|certificate|certificates|portfolio)\b/i,
    code: [
      { file: 'src/components/training/CPDTracker.tsx', pattern: 'CPDTracker' },
      { file: 'src/components/training/CoursePlayer.tsx', pattern: 'View Certificate' },
      { file: 'src/components/training/CoursePlayer.tsx', pattern: 'CPD Hours:' },
    ],
    notes: 'Anchors CPD tracking/certificate UI; does not prove regulatory acceptance of generated certificates.',
  },
  {
    id: 'rbac-and-least-privilege',
    label: 'Role-based access control (RBAC) / permissions exist',
    sentenceRe:
      /\b(role-?based|rbac|permissions?|least privilege|principle of least privilege|only see what they need|access control)\b/i,
    code: [
      { file: 'src/lib/middleware/auth.ts', pattern: 'Role to permissions mapping' },
      { file: 'src/lib/middleware/auth.ts', pattern: 'ROLE_PERMISSIONS' },
      { file: 'src/lib/auth/auth-service.ts', pattern: 'role-based access' },
      { file: 'src/lib/auth/auth-service.ts', pattern: 'requirePermissions' },
    ],
    notes: 'Anchors RBAC/permission checks; does not prove a formal least-privilege audit has been completed.',
  },
  {
    id: 'secrets-as-config-and-ci-guardrails',
    label: 'Secrets are handled via environment variables + CI/validation guardrails exist',
    sentenceRe:
      /\b(secrets?|credentials?|api keys?|environment variables?|env vars?|config(uration)? not code|guardrails?|ci\b|leakage|hardcoded)\b/i,
    code: [
      { file: 'src/app/api/video/heygen-url/route.ts', pattern: 'process.env' },
      { file: 'tools/generate-onboarding-video.ts', pattern: 'Safe diagnostics: never print secret values.' },
      { file: 'tools/validate-video-claims.ts', pattern: 'VIDEO_CLAIMS_ENFORCE_CODE_SEARCH' },
      { file: 'tools/gate-release.ps1', pattern: ".env files don't clobber real environment variables" },
    ],
    notes: 'Anchors env-var usage and CI/validation tooling; does not prove a specific secret scanning vendor/tool is in use.',
  },
  {
    id: 'consent-management-gdpr',
    label: 'Consent management (GDPR) tooling exists',
    sentenceRe: /\b(consent manager|withdraw consent|lawful basis|competenc(y|e)|gdpr consent|consent preferences)\b/i,
    code: [
      { file: 'src/middleware/gdpr-compliance.ts', pattern: 'ConsentCookie' },
      { file: 'src/middleware/gdpr-compliance.ts', pattern: 'handleWithdrawConsent' },
      { file: 'src/middleware/gdpr-compliance.ts', pattern: 'logConsentEvent' },
      { file: 'src/contexts/CookieConsentContext.tsx', pattern: 'Cookie Consent Context' },
    ],
    notes: 'Anchors consent handling for GDPR/cookies. Child assessment consent (clinical/legal) may require additional, separate evidence.',
  },
  {
    id: 'consent-foundation-statement',
    label: 'Consent-first posture is explicitly implemented across consent tooling',
    sentenceRe: /\bconsent\s+is\s+the\s+foundation\b/i,
    code: [
      { file: 'src/lib/gdpr-compliance.ts', pattern: 'CONSENT MANAGEMENT' },
      { file: 'src/middleware/gdpr-compliance.ts', pattern: 'handleConsentRequest' },
      { file: 'src/middleware/gdpr-compliance.ts', pattern: 'handleWithdrawConsent' },
      { file: 'src/lib/collaboration/multi-agency.service.ts', pattern: 'Withdraw consent' },
      { file: 'src/lib/portal/parent-portal.service.ts', pattern: "type: 'document_review' | 'consent_form'" },
    ],
    notes:
      'Anchors that consent is treated as a first-class concept across middleware/services. This does not prove legal sufficiency for every scenario; it proves that consent workflows exist in the repo.',
  },
  {
    id: 'older-student-consent-prompt',
    label: 'UI prompts consideration of older-student consent capacity',
    sentenceRe: /\bolder\s+students?\b.*\b(can\s+give|give)\b.*\b(?:their\s+own\s+)?consent\b/i,
    code: [
      {
        file: 'src/components/ehcp/SchoolSubmissionInterface.tsx',
        isRegex: true,
        pattern: 'prompts\\s+you\\s+to\\s+consider\\s+if\\s+they\\s+can\\s+give\\s+their\\s+own\\s+consent',
      },
    ],
    notes:
      'Anchors a concrete UI prompt to consider capacity to consent for older students. It intentionally does not automate a legal decision.',
  },
  {
    id: 'pricing-plans-and-slas',
    label: 'Pricing plans/addons and SLA/support statements exist in code',
    sentenceRe:
      /\b(pricing|plans?|tiers?|subscription|add-?ons?|\£\d+|support responds|response sla|uptime sla|99\.9%|priority support)\b/i,
    code: [
      { file: 'src/components/pricing/PricingPage.tsx', pattern: 'addons:' },
      { file: 'src/components/pricing/PricingPage.tsx', pattern: '£49.99/mo' },
      { file: 'src/lib/subscription/plans.ts', pattern: 'response SLA' },
      { file: 'src/lib/subscription/plans.ts', pattern: '99.9% uptime' },
    ],
    notes: 'Anchors in-repo pricing/SLA copy. Does not prove external contractual commitments for a given customer without signed terms.',
  },
  {
    id: 'subscription-addons-page-definitions',
    label: 'Add-on definitions (AI Power Pack / API Access / White Label) exist',
    sentenceRe:
      /\b(ai power pack|addon ai power|api access|restful api|white label|custom (?:logo|brand(?:ing)?|domain)|branded welcome messages)\b/i,
    code: [
      { file: 'src/app/[locale]/subscription/addon/page.tsx', pattern: 'ADDON_AI_POWER' },
      { file: 'src/app/[locale]/subscription/addon/page.tsx', pattern: 'AI Power Pack' },
      { file: 'src/app/[locale]/subscription/addon/page.tsx', pattern: 'ADDON_API_ACCESS' },
      { file: 'src/app/[locale]/subscription/addon/page.tsx', pattern: 'Full RESTful API coverage' },
      { file: 'src/app/[locale]/subscription/addon/page.tsx', pattern: 'ADDON_WHITE_LABEL' },
      { file: 'src/app/[locale]/subscription/addon/page.tsx', pattern: 'Custom domain support' },
    ],
    notes: 'Anchors the in-repo add-on catalogue copy and feature bullets; does not prove every bullet is fully implemented end-to-end.',
  },
  {
    id: 'addon-ai-power-pack-features',
    label: 'AI Power Pack related features exist (Study Buddy / Problem Solver / ethics scaffolding)',
    sentenceRe:
      /\b(ai power pack|study buddy|problem solver|ai safety|ai ethics|ethics monitor)\b/i,
    code: [
      { file: 'src/app/[locale]/subscription/addon/page.tsx', pattern: 'Study Buddy for students' },
      { file: 'src/app/[locale]/subscription/addon/page.tsx', pattern: 'Problem Solver AI' },
      { file: 'src/app/api/study-buddy/chat/route.ts', pattern: 'Study Buddy' },
      { file: 'src/app/api/problem-solver/route.ts', pattern: 'Problem Solver API Endpoint' },
      { file: 'src/lib/ethics/models/EthicsMonitor.js', pattern: 'Ethics Monitor Model' },
    ],
    notes: 'Anchors specific AI features referenced in scripts. This does not verify marketing superlatives (e.g., “most useful”).',
  },
  {
    id: 'ai-nontraining-posture',
    label: 'AI non-training posture is explicit + validated by tooling',
    sentenceRe:
      /\b(student queries?|queries?)\b.*\b(aren\s*'?t|are not)\b.*\btraining\b.*\b(ai\s+)?models?\b|\bprivacy protection\b.*\btraining\b.*\bmodels?\b/i,
    code: [
      { file: 'src/lib/ai/data-use-policy.ts', pattern: 'trainOnStudentQueries: false' },
      { file: 'src/lib/governance/policy-engine.ts', pattern: 'allowTraining' },
      { file: 'src/lib/governance/policy-engine.ts', pattern: 'allowTraining: false' },
      { file: 'docs/AI_DATA_USE.md', pattern: "student queries aren't training future AI models" },
      { file: 'tools/validate-ai-nontraining.ts', pattern: 'OK: AI non-training posture validated' },
      { file: 'tools/test-ai-governance.ts', pattern: 'Expected allowTraining=false by default' },
    ],
    notes:
      'Anchors an explicit in-repo policy constant + tenant governance default + deterministic CI validation. This is evidence of product posture (no training pipeline) rather than third-party provider terms.',
  },
  {
    id: 'ai-output-not-evidence',
    label: 'AI output is not evidence (human-in-the-loop) posture is documented',
    sentenceRe: /\b(ai\s+output\s+is\s+not\s+evidence|never\s+let\s+ai\s+output\s+become\s+evidence)\b/i,
    code: [
      { file: 'docs/AI_DATA_PRIVACY_WHITEPAPER.md', pattern: 'AI output is not evidence' },
      { file: 'docs/AI_DATA_PRIVACY_WHITEPAPER.md', pattern: 'Never let AI output become evidence' },
      { file: 'docs/AI_DATA_PRIVACY_WHITEPAPER.md', pattern: 'Human-in-the-Loop' },
    ],
    notes:
      'Anchors a documented posture: AI drafting assistance is not treated as objective evidence and must be reviewed by a qualified practitioner.',
  },
  {
    id: 'ai-governance-not-anti-ai',
    label: 'Good governance is not anti-AI (guardrails enable safe use)',
    sentenceRe: /\bgood\s+governance\s+isn['’]?t\s+anti-?ai\b/i,
    code: [{ file: 'docs/AI_DATA_PRIVACY_WHITEPAPER.md', pattern: "Good governance isn't anti-AI" }],
    notes: 'Anchors the governance stance as a documented principle in the AI safety whitepaper.',
  },
  {
    id: 'addon-ai-power-pack-price',
    label: 'AI Power Pack price anchors exist (£49.99)',
    sentenceRe: /\b(£\s*49\.99|49\.99|forty[-\s]?nine\s+ninety[-\s]?nine)\b/i,
    code: [
      { file: 'src/components/pricing/PricingPage.tsx', pattern: '£49.99/mo' },
      { file: 'src/app/[locale]/subscription/addon/page.tsx', pattern: 'priceMonthly: 4999' },
    ],
    notes: 'Anchors pricing copy in the repo. Does not prove a customer’s final invoiced price after taxes/discounts.',
  },
  {
    id: 'api-access-addon-and-usage-tracking',
    label: 'API Access add-on and API usage tracking exist',
    sentenceRe:
      /\b(api access|restful api|programmatic(ally)?|webhooks?|platform events|data warehouse|integrations?)\b/i,
    code: [
      { file: 'src/app/[locale]/subscription/addon/page.tsx', pattern: 'ADDON_API_ACCESS' },
      { file: 'src/app/[locale]/subscription/addon/page.tsx', pattern: 'Full RESTful API access' },
      { file: 'src/research/foundation/api-access/models/api-usage.ts', pattern: 'Response status code' },
      { file: 'src/research/foundation/api-access/services/usage-tracking-service.ts', pattern: 'statusCode' },
    ],
    notes: 'Anchors the existence of an API access concept + usage tracking code. It does not prove “everything is exposed” or specific integrations.',
  },
  {
    id: 'white-label-multi-tenant-system',
    label: 'White-labeling / multi-tenant branding system exists',
    sentenceRe:
      /\b(white\s*label|white\-label|whitelabel|custom brand(?:ing)?|custom (?:logo|colour|color) scheme|custom domain|subdomain|tenant branding|present (?:the\s+)?(?:ehcp\s+)?portal as (?:their|your) own|as (?:their|your) own service)\b/i,
    code: [
      { file: 'src/lib/multi-tenant.ts', pattern: 'Multi-Tenant White-Labeling System' },
      { file: 'src/lib/multi-tenant.ts', pattern: 'WhiteLabelConfig' },
      { file: 'src/lib/auth/server-auth.ts', pattern: 'branding:' },
      { file: 'src/app/[locale]/subscription/addon/page.tsx', pattern: 'ADDON_WHITE_LABEL' },
    ],
    notes: 'Anchors white-label related configuration structures in the repo; does not prove a specific tenant is configured with a custom domain in production.',
  },
  {
    id: 'assessment-ai-analysis-insights',
    label: 'Assessment analytics mentions AI insights/analysis',
    sentenceRe: /\b(ai analysis|ai insights|ai\s+analysis)\b/i,
    code: [
      { file: 'src/lib/assessment/assessment-analytics.service.ts', pattern: 'getAIInsights' },
      { file: 'src/lib/assessment/assessment-analytics.service.ts', pattern: 'Would generate AI analysis' },
      { file: 'src/services/ai-service.ts', pattern: 'aiAnalysis' },
    ],
    notes: 'Anchors AI insight/analysis references in analytics/services. This does not prove any specific accuracy/performance guarantees.',
  },
  {
    id: 'secure-link-sharing',
    label: 'Secure, time-limited link sharing is documented in repo knowledge base',
    sentenceRe:
      /\b(secure\s*,?\s*tracked|secure link|time\-limited|share via secure link)\b/i,
    code: [
      { file: 'src/lib/knowledge/platform-knowledge.ts', pattern: 'Share via secure link (time-limited)' },
      { file: 'src/lib/knowledge/platform-knowledge.ts', pattern: 'Sharing Options:' },
    ],
    notes: 'Anchors that secure-link sharing is described in in-repo platform guidance; does not prove access control semantics for every share type.',
  },
  {
    id: 'professional-requests-reminders',
    label: 'Multi-agency advice portal + reminders/nudges exist (LA workflow UI)',
    sentenceRe:
      /\b(request portal|advice portal|professional requests?|send reminders?|automated (?:reminders|chasers)|nudge|response status|opened it|drafting)\b/i,
    code: [
      { file: 'src/components/la-panel/EHCPWorkflow.tsx', pattern: 'Multi-Agency Advice Portal' },
      { file: 'src/components/la-panel/EHCPWorkflow.tsx', pattern: 'Automated reminders have been sent.' },
      { file: 'src/components/la-panel/EHCPWorkflow.tsx', pattern: 'Nudge' },
      { file: 'src/components/la-panel/EHCPWorkflow.tsx', pattern: 'Send Reminders' },
    ],
    notes: 'Anchors UI copy and controls related to multi-agency advice coordination; does not prove read-receipts (“opened it”) are implemented.',
  },
  {
    id: 'care-teams-around-child',
    label: '“Care teams” / “team around the child” multi-agency collaboration is modelled in repo',
    sentenceRe:
      /\b(care\s*teams?|care\-?team|team\s+around\s+(?:a|the)\s+child|team\-?around\-?the\-?child|multi\-?disciplinary\s+team)\b/i,
    code: [
      { file: 'src/lib/collaboration/multi-agency.service.ts', pattern: 'Multi-Agency Collaboration Hub' },
      { file: 'src/lib/collaboration/multi-agency.service.ts', pattern: 'Multi-disciplinary team coordination' },
      { file: 'src/lib/collaboration/multi-agency.service.ts', pattern: 'team_around_child' },
      { file: 'src/components/la-panel/EHCPWorkflow.tsx', pattern: 'Multi-Agency Advice Portal' },
    ],
    notes:
      'Maps “care teams / team around the child” language to the repo’s multi-agency collaboration case model + EHCP workflow UI. Does not prove that every agency in the real world is onboarded/verified or that “care team” is an in-app named feature everywhere.',
  },
  {
    id: 'time-savings-analytics',
    label: 'Time savings analytics service exists (hours saved metrics)',
    sentenceRe:
      /\b(time savings?|hours saved|saving (?:\d+|one|two|three|four) hours|hours annually|150 hours|hours per (?:week|month))\b/i,
    code: [
      { file: 'src/lib/analytics/time-savings.service.ts', pattern: 'Time Savings Metrics Service' },
      { file: 'src/lib/analytics/time-savings.service.ts', pattern: 'hours saved' },
      { file: 'src/components/landing/UnifiedEcosystem.tsx', pattern: 'Hours Saved' },
      { file: 'src/components/landing/legacy/HeroSection.tsx', pattern: 'Time Savings Calculator' },
    ],
    notes: 'Anchors that the repo contains a time-savings metrics service and UI surfaces; does not prove a specific customer’s achieved savings.',
  },
  {
    id: 'training-and-cpd-built-in',
    label: 'Training/CPD content is built into the platform',
    sentenceRe: /\b(training is built into|built into the platform|cpd library|training modules?)\b/i,
    code: [
      { file: 'src/lib/training/course-library.ts', pattern: 'Course Library' },
      { file: 'src/components/training/CPDTracker.tsx', pattern: 'CPDTracker' },
      { file: 'src/app/[locale]/subscription/addon/page.tsx', pattern: 'CPD Library Unlimited' },
    ],
    notes: 'Anchors training/CPD modules in repo; does not prove accreditation/endorsement by external bodies.',
  },
  {
    id: 'feature-gating',
    label: 'Feature gating / permissions constraints exist',
    sentenceRe: /\b(we don\'t artificially gate|do not artificially gate|gate essential|feature gate|gated)\b/i,
    code: [
      { file: 'src/lib/featureGate.ts', pattern: 'FEATURE_REQUIREMENTS' },
      { file: 'src/lib/featureGate.ts', pattern: 'FeatureGateError' },
      { file: 'src/lib/subscription/plans.ts', pattern: 'API Access' },
    ],
    notes: 'Anchors that gating exists as a mechanism. It does not prove a particular policy choice about what is “essential”.',
  },
  {
    id: 'per-student-pricing-mentions',
    label: 'Per-student pricing discussion exists in plans configuration',
    sentenceRe: /\b(per student|per pupil|we don\'t charge per student|do not charge per student)\b/i,
    code: [
      { file: 'src/lib/subscription/plans.ts', pattern: 'per student' },
      { file: 'src/lib/subscription/plans.ts', pattern: 'Schools: £149-599/month' },
    ],
    notes: 'Anchors that pricing models are discussed in-repo. It does not prove specific competitors’ pricing or the absence of per-student billing in all contexts.',
  },
  {
    id: 'gdpr-minimisation-retention-sar',
    label: 'GDPR data minimisation/retention/SAR handling exists',
    sentenceRe:
      /\b(data minimi[sz]ation|retention|subject access request|sar\b|right to erasure|data subject)\b/i,
    code: [
      { file: 'src/middleware/gdpr-compliance.ts', pattern: 'Data subject access request' },
      { file: 'src/lib/gdpr-compliance.ts', pattern: "requestType: 'access'" },
      { file: 'src/app/[locale]/privacy/page.tsx', pattern: 'Data Retention' },
      { file: 'src/lib/knowledge/platform-knowledge.ts', pattern: 'Data minimisation principles applied' },
    ],
    notes: 'Anchors GDPR-related handlers and policy text in the repo; does not prove legal sufficiency for a given deployment.',
  },
  {
    id: 'consent-request-and-withdrawal',
    label: 'Consent request/withdrawal flows exist (middleware/services)',
    sentenceRe:
      /\b(request consent|withdraw consent|consent (?:given|preferences?)|consent (?:required|form))\b/i,
    code: [
      { file: 'src/middleware/gdpr-compliance.ts', pattern: 'handleConsentRequest' },
      { file: 'src/middleware/gdpr-compliance.ts', pattern: 'handleWithdrawConsent' },
      { file: 'src/lib/collaboration/multi-agency.service.ts', pattern: 'Withdraw consent' },
      { file: 'src/lib/portal/parent-portal.service.ts', pattern: "type: 'document_review' | 'consent_form'" },
      { file: 'src/components/ehcp/SchoolSubmissionInterface.tsx', pattern: 'given consent for this EHC needs assessment request' },
    ],
    notes: 'Anchors that consent concepts exist in middleware/services/UI. It does not prove clinical consent workflows for every scenario.',
  },
  {
    id: 'captions-api',
    label: 'Captions endpoint exists',
    sentenceRe: /\b(captions?|subtitles?|webvtt|vtt)\b/i,
    code: [
      { file: 'src/app/api/video/captions/route.ts', pattern: 'export async function GET' },
      { file: 'src/app/api/video/captions/route.ts', pattern: 'WEBVTT' },
    ],
  },
  {
    id: 'heygen-url-api',
    label: 'HeyGen URL fetch route exists',
    sentenceRe: /\b(heygen|embed|video_url|video status)\b/i,
    code: [
      { file: 'src/app/api/video/heygen-url/route.ts', pattern: 'video_status.get' },
      { file: 'src/app/api/video/heygen-url/route.ts', pattern: 'HEYGEN_VIDEO_IDS' },
    ],
  },
  {
    id: 'video-source-priority',
    label: 'Video source priority ordering exists',
    sentenceRe: /\b(cloudinary|cdn|fallback|local file|priorit(y|ise))\b/i,
    code: [
      { file: 'src/lib/training/heygen-video-urls.ts', pattern: 'getVideoSourceCandidates' },
      { file: 'src/lib/cloudinary.ts', pattern: 'getBestVideoSourceWithCloudinary' },
    ],
  },
  {
    id: 'security-encryption-aes256',
    label: 'AES-256 encryption utility exists (repo anchor)',
    sentenceRe: /\b(aes-?256|aes-?256-gcm|encryption|encrypted|field-level encryption)\b/i,
    code: [
      { file: 'src/lib/security/encryption.ts', pattern: 'AES-256-GCM' },
      { file: 'src/lib/security/encryption.ts', pattern: "const ALGORITHM = 'aes-256-gcm'" },
      { file: 'src/lib/services/dataEncryptionService.ts', pattern: 'Data Encryption Service' },
    ],
    notes: 'Anchors existence of encryption utilities; does not prove end-to-end encryption across the full system.',
  },
  {
    id: 'security-gdpr-audit-logging',
    label: 'GDPR audit logging exists (repo anchor)',
    sentenceRe: /\b(gdpr|uk\s*gdpr|audit trail|audit log|data access)\b/i,
    code: [
      { file: 'src/lib/security/audit-logger.ts', pattern: 'GDPR-compliant audit trail' },
      { file: 'src/lib/orchestration/data-router.service.ts', pattern: 'GDPR compliance' },
    ],
  },
  {
    id: 'audit-log-integrity',
    label: 'Audit log integrity tooling exists',
    sentenceRe: /\b(audit log|tamper|integrity|immutable)\b/i,
    code: [
      { file: 'tools/verify-audit-log-integrity.ts', pattern: 'verify' },
      { file: 'tools/test-audit-integrity.ts', pattern: 'audit' },
    ],
  },
  {
    id: 'pii-redaction',
    label: 'PII redaction tooling exists',
    sentenceRe: /\b(pii|redact|redaction|personal data)\b/i,
    code: [
      { file: 'src/lib/security/pii-redaction.ts', pattern: 'PII Redaction Utility' },
      { file: 'src/lib/ai-integration.ts', pattern: 'Privacy guard: redact PII' },
      { file: 'tools/test-pii-redaction.ts', pattern: 'redactPII' },
      { file: 'docs/AI_DATA_PRIVACY_WHITEPAPER.md', pattern: 'PII Redaction Layer (Privacy Guard)' },
    ],
  },
  {
    id: 'ai-zero-training-policy',
    label: 'AI “zero-training” policy is documented in-repo',
    sentenceRe:
      /\b(zero-?training|not\s+used\s+to\s+train|no\s+(?:student|customer)\s+data\s+is\s+ever\s+used\s+to\s+train|train\s+our\s+public\s+models|customer\s+data\s+is\s+not\s+used\s+to\s+train)\b/i,
    code: [
      { file: 'docs/AI_DATA_PRIVACY_WHITEPAPER.md', pattern: 'The "Zero-Training" AI Architecture' },
      { file: 'docs/AI_DATA_PRIVACY_WHITEPAPER.md', pattern: 'Customer data is not used to train foundation models.' },
      { file: 'docs/CLAIMS_LEDGER.md', pattern: '“No customer data used to train foundation models”' },
    ],
    notes:
      'Anchors the existence of an explicit in-repo AI data usage policy. Provider-side enforcement depends on deployment configuration and provider terms/settings.',
  },
  {
    id: 'ai-stateless-processing-docs',
    label: 'Stateless AI processing claims are documented (policy/architecture)',
    sentenceRe: /\bstateless(?:ly)?\b|\bin\s+memory\s+only\b/i,
    code: [
      { file: 'docs/AI_DATA_PRIVACY_WHITEPAPER.md', pattern: 'Stateless Processing:' },
      { file: 'docs/LA-IT-BYOD-GUIDE.md', pattern: 'statelessly' },
      { file: 'prisma/seed-help-center.ts', pattern: 'Data is processed **statelessly**.' },
    ],
    notes:
      'Anchors repo documentation and knowledge-base seeding text describing stateless processing. This does not prove every feature persists zero data; it proves the intended architecture is documented.',
  },
  {
    id: 'byod-db',
    label: 'BYOD/DB URL test tooling exists',
    sentenceRe: /\b(byod|bring your own database|database url|postgres|neon)\b/i,
    code: [{ file: 'tools/test-byod-db-url.ts', pattern: 'DATABASE_URL' }],
  },
  {
    id: 'ehcp-dashboard-la',
    label: 'LA EHCP dashboard exists',
    sentenceRe: /\b(local authority|\bla\b|caseworker|la dashboard|20-?week|statutory timeline|at-?risk case)\b/i,
    code: [
      { file: 'src/components/ehcp/LADashboard.tsx', pattern: 'LA EHCP Dashboard Component' },
      { file: 'src/components/ehcp/LADashboard.tsx', pattern: '20-week statutory timeline' },
      { file: 'src/app/[locale]/la/dashboard/page.tsx', pattern: 'LADashboardPage' },
      { file: 'src/app/api/la/dashboard/route.ts', pattern: 'export async function GET' },
    ],
  },
  {
    id: 'ehcp-golden-thread',
    label: 'Golden Thread feature exists',
    sentenceRe: /\b(golden thread|needs?\s*to\s*outcomes?|outcomes?\s*to\s*provision)\b/i,
    code: [
      { file: 'src/components/ehcp/GoldenThreadVisualisation.tsx', pattern: 'Golden Thread' },
      { file: 'src/lib/ehcp/golden-thread.service.ts', pattern: 'golden' },
    ],
  },
  {
    id: 'ehcp-merge-tool',
    label: 'EHCP merge tool exists',
    sentenceRe: /\b(merge tool|smart merge|merge contributions?|extracts? the key recommendations?)\b/i,
    code: [
      { file: 'src/components/ehcp/EHCPMergeTool.tsx', pattern: 'smartMergeContributions' },
      { file: 'src/lib/ehcp/smart-merge.ts', pattern: 'Smart EHCP Merge Utility' },
    ],
  },
  {
    id: 'ehcp-live-edit',
    label: 'Live EHCP editor exists',
    sentenceRe: /\b(live edit|live editor|edit\s+in\s+real\s*time|real\s*time\s+edit)\b/i,
    code: [{ file: 'src/components/ehcp/LiveEHCPEditor.tsx', pattern: 'LiveEHCPEditor' }],
  },
  {
    id: 'ehcp-evidence-pack-intervention-logs',
    label: 'EHCP evidence gathering: baseline prompts + intervention logs',
    sentenceRe:
      /\b(prompt\w*\s+you\s+for.*objective\s+baseline|baseline\s+data|pulls?\s+this\s+directly\s+from\s+your\s+intervention\s+logs?|intervention\s+logs)\b/i,
    code: [
      {
        file: 'src/lib/ehcp/evidence-builder.ts',
        pattern: 'Our platform prompts you for these because they provide the objective baseline.',
      },
      {
        file: 'src/lib/ehcp/evidence-builder.ts',
        pattern: 'Our system pulls this directly from your intervention logs.',
      },
      { file: 'src/lib/ehcp/evidence-builder.ts', pattern: 'prisma.interventions.findMany' },
      { file: 'src/app/api/ehcp/evidence-pack/route.ts', pattern: 'EHCP Evidence Pack API' },
      { file: 'src/app/api/ehcp/evidence-pack/route.ts', pattern: 'buildEHCPEvidencePack' },
    ],
    notes:
      'Anchors baseline prompting + pulling intervention logs (tenant-scoped) for an EHCP evidence pack. This proves the capability exists in-repo; it does not claim the pack is exhaustive for every evidence source.',
  },
  {
    id: 'ehcp-annual-review-and-transfers',
    label: 'Annual review + phase transfer workflows exist',
    sentenceRe: /\b(annual review|review scheduler|phase transfer|transition to secondary)\b/i,
    code: [
      { file: 'src/components/ehcp/AnnualReviewScheduler.tsx', pattern: 'Annual Review' },
      { file: 'src/components/ehcp/PhaseTransferWorkflow.tsx', pattern: 'Phase Transfer' },
      { file: 'src/lib/ehcp/timeline-tracker.ts', pattern: 'timeline' },
    ],
  },
  {
    id: 'ehcp-tribunal-and-mediation',
    label: 'Mediation/tribunal tracker exists',
    sentenceRe: /\b(tribunal|mediation|appeal)\b/i,
    code: [
      { file: 'src/components/ehcp/MediationTribunalTracker.tsx', pattern: 'Mediation & Tribunal Tracker' },
      { file: 'src/components/ehcp/LADashboard.tsx', pattern: 'Mediation & Tribunal Tracking' },
    ],
  },
  {
    id: 'ehcp-sen2',
    label: 'SEN2 return tooling exists',
    sentenceRe: /\b(sen2|df(e|e)\s+return|statutory return)\b/i,
    code: [
      { file: 'src/components/ehcp/SEN2ReturnGenerator.tsx', pattern: 'SEN2' },
      { file: 'src/lib/ehcp/sen2-returns.service.ts', pattern: 'SEN2' },
    ],
  },
  {
    id: 'ehcp-compliance-risk',
    label: 'Compliance risk predictor exists',
    sentenceRe: /\b(compliance risk|risk predictor|breach prediction|at-?risk)\b/i,
    code: [
      { file: 'src/components/ehcp/ComplianceRiskPredictor.tsx', pattern: 'Compliance Risk Predictor' },
      { file: 'src/app/api/la/compliance/route.ts', pattern: 'export async function GET' },
    ],
  },
  {
    id: 'ehcp-pdf-generator',
    label: 'EHCP PDF generation exists',
    sentenceRe: /\b(pdf|download|export|bundle)\b/i,
    code: [{ file: 'src/lib/ehcp/pdf-generator.ts', pattern: 'EHCP PDF Generator' }],
  },
  {
    id: 'assessment-engine',
    label: 'Assessment engine + question types exist',
    sentenceRe: /\b(assessment engine|question types?|multiple choice|true\/false|fill in the blank|file upload|timer)\b/i,
    code: [
      { file: 'src/components/assessment-engine/AssessmentEngine.tsx', pattern: 'AssessmentEngineProps' },
      { file: 'src/components/assessment-engine/question-types/MultipleChoiceQuestion.tsx', pattern: 'MultipleChoiceQuestion' },
      { file: 'src/components/assessment-engine/AssessmentTimer.tsx', pattern: 'AssessmentTimer' },
    ],
  },
  {
    id: 'universal-translator',
    label: 'Universal Translator feature is referenced in UI',
    sentenceRe: /\b(universal translator|translate\s+professional\s+language|parent-?friendly)\b/i,
    code: [
      { file: 'src/components/demo/TranslatorSandbox.tsx', pattern: 'Universal Translator' },
      { file: 'src/components/help/EnterpriseHelpCenter.tsx', pattern: 'Universal Translator' },
    ],
  },
  {
    id: 'ai-tutoring-agents',
    label: 'AI tutoring agents exist',
    sentenceRe: /\b(ai\s+tutoring\s+agents?|meet\s+our\s+ai\s+tutoring\s+agents?)\b/i,
    code: [
      { file: 'src/services/orchestrator-service.ts', pattern: 'processTutoringRequest' },
      { file: 'src/services/orchestrator-service.ts', pattern: 'Process a tutoring request using the AI agents' },
      { file: 'src/app/[locale]/ai-agents/page.tsx', pattern: 'TutoringInterface' },
      { file: 'src/components/ai-agents/TutoringInterface.tsx', pattern: 'TutoringRequest' },
    ],
    notes:
      'Basic evidence that the tutoring agents UI exists and is backed by an orchestrator service. This does not prove outcomes/learning impact; it proves implementation surfaces are present in-repo.',
  },
  {
    id: 'ai-tutoring-learning-style-adaptation',
    label: 'AI tutoring adapts to learning styles',
    sentenceRe: /\b(visual\s+learner|kinaesthetic|auditory\s+learner|learning\s+style|diagrams?\s+and\s+metaphors?)\b/i,
    code: [
      { file: 'src/services/orchestrator-service.ts', pattern: 'preferredLearningStyle' },
      { file: 'src/services/orchestrator-service.ts', pattern: "If preferredLearningStyle is 'visual'" },
      { file: 'src/services/orchestrator-service.ts', pattern: 'metaphors' },
      { file: 'src/services/orchestrator-service.ts', pattern: 'diagram' },
    ],
    notes:
      'Anchors the tutoring service prompt that explicitly adapts explanation style (e.g., visual learners get diagrams/metaphors).',
  },
  {
    id: 'dr-scott-ai',
    label: 'Dr. Scott AI is named in-product',
    sentenceRe: /\b(dr\.?\s*scott\s*ai|scott\s*ai)\b/i,
    code: [{ file: 'src/components/ai/AIAssistant.tsx', pattern: 'Dr. Scott AI' }],
    notes:
      'This evidences the in-product naming of the assistant. It does not claim training data provenance (e.g., “trained on clinical notes”).',
  },
  {
    id: 'safety-net',
    label: 'Safety Net exists (basic evidence)',
    sentenceRe: /\b(safety\s*net)\b/i,
    code: [
      { file: 'cypress/e2e/safety-net.cy.ts', pattern: 'safety' },
      { file: 'src/lib/core-algorithms.ts', pattern: 'Safety Net Risk Score Calculator', isRegex: false },
      { file: 'src/lib/guidance/contextual-help-video.ts', pattern: 'Safety Net', isRegex: false },
    ],
    notes: 'This only proves there is code/tests referring to Safety Net; it does not prove feature semantics.',
  },
];

function collectEvidence(sentence: string): { evidenced: boolean; matchedRuleIds: string[] } {
  const matched = EVIDENCE_RULES.filter(r => r.sentenceRe.test(sentence));
  const matchedIds = matched.map(m => m.id);
  const evidenced = matched.some(anyEvidenceMatches);
  return { evidenced, matchedRuleIds: matchedIds };
}

function pickExamples(items: string[], max: number): string[] {
  const out: string[] = [];
  for (const s of items) {
    if (out.length >= max) break;
    out.push(truncate(s, 180));
  }
  return out;
}

function truncate(text: string, max: number): string {
  const t = normalizeWhitespace(text);
  if (t.length <= max) return t;
  return t.slice(0, Math.max(0, max - 1)).trimEnd() + '…';
}

function main() {
  const keys = Object.keys(HEYGEN_VIDEO_IDS).sort();

  const report: AuditReport = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    totals: {
      keysTotal: keys.length,
      scriptsMissing: 0,
      ok: 0,
      needsReview: 0,
      likelyScriptUpdate: 0,
      regenCandidatesEstimate: 0,
    },
    keys: {},
  };

  for (const key of keys) {
    const res = getVideoScriptResolution(key);

    const kr: KeyReport = {
      key,
      resolvedKey: res.resolvedKey,
      scriptStatus: res.status,
      recommendation: 'needs-review',
      notes: [],
    };

    if (res.status === 'missing') {
      report.totals.scriptsMissing += 1;
      kr.recommendation = 'likely-script-update';
      kr.notes.push(
        "Missing script-derived transcript. If you want the replacement video to be script-governed, you must add a script (or alias) and then re-render/regenerate the video to match it.",
      );
      report.keys[key] = kr;
      continue;
    }

    kr.sourceId = res.sourceId;
    kr.title = res.title;
    kr.transcriptLength = res.transcript.length;
    kr.transcriptSha256 = sha256(res.transcript);

    const sentences = sentenceSplit(res.transcript);
    const claimyDetected = sentences.filter(s => CLAIMY_SENTENCE_RE.test(s));
    const claimy = claimyDetected.filter(isInScopeProductClaimSentence);
    const outOfScopeIgnored = claimyDetected.filter(s => !isInScopeProductClaimSentence(s));

    let evidenced = 0;
    let highRisk = 0;
    let detectedHighRisk = 0;
    const unevidencedSentences: string[] = [];
    const highRiskUnevidenced: string[] = [];

    for (const s of claimyDetected) {
      if (HIGH_RISK_RE.test(s)) detectedHighRisk += 1;
    }

    for (const s of claimy) {
      const isHighRisk = HIGH_RISK_RE.test(s);
      if (isHighRisk) highRisk += 1;

      const ev = collectEvidence(s);
      if (ev.evidenced) {
        evidenced += 1;
      } else {
        unevidencedSentences.push(s);
        if (isHighRisk) highRiskUnevidenced.push(s);
      }
    }

    kr.claimSentences = {
      detectedTotal: claimyDetected.length,
      detectedHighRisk,
      outOfScopeIgnored: outOfScopeIgnored.length,
      outOfScopeExamples: pickExamples(outOfScopeIgnored, 6),
      total: claimy.length,
      highRisk,
      evidenced,
      unevidenced: unevidencedSentences.length,
      highRiskUnevidencedExamples: pickExamples(highRiskUnevidenced, 6),
      unevidencedExamples: pickExamples(unevidencedSentences, 8),
    };

    // Triage rules:
    // - high-risk unevidenced => likely script update (or add explicit evidence anchors)
    // - many unevidenced => needs review
    // - otherwise ok
    if (claimy.length === 0) {
      kr.recommendation = 'ok';
      kr.notes.push(
        'No in-scope product/operational claim sentences detected for script ↔ code verification. (Educational content and market commentary are treated as out-of-scope.)',
      );
    } else if (highRiskUnevidenced.length > 0) {
      kr.recommendation = 'likely-script-update';
      kr.notes.push(
        `Found ${highRiskUnevidenced.length} high-risk claim sentence(s) with no configured code evidence anchor. Recommend adjusting script text or adding evidence mapping before any regeneration.`,
      );
    } else if (unevidencedSentences.length > 0) {
      kr.recommendation = 'needs-review';
      kr.notes.push(
        `Found ${unevidencedSentences.length} claim-like sentence(s) with no configured code evidence anchor. This does not prove falsehood; it indicates missing evidence mapping or script wording that is hard to verify.`,
      );
    } else {
      kr.recommendation = 'ok';
      kr.notes.push('All detected claim-like sentences matched at least one configured code evidence anchor.');
    }

    report.keys[key] = kr;
  }

  // Totals
  for (const k of Object.keys(report.keys)) {
    const rec = report.keys[k].recommendation;
    if (rec === 'ok') report.totals.ok += 1;
    if (rec === 'needs-review') report.totals.needsReview += 1;
    if (rec === 'likely-script-update') report.totals.likelyScriptUpdate += 1;
  }

  report.totals.regenCandidatesEstimate = report.totals.scriptsMissing + report.totals.likelyScriptUpdate;

  const outDir = path.resolve(process.cwd(), 'video_provenance');
  fs.mkdirSync(outDir, { recursive: true });

  const jsonPath = path.join(outDir, 'script-code-audit.json');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2) + '\n', 'utf8');

  // Small human-readable summary
  const summaryLines: string[] = [];
  summaryLines.push(`# Script ↔ Code Audit Summary`);
  summaryLines.push('');
  summaryLines.push(`Generated: ${report.generatedAt}`);
  summaryLines.push('');
  summaryLines.push(`Canonical keys audited: ${report.totals.keysTotal}`);
  summaryLines.push(`Scripts missing: ${report.totals.scriptsMissing}`);
  summaryLines.push(`OK (heuristically evidenced): ${report.totals.ok}`);
  summaryLines.push(`Needs review (unevidenced sentences): ${report.totals.needsReview}`);
  summaryLines.push(`Likely script update (high-risk unevidenced OR missing transcript): ${report.totals.likelyScriptUpdate}`);
  summaryLines.push('');
  summaryLines.push(`Estimated videos requiring regeneration IF you choose to enforce script-governance for all keys: ${report.totals.regenCandidatesEstimate}`);
  summaryLines.push('');
  summaryLines.push(`## Notes`);
  summaryLines.push('');
  summaryLines.push('- This audit is scoped to *product/operational claims* that can reasonably be checked against this repository (code, config, in-repo docs).');
  summaryLines.push('- Educational narration (e.g. psychoeducation), competitor/market commentary, and hypothetical examples are treated as out-of-scope and are not used for regeneration triage.');
  summaryLines.push('- “Unevidenced” means the tool has no configured repo anchor for that sentence; it is not proof the claim is wrong.');
  summaryLines.push('- The evidence rules are intentionally strict and small. Expand `EVIDENCE_RULES` to make more in-scope claims checkable and to reduce “needs review.”');
  summaryLines.push('');
  summaryLines.push('## Top 20 likely-script-update keys');
  summaryLines.push('');

  const likely = Object.values(report.keys)
    .filter(r => r.recommendation === 'likely-script-update')
    .sort((a, b) => {
      const ah = a.claimSentences?.highRisk ?? 0;
      const bh = b.claimSentences?.highRisk ?? 0;
      if (bh !== ah) return bh - ah;
      const au = a.claimSentences?.unevidenced ?? 0;
      const bu = b.claimSentences?.unevidenced ?? 0;
      return bu - au;
    })
    .slice(0, 20);

  for (const r of likely) {
    const hi = r.claimSentences?.highRisk ?? 0;
    const un = r.claimSentences?.unevidenced ?? 0;
    summaryLines.push(
      '- `' +
        r.key +
        '` (highRisk=' +
        String(hi) +
        ', unevidenced=' +
        String(un) +
        ', source=' +
        String(r.sourceId ?? 'n/a') +
        ')',
    );
  }

  const docsDir = path.resolve(process.cwd(), 'docs');
  fs.mkdirSync(docsDir, { recursive: true });
  const mdPath = path.join(docsDir, 'SCRIPT_CODE_AUDIT_SUMMARY.md');
  fs.writeFileSync(mdPath, summaryLines.join('\n') + '\n', 'utf8');

  console.log(`Wrote: ${path.relative(process.cwd(), jsonPath)}`);
  console.log(`Wrote: ${path.relative(process.cwd(), mdPath)}`);
  console.log(`Totals: keys=${report.totals.keysTotal}, missing=${report.totals.scriptsMissing}, ok=${report.totals.ok}, review=${report.totals.needsReview}, likelyUpdate=${report.totals.likelyScriptUpdate}`);
  console.log(`Regen candidates estimate (policy-dependent): ${report.totals.regenCandidatesEstimate}`);
}

main();
