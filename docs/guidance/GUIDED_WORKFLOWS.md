# Guided Workflows (Top 10)

This document records the top workflows and their guided steps to support
consistent onboarding and navigation.

## 1) Login and onboarding
- Entry: `/login` -> `/onboarding`
- Guided steps: complete role profile, verify access, start role tour
- Evidence: onboarding redirect + dashboard role tour CTA

## 2) Assessment creation
- Entry: `/assessments`
- Guided steps: filter assessments, create assessment, run assessment wizard
- Tour: `assessments` + `assessment-admin`

## 3) EHCP request and review
- Entry: `/ehcp`
- Guided steps: create request, review statutory sections, export evidence pack
- Tour: `ehcp` + `ehcp-detail`

## 4) Case creation and management
- Entry: `/cases`
- Guided steps: create case, add stakeholders, log progress notes
- Tour: `case-create` + `case-detail`

## 5) Reports and evidence
- Entry: `/reports`
- Guided steps: complete report tabs, add recommendations, generate PDF
- Tour: `reports`

## 6) Intervention planning
- Entry: `/interventions`
- Guided steps: search interventions, assign plan, schedule review
- Tour: `interventions`

## 7) Marketplace booking
- Entry: `/marketplace`
- Guided steps: search providers, submit booking, confirm schedule
- Tour: `marketplace-booking`

## 8) Progress monitoring
- Entry: `/progress`
- Guided steps: review baseline, log outcomes, flag stalled progress
- Evidence: progress dashboards + contextual help tips

## 9) AI review governance
- Entry: `/admin/ethics`
- Guided steps: review queue, add decision notes, approve or reject
- Tour: `ai-reviews`

## 10) Training and CPD
- Entry: `/training`
- Guided steps: select course, track progress, download certificates
- Evidence: training dashboard + contextual help tips

## Coverage status
- Tours available: dashboard, assessments, assessment-admin, interventions, ehcp, ehcp-detail, case-create, case-detail, reports, marketplace-booking, ai-reviews
- Contextual tips wired in `src/lib/guidance/contextual-help-tips.ts`
