-- Phase 2D: Differentiated Intervention Engine
-- Adds assessment_instance linkage, structured fields, and InterventionReview model to interventions

-- Add new columns to interventions (all nullable — zero breaking change)
ALTER TABLE "interventions" ADD COLUMN IF NOT EXISTS "assessment_instance_id" TEXT;
ALTER TABLE "interventions" ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE "interventions" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "interventions" ADD COLUMN IF NOT EXISTS "goals" JSONB;
ALTER TABLE "interventions" ADD COLUMN IF NOT EXISTS "frequency" TEXT;
ALTER TABLE "interventions" ADD COLUMN IF NOT EXISTS "responsible_person_id" INTEGER;
ALTER TABLE "interventions" ADD COLUMN IF NOT EXISTS "review_date" TIMESTAMP(3);
ALTER TABLE "interventions" ADD COLUMN IF NOT EXISTS "ep_recommendation_ref" TEXT;

-- Add foreign key for assessment_instance_id
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_assessment_instance_id_fkey"
  FOREIGN KEY ("assessment_instance_id") REFERENCES "AssessmentInstance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add foreign key for responsible_person_id
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_responsible_person_id_fkey"
  FOREIGN KEY ("responsible_person_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add index for assessment_instance_id
CREATE INDEX IF NOT EXISTS "interventions_assessment_instance_id_idx" ON "interventions"("assessment_instance_id");

-- Create InterventionReview table
CREATE TABLE IF NOT EXISTS "InterventionReview" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "intervention_id" INTEGER NOT NULL,
    "reviewed_by" INTEGER NOT NULL,
    "review_date" TIMESTAMP(3) NOT NULL,
    "progress_rating" TEXT NOT NULL,
    "notes" TEXT,
    "next_review_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterventionReview_pkey" PRIMARY KEY ("id")
);

-- Add foreign keys for InterventionReview
ALTER TABLE "InterventionReview" ADD CONSTRAINT "InterventionReview_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InterventionReview" ADD CONSTRAINT "InterventionReview_intervention_id_fkey"
  FOREIGN KEY ("intervention_id") REFERENCES "interventions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InterventionReview" ADD CONSTRAINT "InterventionReview_reviewed_by_fkey"
  FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add indexes for InterventionReview
CREATE INDEX IF NOT EXISTS "InterventionReview_tenant_id_idx" ON "InterventionReview"("tenant_id");
CREATE INDEX IF NOT EXISTS "InterventionReview_intervention_id_idx" ON "InterventionReview"("intervention_id");
CREATE INDEX IF NOT EXISTS "InterventionReview_review_date_idx" ON "InterventionReview"("review_date");
