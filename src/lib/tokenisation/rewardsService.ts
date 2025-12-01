/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { TreasuryService } from '@/lib/tokenisation/treasuryService';
// import { logForensicEvent } from '@/lib/server/forensic';
import crypto from 'crypto';

export interface RewardMetadata {
  tenantId: number;
  userId: number;
  rewardTier: string;
  description: string;
}

export class RewardsService {
  constructor(private _treasury: TreasuryService) {
  }

  async issueReward(metadata: RewardMetadata, amount: number, _batchId?: string) {
    console.warn('RewardsService.issueReward: Tokenisation system is currently disabled.');
    const traceId = crypto.randomUUID();
    return {
      record: {
        id: 'mock-reward-id',
        tenantId: metadata.tenantId,
        issuedAt: new Date().toISOString(),
        tier: metadata.rewardTier,
        amount: amount,
        claimed: false,
      },
      traceId,
    };
    /*
    const amountBigInt = BigInt(Math.floor(amount));
    const traceId = crypto.randomUUID();

    // Create reward record
    const reward = await this.prisma.reward.create({
      data: {
        tenant_id: metadata.tenantId,
        reward_tier: metadata.rewardTier,
        amount: amountBigInt,
        description: metadata.description,
        issued_by: metadata.userId,
      },
    });

    // Lock tokens from treasury for this reward
    await this._treasury.lockTokens(metadata.tenantId, amount, {
      amount,
      reason: `Reward issuance ${reward.id}`,
      tenantId: metadata.tenantId,
      userId: metadata.userId,
      batchId,
    });

    // Log forensic event
    await logForensicEvent({
      type: 'tokenisation',
      action: 'reward_issue',
      tenantId: metadata.tenantId,
      userId: metadata.userId,
      metadata: {
        rewardId: reward.id,
        rewardTier: metadata.rewardTier,
        amount,
        batchId,
      },
      traceId,
    });

    return {
      record: {
        id: reward.id,
        tenantId: reward.tenant_id,
        issuedAt: reward.issued_at.toISOString(),
        tier: reward.reward_tier,
        amount: Number(reward.amount),
        claimed: false,
      },
      traceId,
    };
    */
  }

  async claimReward(rewardId: string) {
    console.warn('RewardsService.claimReward: Tokenisation system is currently disabled.');
    const traceId = crypto.randomUUID();
    return {
      record: {
        id: rewardId,
        tenantId: 0,
        issuedAt: new Date().toISOString(),
        tier: 'MOCK_TIER',
        amount: 0,
        claimed: true,
      },
      traceId,
    };
    /*
    const reward = await this.prisma.reward.findUnique({
      where: { id: rewardId },
    });

    if (!reward || reward.status !== 'AVAILABLE') {
      throw new Error('Reward invalid or already claimed');
    }

    // Get or create rewards pool account
    const account = await this.prisma.tokenisationAccount.findUnique({
      where: {
        tenant_id_account_type: {
          tenant_id: reward.tenant_id,
          account_type: 'REWARDS_POOL',
        },
      },
    }) ?? await this.prisma.tokenisationAccount.create({
      data: {
        tenant_id: reward.tenant_id,
        account_type: 'REWARDS_POOL',
        balance: BigInt(0),
        locked_amount: BigInt(0),
      },
    });

    const traceId = crypto.randomUUID();
    const amount = Number(reward.amount);

    // Unlock tokens to user's account
    await this._treasury.unlockTokens(reward.tenant_id, amount, {
      amount,
      reason: `Reward claim ${rewardId}`,
      tenantId: reward.tenant_id,
      userId: undefined,
    });

    // Mark reward as claimed
    const claimedReward = await this.prisma.reward.update({
      where: { id: rewardId },
      data: {
        status: 'CLAIMED',
      },
    });

    // Create claim record
    await this.prisma.rewardClaim.create({
      data: {
        reward_id: rewardId,
        account_id: account.id,
        tenant_id: reward.tenant_id,
        user_id: 0, // Would be populated by caller with actual user
        trace_id: traceId,
      },
    });

    // Log forensic event
    await logForensicEvent({
      type: 'tokenisation',
      action: 'reward_claim',
      tenantId: reward.tenant_id,
      metadata: {
        rewardId,
        rewardTier: reward.reward_tier,
        amount,
      },
      traceId,
    });

    return {
      record: {
        id: claimedReward.id,
        tenantId: claimedReward.tenant_id,
        issuedAt: claimedReward.issued_at.toISOString(),
        tier: claimedReward.reward_tier,
        amount: Number(claimedReward.amount),
        claimed: true,
      },
      traceId,
    };
    */
  }

  async getLedger(_tenantId?: number) {
    console.warn('RewardsService.getLedger: Tokenisation system is currently disabled.');
    return [];
    /*
    const rewards = await this.prisma.reward.findMany({
      where: tenantId ? { tenant_id: tenantId } : undefined,
    });

    return rewards.map(r => ({
      id: r.id,
      tenantId: r.tenant_id,
      issuedAt: r.issued_at.toISOString(),
      tier: r.reward_tier,
      amount: Number(r.amount),
      status: r.status,
    }));
    */
  }
}
