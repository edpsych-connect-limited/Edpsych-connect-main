'use client';

import React, { useEffect, useState } from 'react';
import { getStripeConnectStatus, createStripeConnectOnboarding, getStripeDashboardLink } from '@/actions/stripe-connect-actions';
import { CreditCard, ExternalLink, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PayoutsSettings() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const data = await getStripeConnectStatus();
      setStatus(data);
    } catch (error) {
      toast.error('Failed to load payout settings');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setActionLoading(true);
      const url = await createStripeConnectOnboarding();
      window.location.href = url;
    } catch (error) {
      toast.error('Failed to start onboarding');
      setActionLoading(false);
    }
  };

  const handleDashboard = async () => {
    try {
      setActionLoading(true);
      const url = await getStripeDashboardLink();
      window.open(url, '_blank');
    } catch (error) {
      toast.error('Failed to access dashboard');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              Payout Settings
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Manage how you receive payments for your services and resources.
            </p>
          </div>
          {status?.connected && (
             <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
               <CheckCircle className="w-4 h-4" />
               Active
             </span>
          )}
        </div>

        {!status?.connected ? (
          <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-6 text-center border border-slate-200 dark:border-slate-700 border-dashed">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Setup Payouts</h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
              Connect your bank account via Stripe to receive payments for consultations, resources, and subscriptions.
            </p>
            <button
              onClick={handleConnect}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              Connect with Stripe
            </button>
            <p className="text-xs text-slate-500 mt-4 flex items-center justify-center gap-1">
               <ShieldIcon className="w-3 h-3" /> Secure payments powered by Stripe
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
               <StatusCard 
                 title="Payout Status" 
                 value={status.status?.payoutsEnabled ? 'Enabled' : 'Restricted'} 
                 active={status.status?.payoutsEnabled}
               />
               <StatusCard 
                 title="Payments Status" 
                 value={status.status?.chargesEnabled ? 'Active' : 'Pending'} 
                 active={status.status?.chargesEnabled}
               />
            </div>

            {status.status?.requirements?.currently_due?.length > 0 && (
               <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg p-4 flex items-start gap-3">
                 <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                 <div>
                   <h4 className="font-medium text-amber-900 dark:text-amber-200">Action Required</h4>
                   <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                     Stripe needs additional information to enable payouts. Please visit your dashboard to update your details.
                   </p>
                 </div>
               </div>
            )}

            <div className="flex border-t border-slate-200 dark:border-slate-700 pt-6">
              <button
                onClick={handleDashboard}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                View Stripe Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusCard({ title, value, active }: { title: string; value: string; active: boolean }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-100 dark:border-slate-700">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-500' : 'bg-amber-500'}`} />
        <span className="font-semibold text-slate-900 dark:text-white">{value}</span>
      </div>
    </div>
  );
}

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
