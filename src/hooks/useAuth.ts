/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { useAuth as useRealAuth } from '@/lib/auth/hooks';

interface User {
  id: string;
  name: string;
  email: string;
}

function useAuth() {
    const { user: realUser, isAuthenticated } = useRealAuth();

    // Map the real user object to the interface expected by consumers of this hook
    const user: User | null = realUser ? {
        id: realUser.id,
        name: realUser.name || realUser.email.split('@')[0],
        email: realUser.email,
    } : null;

    return { user, isAuthenticated };
}

export default useAuth;
