# EHCP Export QA Checklist

This checklist helps confirm that the EHCP export automation is ready for release. It pairs the new telemetry instrumentation with practical QA actions so auditors can confidently verify every export/download/email.

## Acceptance criteria
1. `GET /api/ehcp/[id]/export` returns a PDF with the selected sections and the `X-EHCP-Export-Trace-Id` header.
2. `POST /api/ehcp/[id]/export` validates recipients, generates the PDF, and returns a success payload with the same trace header.
3. Every successful export (download or email) appends a structured entry to `logs/forensic-events.log` matching the trace ID from the response header.
4. The operations doc `docs/ops/forensic_report.md` captures the latest trace info (sections, recipients, format, watermark) for the QA run.

## QA steps
1. **Prepare test data**: Use a sandbox tenant with EHCP records (`tenant_id`, `ehcp` id). Seed data should include complete `plan_details` for sections A/B/E/F/I.
2. **GET export**: Query the endpoint with `format=pdf&sections=A,B,F`. Download the response and inspect the PDF file to ensure the requested sections are present and the filename matches `EHCP-[id]-[student].pdf`. Assert the response headers include `X-EHCP-Export-Trace-Id` and that the value matches the most recent line in `logs/forensic-events.log` (`type: "ehcp_export", action: "download"`).
3. **Email export**: Submit a POST request with valid recipients and optional message/subject. Confirm the response includes `success: true`, the `emailData` metadata, and the `X-EHCP-Export-Trace-Id` header. Cross-reference the header to the log entry (`action: "email_send"`) and verify the metadata (recipient count, sections, includeSignatures). Document the trace ID for the run.
4. **Edge case checks**: Trigger `400` responses by omitting recipients, sending invalid emails, requesting unsupported formats, or passing an invalid EHCP ID. The trace header is not required for failures, but the API should still respond with clear error messages.
5. **Telemetry review**: Append the trace IDs and any anomalies to `docs/ops/forensic_report.md` along with the date and QA owner. Update `docs/ops/ops_run_report.md` notes to reference the QA run and new `logs/forensic-events.log` entries.

## Automation suggestions
- Consider adding a lightweight Playwright or Postman collection that executes steps 2 and 3 against a staging endpoint and stores the trace IDs automatically.
- Hook the `logs/forensic-events.log` into the `docs/ops/ops_run_report.md` run history row via a small parser script (e.g., `node scripts/parse-forensic-events.js`) for future audits.
