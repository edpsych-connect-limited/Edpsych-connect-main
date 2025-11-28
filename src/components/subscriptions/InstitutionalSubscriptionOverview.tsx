import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';

import { useAuth } from '../../lib/auth/hooks';
interface Subscription {
  id: string;
  institution: string;
  plan: string;
  seats: number;
  active: boolean;
  renewalDate: string;
}

const mockSubscriptions: Subscription[] = [
  {
    id: 'sub_001',
    institution: 'Oxford University',
    plan: 'Enterprise',
    seats: 500,
    active: true,
    renewalDate: '2026-01-01',
  },
  {
    id: 'sub_002',
    institution: 'Cambridge University',
    plan: 'Pro',
    seats: 200,
    active: false,
    renewalDate: '2025-12-01',
  },
];

const InstitutionalSubscriptionOverview: React.FC = () => {
  const { hasRole } = useAuth();

  if (!hasRole('admin') && !hasRole('superadmin')) {
    return <p className="text-red-600">You do not have permission to view subscriptions.</p>;
  }

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Institutional Subscriptions</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Institution</th>
            <th className="p-2 border">Plan</th>
            <th className="p-2 border">Seats</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Renewal Date</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockSubscriptions.map((sub) => (
            <tr key={sub.id} className="hover:bg-gray-50">
              <td className="p-2 border">{sub.institution}</td>
              <td className="p-2 border">{sub.plan}</td>
              <td className="p-2 border">{sub.seats}</td>
              <td className="p-2 border">
                {sub.active ? (
                  <span className="text-green-600 font-semibold">Active</span>
                ) : (
                  <span className="text-red-600 font-semibold">Inactive</span>
                )}
              </td>
              <td className="p-2 border">{sub.renewalDate}</td>
              <td className="p-2 border">
                <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2">
                  Manage
                </button>
                <button className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600">
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InstitutionalSubscriptionOverview;