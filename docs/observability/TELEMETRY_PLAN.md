# Product Telemetry Plan

This document defines product telemetry beyond AI features.

## Core Metrics
- Activation: first successful login and first case/assessment created
- Adoption: weekly active users by role
- Workflow completion: start -> submit for assessments, EHCP, reports
- Drop-off points: step-level abandon rates in wizards
- Time to value: time from signup to first completed workflow

## Event Taxonomy
- `workflow_started`
- `workflow_step_completed`
- `workflow_completed`
- `search_performed`
- `export_generated`
- `collaboration_invite_sent`

## Required Attributes
- `tenant_id`
- `user_id` (hashed)
- `role`
- `workflow`
- `step`
- `duration_ms`

## Dashboards
- Activation funnel by role
- Completion rate by workflow
- Drop-off heatmap by step
- Median time to completion
