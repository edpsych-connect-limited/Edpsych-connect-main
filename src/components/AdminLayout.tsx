'use client'

import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import React from 'react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, isAuthenticated, hasRole, logout } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (!hasRole('admin') && !hasRole('superadmin')) {
    router.push('/403');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">{user?.email}</span>
          <button
            onClick={logout}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="w-64 bg-gray-800 text-white p-4">
          <nav className="space-y-2">
            <Link href="/admin/overview" className="block px-2 py-1 rounded hover:bg-gray-700">
              Overview
            </Link>
            <Link href="/admin/users" className="block px-2 py-1 rounded hover:bg-gray-700">
              Users
            </Link>
            <Link href="/admin/subscriptions" className="block px-2 py-1 rounded hover:bg-gray-700">
              Subscriptions
            </Link>
            <Link href="/admin/games" className="block px-2 py-1 rounded hover:bg-gray-700">
              Games
            </Link>
            <Link href="/admin/settings" className="block px-2 py-1 rounded hover:bg-gray-700">
              Settings
            </Link>
          </nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;