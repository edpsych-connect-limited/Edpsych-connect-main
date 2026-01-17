-- Create AI model registry tables
CREATE TABLE "AIModel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIModel_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AIModelVersion" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "versionLabel" TEXT NOT NULL,
    "providerModel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "releaseDate" TIMESTAMP(3),
    "trainingDataSummary" TEXT,
    "architectureSummary" TEXT,
    "performanceMetrics" JSONB,
    "limitations" JSONB,
    "ethicsAssessmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIModelVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AIFairnessEvaluation" (
    "id" TEXT NOT NULL,
    "modelVersionId" TEXT NOT NULL,
    "datasetName" TEXT NOT NULL,
    "evaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metrics" JSONB NOT NULL,
    "thresholds" JSONB NOT NULL,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "evaluatorId" INTEGER,
    CONSTRAINT "AIFairnessEvaluation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AITransparencyReport" (
    "id" TEXT NOT NULL,
    "modelVersionId" TEXT NOT NULL,
    "report" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AITransparencyReport_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AITransparencyReport_modelVersionId_key" ON "AITransparencyReport"("modelVersionId");

CREATE INDEX "AIModel_provider_idx" ON "AIModel"("provider");
CREATE INDEX "AIModel_status_idx" ON "AIModel"("status");

CREATE INDEX "AIModelVersion_modelId_idx" ON "AIModelVersion"("modelId");
CREATE INDEX "AIModelVersion_providerModel_idx" ON "AIModelVersion"("providerModel");
CREATE INDEX "AIModelVersion_status_idx" ON "AIModelVersion"("status");

CREATE INDEX "AIFairnessEvaluation_modelVersionId_idx" ON "AIFairnessEvaluation"("modelVersionId");
CREATE INDEX "AIFairnessEvaluation_evaluatedAt_idx" ON "AIFairnessEvaluation"("evaluatedAt");
CREATE INDEX "AIFairnessEvaluation_passed_idx" ON "AIFairnessEvaluation"("passed");

ALTER TABLE "AIModelVersion" ADD CONSTRAINT "AIModelVersion_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AIModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AIModelVersion" ADD CONSTRAINT "AIModelVersion_ethicsAssessmentId_fkey" FOREIGN KEY ("ethicsAssessmentId") REFERENCES "EthicsAssessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AIFairnessEvaluation" ADD CONSTRAINT "AIFairnessEvaluation_modelVersionId_fkey" FOREIGN KEY ("modelVersionId") REFERENCES "AIModelVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AIFairnessEvaluation" ADD CONSTRAINT "AIFairnessEvaluation_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AITransparencyReport" ADD CONSTRAINT "AITransparencyReport_modelVersionId_fkey" FOREIGN KEY ("modelVersionId") REFERENCES "AIModelVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
