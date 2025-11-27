/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

// Mock implementation of @edpsych-connect-world/auth
// This provides the minimal implementation needed for successful building

export const getSession = async () => {
  return {
    user: {
      name: 'Demo User',
      email: 'demo@edpsychconnect.com',
      image: '/images/avatars/default.png',
      role: 'user'
    },
    expires: '2025-12-31T23:59:59.999Z'
  };
};

export const getServerSession = async () => {
  return await getSession();
};

export const signIn = async () => {
  return { ok: true, error: null };
};

export const signOut = async () => {
  return { ok: true };
};

export const useSession = () => {
  return {
    data: {
      user: {
        name: 'Demo User',
        email: 'demo@edpsychconnect.com',
        image: '/images/avatars/default.png',
        role: 'user'
      },
      expires: '2025-12-31T23:59:59.999Z'
    },
    status: 'authenticated',
    update: async () => {}
  };
};

export const authOptions = {
  providers: [],
  callbacks: {},
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  }
};