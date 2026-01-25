# Error Budget Policy (Draft)

This policy defines error budget targets and the decision framework for release
controls when reliability targets are at risk. It complements the SLIs/SLOs in
`docs/observability/SLI_SLO.md`.

## Error budget window
- Rolling window: 28 days
- Measurement cadence: daily review for critical workflows

## Default budgets
- Availability SLO: 99.95% (error budget: 0.05%)
- Critical workflow success SLO: 99.5% (error budget: 0.5%)
- Reporting workflows SLO: 99.0% (error budget: 1.0%)

## Budget actions
- Green (>= 75% budget remaining): normal release cadence
- Amber (25% to 75% remaining): enhanced monitoring, change review required
- Red (< 25% remaining): release freeze, mitigation required before next deploy

## Budget governance
- Owner: Project Lead (Codex)
- Review cadence: weekly reliability review
- Evidence retention: retain 90 days of error budget snapshots

## Exceptions
- Emergency security fixes may bypass freeze with written approval.
- Legal/compliance hotfixes follow accelerated change control.
