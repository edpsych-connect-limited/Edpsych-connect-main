# Tracing Plan

This document defines the tracing scope for critical workflows.

## Tracing Targets
- Authentication: login, refresh, logout
- Dashboard: initial load, key summary widgets
- Assessments: create, autosave, submit, report upload
- Cases: create, list, detail
- EHCP: create, module save, export, evidence pack
- Reports: generate, export
- Interventions: generate, track
- Marketplace: search, booking creation, payment intent
- AI review: submit, approve, reject
- Training: enrollment, completion, payment intent
- Outcomes: record measurement, analytics retrieval

## Coverage Status (2026-01-20)
- Authentication: implemented (login, refresh, logout telemetry)
- Dashboard: implemented (EP + LA dashboards)
- Assessments: implemented (create, submit, report upload, update)
- Cases: implemented (create, list, detail, update, close)
- EHCP: implemented (list, create, update, delete, export, evidence pack)
- Reports: implemented (generate, draft save, list, export)
- Interventions: implemented (generate, list, detail, update, discontinue, tracking)
- Marketplace: implemented (search, booking payment intent, booking confirmation)
- AI review: implemented (submit, approve, reject)
- Training: implemented (enrollment, completion, payment intent)
- Outcomes: implemented (record, analytics)

## Required Attributes
- `tenant_id`
- `user_id` (hashed)
- `role`
- `workflow`
- `request_id`
- `latency_ms`
- `status_code`

## Sampling
- 100% sampling for errors
- 10% sampling for success paths
- 100% sampling for critical workflows during release windows

## Dashboards
- p95 latency per workflow
- error rate per workflow
- top 10 slow endpoints
