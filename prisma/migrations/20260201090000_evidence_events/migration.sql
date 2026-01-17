-- Evidence telemetry + AI review queue
CREATE TABLE "evidence_events" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "trace_id" TEXT,
    "event_type" TEXT NOT NULL,
    "workflow_type" TEXT,
    "action_type" TEXT,
    "status" TEXT DEFAULT 'ok',
    "duration_ms" INTEGER,
    "evidence_type" TEXT NOT NULL,
    "model_version_id" TEXT,
    "request_id" TEXT,
    "input_hash" TEXT,
    "output_hash" TEXT,
    "summary" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "evidence_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_reviews" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "approved_by_id" INTEGER,
    "audit_log_id" TEXT,
    "evidence_event_id" TEXT,
    "model_version_id" TEXT,
    "request_id" TEXT,
    "use_case" TEXT NOT NULL,
    "agent_id" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reason" TEXT,
    "decision_notes" TEXT,
    "response_preview" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "approved_at" TIMESTAMP(3),
    CONSTRAINT "ai_reviews_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "evidence_events_tenant_id_idx" ON "evidence_events"("tenant_id");
CREATE INDEX "evidence_events_user_id_idx" ON "evidence_events"("user_id");
CREATE INDEX "evidence_events_event_type_idx" ON "evidence_events"("event_type");
CREATE INDEX "evidence_events_workflow_type_idx" ON "evidence_events"("workflow_type");
CREATE INDEX "evidence_events_created_at_idx" ON "evidence_events"("created_at");
CREATE INDEX "evidence_events_trace_id_idx" ON "evidence_events"("trace_id");

CREATE INDEX "ai_reviews_tenant_id_idx" ON "ai_reviews"("tenant_id");
CREATE INDEX "ai_reviews_user_id_idx" ON "ai_reviews"("user_id");
CREATE INDEX "ai_reviews_status_idx" ON "ai_reviews"("status");
CREATE INDEX "ai_reviews_created_at_idx" ON "ai_reviews"("created_at");

ALTER TABLE "evidence_events" ADD CONSTRAINT "evidence_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "evidence_events" ADD CONSTRAINT "evidence_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "evidence_events" ADD CONSTRAINT "evidence_events_model_version_id_fkey" FOREIGN KEY ("model_version_id") REFERENCES "AIModelVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ai_reviews" ADD CONSTRAINT "ai_reviews_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ai_reviews" ADD CONSTRAINT "ai_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ai_reviews" ADD CONSTRAINT "ai_reviews_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ai_reviews" ADD CONSTRAINT "ai_reviews_audit_log_id_fkey" FOREIGN KEY ("audit_log_id") REFERENCES "audit_logs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ai_reviews" ADD CONSTRAINT "ai_reviews_evidence_event_id_fkey" FOREIGN KEY ("evidence_event_id") REFERENCES "evidence_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ai_reviews" ADD CONSTRAINT "ai_reviews_model_version_id_fkey" FOREIGN KEY ("model_version_id") REFERENCES "AIModelVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
