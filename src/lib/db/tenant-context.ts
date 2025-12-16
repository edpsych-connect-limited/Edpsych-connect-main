import { AsyncLocalStorage } from 'node:async_hooks';
import type { PrismaClient } from '@prisma/client';

export type TenantContext = {
  tenantId?: number;
  userId?: string;
  prisma?: PrismaClient;
};

const tenantContextStorage = new AsyncLocalStorage<TenantContext>();

export function setTenantContext(ctx: TenantContext): void {
  // enterWith is available in modern Node versions and persists for the current async call chain.
  tenantContextStorage.enterWith(ctx);
}

export function getTenantContext(): TenantContext | undefined {
  return tenantContextStorage.getStore();
}
