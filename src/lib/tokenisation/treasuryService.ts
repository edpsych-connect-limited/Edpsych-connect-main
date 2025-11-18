import { PrismaClient } from '@prisma/client';
import { logForensicEvent } from '@/lib/server/forensic';
import crypto from 'crypto';

export interface TreasuryEventMetadata {
  amount: number;
  reason: string;
  tenantId?: number;
  userId?: number;
  batchId?: string;
}

export class TreasuryService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private async getOrCreateAccount(tenantId: number, accountType: string = 'TREASURY') {
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
  }

  async mintTokens(
    tenantId: number,
    amount: number,
    metadata: TreasuryEventMetadata
  ): Promise<string> {
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
  }

  async lockTokens(
    tenantId: number,
    amount: number,
    metadata: TreasuryEventMetadata
  ): Promise<string> {
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
  }

  async unlockTokens(
    tenantId: number,
    amount: number,
    metadata: TreasuryEventMetadata
  ): Promise<string> {
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
  }

  async getBalance(tenantId: number): Promise<number> {
    const account = await this.getOrCreateAccount(tenantId, 'TREASURY');
    return Number(account.balance);
  }

  async getAccountDetails(tenantId: number) {
    return this.getOrCreateAccount(tenantId, 'TREASURY');
  }
}
