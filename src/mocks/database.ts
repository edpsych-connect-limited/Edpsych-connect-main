/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

// Mock implementation of @edpsych-connect-world/database

export const prisma = {
  user: {
    findUnique: async () => ({ id: '1', name: 'Demo User', email: 'demo@edpsychconnect.com' }),
    findMany: async () => [{ id: '1', name: 'Demo User', email: 'demo@edpsychconnect.com' }],
    create: async (data: any) => ({ id: '1', ...data.data }),
    update: async (data: any) => ({ id: '1', ...data.data }),
    delete: async () => ({ id: '1', name: 'Demo User' }),
  },
  assessment: {
    findUnique: async () => ({ id: '1', title: 'Sample Assessment', createdAt: new Date() }),
    findMany: async () => [{ id: '1', title: 'Sample Assessment', createdAt: new Date() }],
    create: async (data: any) => ({ id: '1', ...data.data }),
    update: async (data: any) => ({ id: '1', ...data.data }),
    delete: async () => ({ id: '1', title: 'Sample Assessment' }),
  },
  course: {
    findUnique: async () => ({ id: '1', title: 'Sample Course', createdAt: new Date() }),
    findMany: async () => [{ id: '1', title: 'Sample Course', createdAt: new Date() }],
    create: async (data: any) => ({ id: '1', ...data.data }),
    update: async (data: any) => ({ id: '1', ...data.data }),
    delete: async () => ({ id: '1', title: 'Sample Course' }),
  },
  // Add other models as needed
};

export const connectToDatabase = async () => {
  return { prisma };
};

export default prisma;
