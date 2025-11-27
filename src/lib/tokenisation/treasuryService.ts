/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

// import { logForensicEvent } from '@/lib/server/forensic';
import crypto from 'crypto';

export interface TreasuryEventMetadata {
  amount: number;
  reason: string;
  tenantId?: number;
  userId?: number;
  batchId?: string;
}

export class TreasuryService {
  constructor() {
  }

  private async getOrCreateAccount(tenantId: number, accountType: string = 'TREASURY') {
    console.warn('TreasuryService.getOrCreateAccount: Tokenisation system is currently disabled.');
    return {
      id: 'mock-account-id',
      tenant_id: tenantId,
      account_type: accountType,
      balance: BigInt(0),
      locked_amount: BigInt(0),
    };
    /*
    return this.prisma.tokenisationAccount.upsert({
      where: {
        tenant_id_account_type: {
          tenant_id: tenantId,
          account_type: accountType,
        },
      },
      update: {},
      create: {
        tenant_id: tenantId,
        account_type: accountType,
        balance: BigInt(0),
        locked_amount: BigInt(0),
      },
    });
    */
  }

  async mintTokens(
    _tenantId: number,
    _amount: number,
    _metadata: TreasuryEventMetadata
  ): Promise<string> {
    console.warn('TreasuryService.mintTokens: Tokenisation system is currently disabled.');
    return crypto.randomUUID();
    /*
    const amountBigInt = BigInt(Math.floor(amount));
    const account = await this.getOrCreateAccount(tenantId, 'TREASURY');
    
    // Generate immutable trace ID
    const traceId = crypto.randomUUID();

    // Update balance in database
    const _updated = await this.prisma.tokenisationAccount.update({
      where: { id: account.id },
      data: {
        balance: {
          increment: amountBigInt,
        },
        updated_at: new Date(),
      },
    });

    // Record transaction
    await this.prisma.tokenisationTransaction.create({
      data: {
        account_id: account.id,
        tenant_id: tenantId,
        transaction_type: 'MINT',
        amount: amountBigInt,
        reason: metadata.reason,
        user_id: metadata.userId,
        batch_id: metadata.batchId,
        trace_id: traceId,
      },
    });

    // Log forensic event
    await logForensicEvent({
      type: 'tokenisation',
      action: 'mint',
      tenantId,
      metadata: {
        ...metadata,
        amount,
      },
      traceId,
    });

    return traceId;
    */
  }

  async lockTokens(
    _tenantId: number,
    _amount: number,
    _metadata: TreasuryEventMetadata
  ): Promise<string> {
    console.warn('TreasuryService.lockTokens: Tokenisation system is currently disabled.');
    return crypto.randomUUID();
    /*
    const amountBigInt = BigInt(Math.floor(amount));
    const account = await this.getOrCreateAccount(tenantId, 'TREASURY');

    // Check sufficient balance
    if (account.balance < amountBigInt) {
      throw new Error(`Insufficient balance to lock. Required: ${amount}, Available: ${account.balance.toString()}`);
    }

    const traceId = crypto.randomUUID();

    // Update balance and locked amount
    await this.prisma.tokenisationAccount.update({
      where: { id: account.id },
      data: {
        balance: {
          decrement: amountBigInt,
        },
        locked_amount: {
          increment: amountBigInt,
        },
        updated_at: new Date(),
      },
    });

    // Record transaction
    await this.prisma.tokenisationTransaction.create({
      data: {
        account_id: account.id,
        tenant_id: tenantId,
        transaction_type: 'LOCK',
        amount: amountBigInt,
        reason: metadata.reason,
        user_id: metadata.userId,
        batch_id: metadata.batchId,
        trace_id: traceId,
      },
    });

    await logForensicEvent({
      type: 'tokenisation',
      action: 'lock',
      tenantId,
      metadata: {
        ...metadata,
        amount,
      },
      traceId,
    });

    return traceId;
    */
  }

  async unlockTokens(
    _tenantId: number,
    _amount: number,
    _metadata: TreasuryEventMetadata
  ): Promise<string> {
    console.warn('TreasuryService.unlockTokens: Tokenisation system is currently disabled.');
    return crypto.randomUUID();
    /*
    const amountBigInt = BigInt(Math.floor(amount));
    const account = await this.getOrCreateAccount(tenantId, 'TREASURY');

    // Check sufficient locked amount
    if (account.locked_amount < amountBigInt) {
      throw new Error(`Insufficient locked amount to unlock. Required: ${amount}, Locked: ${account.locked_amount.toString()}`);
    }

    const traceId = crypto.randomUUID();

    // Update balance and locked amount
    await this.prisma.tokenisationAccount.update({
      where: { id: account.id },
      data: {
        balance: {
          increment: amountBigInt,
        },
        locked_amount: {
          decrement: amountBigInt,
        },
        updated_at: new Date(),
      },
    });

    // Record transaction
    await this.prisma.tokenisationTransaction.create({
      data: {
        account_id: account.id,
        tenant_id: tenantId,
        transaction_type: 'UNLOCK',
        amount: amountBigInt,
        reason: metadata.reason,
        user_id: metadata.userId,
        batch_id: metadata.batchId,
        trace_id: traceId,
      },
    });

    await logForensicEvent({
      type: 'tokenisation',
      action: 'unlock',
      tenantId,
      metadata: {
        ...metadata,
        amount,
      },
      traceId,
    });

    return traceId;
    */
  }

  async getBalance(_tenantId: number): Promise<number> {
    console.warn('TreasuryService.getBalance: Tokenisation system is currently disabled.');
    return 0;
    /*
    const account = await this.getOrCreateAccount(tenantId, 'TREASURY');
    return Number(account.balance);
    */
  }

  async getAccountDetails(tenantId: number) {
    console.warn('TreasuryService.getAccountDetails: Tokenisation system is currently disabled.');
    return {
      id: 'mock-account-id',
      tenant_id: tenantId,
      account_type: 'TREASURY',
      balance: BigInt(0),
      locked_amount: BigInt(0),
    };
    /*
    return this.getOrCreateAccount(tenantId, 'TREASURY');
    */
  }
}
