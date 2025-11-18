-- CreateTable TokenisationAccount
CREATE TABLE "TokenisationAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" INTEGER NOT NULL,
    "account_type" TEXT NOT NULL DEFAULT 'TREASURY',
    "balance" BIGINT NOT NULL DEFAULT 0,
    "locked_amount" BIGINT NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_verified" DATETIME,
    CONSTRAINT "TokenisationAccount_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE CASCADE
);

-- CreateTable TokenisationTransaction
CREATE TABLE "TokenisationTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" INTEGER NOT NULL,
    "account_id" TEXT NOT NULL,
    "transaction_type" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "reason" TEXT,
    "user_id" INTEGER,
    "related_user_id" INTEGER,
    "batch_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recorded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trace_id" TEXT NOT NULL,
    CONSTRAINT "TokenisationTransaction_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE CASCADE,
    CONSTRAINT "TokenisationTransaction_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "TokenisationAccount" ("id") ON DELETE CASCADE
);

-- CreateTable Reward
CREATE TABLE "Reward" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" INTEGER NOT NULL,
    "reward_tier" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "description" TEXT,
    "issued_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issued_by" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "expires_at" DATETIME,
    CONSTRAINT "Reward_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE CASCADE
);

-- CreateTable RewardClaim
CREATE TABLE "RewardClaim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" INTEGER NOT NULL,
    "reward_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "claimed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transaction_id" TEXT,
    "trace_id" TEXT NOT NULL,
    CONSTRAINT "RewardClaim_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE CASCADE,
    CONSTRAINT "RewardClaim_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "Reward" ("id") ON DELETE CASCADE,
    CONSTRAINT "RewardClaim_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "TokenisationAccount" ("id") ON DELETE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TokenisationAccount_tenant_id_account_type_key" ON "TokenisationAccount"("tenant_id", "account_type");

-- CreateIndex
CREATE INDEX "TokenisationAccount_tenant_id_idx" ON "TokenisationAccount"("tenant_id");

-- CreateIndex
CREATE INDEX "TokenisationAccount_account_type_idx" ON "TokenisationAccount"("account_type");

-- CreateIndex
CREATE INDEX "TokenisationAccount_updated_at_idx" ON "TokenisationAccount"("updated_at");

-- CreateIndex
CREATE INDEX "TokenisationTransaction_tenant_id_idx" ON "TokenisationTransaction"("tenant_id");

-- CreateIndex
CREATE INDEX "TokenisationTransaction_account_id_idx" ON "TokenisationTransaction"("account_id");

-- CreateIndex
CREATE INDEX "TokenisationTransaction_transaction_type_idx" ON "TokenisationTransaction"("transaction_type");

-- CreateIndex
CREATE INDEX "TokenisationTransaction_user_id_idx" ON "TokenisationTransaction"("user_id");

-- CreateIndex
CREATE INDEX "TokenisationTransaction_created_at_idx" ON "TokenisationTransaction"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "TokenisationTransaction_trace_id_key" ON "TokenisationTransaction"("trace_id");

-- CreateIndex
CREATE INDEX "TokenisationTransaction_trace_id_idx" ON "TokenisationTransaction"("trace_id");

-- CreateIndex
CREATE INDEX "Reward_tenant_id_idx" ON "Reward"("tenant_id");

-- CreateIndex
CREATE INDEX "Reward_reward_tier_idx" ON "Reward"("reward_tier");

-- CreateIndex
CREATE INDEX "Reward_status_idx" ON "Reward"("status");

-- CreateIndex
CREATE INDEX "Reward_issued_at_idx" ON "Reward"("issued_at");

-- CreateIndex
CREATE UNIQUE INDEX "RewardClaim_reward_id_key" ON "RewardClaim"("reward_id");

-- CreateIndex
CREATE INDEX "RewardClaim_tenant_id_idx" ON "RewardClaim"("tenant_id");

-- CreateIndex
CREATE INDEX "RewardClaim_user_id_idx" ON "RewardClaim"("user_id");

-- CreateIndex
CREATE INDEX "RewardClaim_claimed_at_idx" ON "RewardClaim"("claimed_at");

-- CreateIndex
CREATE UNIQUE INDEX "RewardClaim_trace_id_key" ON "RewardClaim"("trace_id");

-- CreateIndex
CREATE INDEX "RewardClaim_trace_id_idx" ON "RewardClaim"("trace_id");
