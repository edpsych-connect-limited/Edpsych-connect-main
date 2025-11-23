#!/bin/bash
echo "Running Cypress E2E Tests..."
npx cypress run --spec "cypress/e2e/help-center.cy.ts,cypress/e2e/demo.cy.ts,cypress/e2e/onboarding.cy.ts"
