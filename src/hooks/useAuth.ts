/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

function useAuth() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Placeholder: simulate a logged-in user
        setUser({
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
        });
    }, []);

    return { user, isAuthenticated: !!user };
}

export default useAuth;
