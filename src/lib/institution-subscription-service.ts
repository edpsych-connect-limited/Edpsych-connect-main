import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

 
// Define our own enums instead of importing from Prisma
export enum PlanInterval {
  MONTHLY = 'MONTHLY',
  ANNUAL = 'ANNUAL'
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  PAST_DUE = 'PAST_DUE',
  PENDING = 'PENDING',
  TRIALING = 'TRIALING',
  EXPIRED = 'EXPIRED'
}
 


// Mock subscription data
const MOCK_SUBSCRIPTIONS = [
  {
    id: "mock-sub-1",
    institutionId: "mock-institution-1",
    planId: "plan-enterprise",
    status: SubscriptionStatus.ACTIVE,
    startDate: new Date("2025-01-01"),
    endDate: new Date("2026-01-01"),
    interval: PlanInterval.ANNUAL,
    billingContact: {
      id: "billing-1",
      name: "Finance Department",
      email: "finance@example.edu"
    },
    institution: {
      id: "mock-institution-1",
      name: "Cambridge University"
    },
    plan: {
      id: "plan-enterprise",
      name: "Enterprise",
      features: ["All Features"]
    }
  }
];

export class InstitutionSubscriptionService {
  createSubscription(data: any) {
    try {
      logger.info('Creating subscription (mock)', { id: data.id, planId: data.planId });
      return { 
        id: `mock-subscription-${Date.now()}`, 
        ...data,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        interval: PlanInterval.ANNUAL
      };
    } catch (error: any) {
      logger.error('Failed to create subscription', error);
      throw error;
    }
  }

  async getSubscription(id: string) {
    try {
      logger.info('Getting subscription (mock)', { subscriptionId: id });
      return MOCK_SUBSCRIPTIONS.find(sub => sub.id === id) || MOCK_SUBSCRIPTIONS[0];
    } catch (error: any) {
      logger.error('Failed to get subscription', error, { subscriptionId: id });
      throw new Error(`Failed to get subscription: ${error.message}`);
    }
  }

  async cancelSubscription(id: string, immediate = false) {
    try {
      logger.info('Canceling subscription (mock)', { subscriptionId: id, immediate });
      return {
        id,
        status: immediate ? SubscriptionStatus.CANCELED : SubscriptionStatus.ACTIVE,
        canceledAt: immediate ? new Date() : null,
        cancelAtPeriodEnd: !immediate
      };
    } catch (error: any) {
      logger.error('Failed to cancel subscription', error, { subscriptionId: id });
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  async updateSubscription(id: string, data: any) {
    try {
      logger.info('Updating subscription (mock)', { subscriptionId: id, data });
      return {
        id,
        ...data,
        updatedAt: new Date()
      };
    } catch (error: any) {
      logger.error('Failed to update subscription', error, { subscriptionId: id });
      throw new Error(`Failed to update subscription: ${error.message}`);
    }
  }
}

export const institutionSubscriptionService = new InstitutionSubscriptionService();
export default institutionSubscriptionService;
