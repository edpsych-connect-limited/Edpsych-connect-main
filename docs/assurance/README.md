# Internal Assurance Pack (First‑Party)

This folder contains EdPsych Connect’s **first‑party internal audit pack**: the evidence index, control matrix, and readiness checklists used **before** engaging external auditors.

Important:
- This pack is **not a formal certification**. Only accredited bodies/auditors can issue certifications (e.g., ISO 27001 certification bodies; SOC 2 reports via licensed auditors).
- The goal is to provide a **transparent, testable internal baseline** that an external auditor can compare against.

## Start here

1. `EVIDENCE_REGISTER.md` — source-of-truth index of evidence items and where to find them in the repo.
2. `CONTROL_MATRIX.md` — mapping of controls to ISO 27001 / SOC 2 style control families.
3. Readiness checklists:
   - `CYBER_ESSENTIALS_READINESS.md`
   - `ISO27001_READINESS.md`
   - `SOC2_READINESS.md`
   - `PEN_TEST_READINESS.md`
   - `ACCESSIBILITY_WCAG22AA.md`
   - `BCP_DR_AUDIT.md`
   - `VENDOR_SUBPROCESSOR_AUDIT.md`

## How to use this pack

- Treat each checklist as a **go/no-go gate**.
- Collect evidence links into `EVIDENCE_REGISTER.md`.
- Any claim in a checklist must be backed by one of:
  - a code link,
  - a config link,
  - a test output/log,
  - or an operational record (incident report, DR test report).

Last updated: 2025-12-15
