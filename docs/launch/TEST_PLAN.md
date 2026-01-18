# Test Plan

This document captures the test strategy for enterprise readiness.

## Unit Tests
- Utility functions and validation logic
- Role-based access helpers
- Data mapping and formatting

## Integration Tests
- API endpoints for assessments, EHCP, cases, and reports
- Auth flows and permissions
- Marketplace search and booking flow

## E2E Tests (Critical Journeys)
- Login -> dashboard -> create assessment -> submit
- Create EHCP -> module updates -> export
- Case creation -> assignment -> closure
- Report generation -> export
- Marketplace search -> booking request

## Non-Functional Tests
- Accessibility audit for top journeys
- Performance validation for dashboard and lists
- Security scan and secret detection
