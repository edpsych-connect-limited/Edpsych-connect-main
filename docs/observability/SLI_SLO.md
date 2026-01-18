# SLI and SLO Definitions

This document defines service level indicators (SLIs) and service level
objectives (SLOs) for critical workflows. Targets are measured per 28-day window.

## Authentication
- Login success rate: 99.9%
- Login p95 server latency: 1.5s
- Token refresh success rate: 99.95%

## Core Workspaces
- Dashboard load success rate: 99.9%
- Dashboard p95 server latency: 1.5s
- Assessments list p95 server latency: 2.0s
- Cases list p95 server latency: 2.0s
- EHCP list p95 server latency: 2.0s

## Assessment Workflows
- Assessment create success rate: 99.5%
- Assessment submit success rate: 99.5%
- Assessment submit p95 server latency: 2.5s

## Reporting
- Report generation success rate: 99.0%
- Report generation p95 server latency: 4.0s

## AI Review
- AI review submission success rate: 99.5%
- AI review approval action p95 server latency: 2.0s

## Marketplace
- Search success rate: 99.5%
- Search p95 server latency: 2.0s
- Booking creation success rate: 99.0%

## Availability
- API availability: 99.95%
- Web availability: 99.95%
