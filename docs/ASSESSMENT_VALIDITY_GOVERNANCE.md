# Assessment Validity & "Clinical-Grade" Capture (Engineering Evidence)

This document defines what EdPsych Connect means (and does **not** mean) when we describe assessment workflows as **“clinical‑grade”** in product narration.

## What we mean by “clinical‑grade” (repo-verifiable)

In this codebase, “clinical‑grade” refers to **structured, auditable capture** of assessment activity by qualified practitioners, including:

- **Structured templates/frameworks** for recording observations, scores and narratives (see `src/lib/assessments/assessment-library.ts`).
- **Qualification gating metadata** on templates (e.g., `qualification_required`) to reflect that some activities require practitioner-level competence.
- **References and interpretation guidance fields** that support professional write-up and traceability.
- **Secure document linking** for received/uploaded assessment reports (e.g., `linked_report_id` in `AssessmentInstance`).

This is an engineering definition: it’s about **data capture quality, structure, and traceability**, not marketing.

## What we do NOT claim

- We do **not** claim EdPsych Connect creates psychometric validity for copyrighted instruments.
- We do **not** claim the platform replaces professional judgement.
- We do **not** claim that templates are a substitute for training, supervision, or professional standards.

## Repository anchors (deterministic)

1. **Assessment Library disclaimer**
   - File: `src/lib/assessments/assessment-library.ts`
   - Key text (required):
     - `IMPORTANT: These are assessment frameworks and recording tools,`
     - `not copyrighted assessment instruments.`

2. **Assessment template structure includes qualification + references**
   - File: `src/lib/assessments/assessment-library.ts`
   - Key fields:
     - `qualification_required`
     - `references`

3. **Deterministic validator (CI-friendly)**
   - Tool: `tools/validate-assessment-library-validity.ts`
   - Output on success:
     - `OK: assessment library validity checks passed`

## How to run the validator

From the repo root:

- `npx tsx tools/validate-assessment-library-validity.ts`
