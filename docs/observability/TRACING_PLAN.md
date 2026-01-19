# Tracing Plan

This document defines the tracing scope for critical workflows.

## Tracing Targets
- Authentication: login, refresh, logout
- Dashboard: initial load, key summary widgets
- Assessments: create, autosave, submit
- Cases: create, list, detail
- EHCP: create, module save, export, evidence pack
- Reports: generate, export
- Marketplace: search, booking creation, payment intent
- AI review: submit, approve, reject
- Training: enrollment, completion, payment intent

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
