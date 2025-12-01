/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useState, useEffect, useId } from 'react';

interface License {
  id: string;
  assignedTo: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'ASSIGNED';
  assignedDate?: string;
  expiryDate?: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  pricePerLicense: number;
  currency: string;
  features: string[];
}

interface Subscription {
  id: string;
  institutionId: string;
  planId: string;
  plan?: SubscriptionPlan;
  status: 'ACTIVE' | 'INACTIVE' | 'TRIAL' | 'CANCELLED' | 'EXPIRED';
  startDate: string;
  endDate: string;
  renewalDate: string;
  totalLicenses: number;
  assignedLicenses: number;
  volumeDiscount: number;
  billingCycle: 'MONTHLY' | 'ANNUAL' | 'QUARTERLY';
  totalAmount: number;
  licenses?: License[];
}

interface Invoice {
  id: string;
  subscriptionId: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'PAID' | 'UNPAID' | 'OVERDUE' | 'CANCELLED';
  paidDate?: string;
}

interface SubscriptionManagementProps {
  id: string;
  initialSubscription?: Subscription;
}

// Mock available plans for demonstration
const mockPlans: SubscriptionPlan[] = [
  {
    id: 'plan_basic',
    name: 'Basic School',
    description: 'Essential tools for small educational institutions',
    pricePerLicense: 10,
    currency: 'GBP',
    features: [
      'Assessment engine',
      'Intervention framework',
      'UK curriculum mapping',
      'Basic reporting'
    ]
  },
  {
    id: 'plan_professional',
    name: 'Professional',
    description: 'Comprehensive toolkit for mid-sized institutions',
    pricePerLicense: 20,
    currency: 'GBP',
    features: [
      'All Basic features',
      'Advanced analytics',
      'Content management system',
      'Resource library',
      'Multi-department support'
    ]
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise',
    description: 'Complete solution for large educational organizations',
    pricePerLicense: 30,
    currency: 'GBP',
    features: [
      'All Professional features',
      'Predictive analytics',
      'Custom assessment templates',
      'API access',
      'Dedicated support',
      'Professional development recommendations'
    ]
  }
];

// Mock invoices for demonstration
const mockInvoices: Invoice[] = [
  {
    id: 'inv_001',
    subscriptionId: 'sub_001',
    date: '2025-08-01',
    dueDate: '2025-08-15',
    amount: 3000,
    status: 'PAID',
    paidDate: '2025-08-10'
  },
  {
    id: 'inv_002',
    subscriptionId: 'sub_001',
    date: '2025-07-01',
    dueDate: '2025-07-15',
    amount: 3000,
    status: 'PAID',
    paidDate: '2025-07-08'
  },
  {
    id: 'inv_003',
    subscriptionId: 'sub_001',
    date: '2025-06-01',
    dueDate: '2025-06-15',
    amount: 2500,
    status: 'PAID',
    paidDate: '2025-06-12'
  }
];

// Helper component to avoid inline styles
const ProgressBar = ({ progress }: { progress: number }) => {
  const id = useId().replace(/:/g, '');
  return (
    <>
      <style>{`
        .progress-${id} {
          width: ${progress}%;
        }
      `}</style>
      <div
        className={`h-full bg-blue-600 rounded-full progress-${id}`}
      />
    </>
  );
};

const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({
  id,
  initialSubscription
}) => {
  const [subscription, setSubscription] = useState<Subscription | null>(initialSubscription || null);
  const [loading, setLoading] = useState<boolean>(!initialSubscription);
  const [error, setError] = useState<string | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'licenses' | 'billing' | 'plans'>('overview');
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [licenseCount, setLicenseCount] = useState<number>(0);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL' | 'QUARTERLY'>('ANNUAL');

  const fetchSubscription = React.useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/institutions/${id}/subscriptions`);
      
      if (!response.ok) {
        throw new Error(`Error fetching subscription: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSubscription(data);
      
      if (data) {
        setLicenseCount(data.totalLicenses);
        setBillingCycle(data.billingCycle);
        setSelectedPlan(data.planId);
      }
    } catch (_err) {
      console.error('Error fetching subscription:', _err);
      setError(_err instanceof Error ? _err.message : 'An error occurred while loading subscription data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!initialSubscription) {
      fetchSubscription();
    }
    
    // Use mock data for demo purposes
    setAvailablePlans(mockPlans);
    setInvoices(mockInvoices);
    
    // In a real implementation, you would fetch these from an API
    // fetchPlans();
    // fetchInvoices();
  }, [id, initialSubscription, fetchSubscription]);

  const handlePlanChange = (planId: string) => {
    setSelectedPlan(planId);
    
    // Find the selected plan to determine minimum license requirements, etc.
    const plan = availablePlans.find(p => p.id === planId);
    
    if (plan) {
      // Update license count if needed
      // This could enforce minimum license requirements per plan
      if (licenseCount < 5) {
        setLicenseCount(5); // Example minimum
      }
    }
  };

  const handleLicenseCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value, 10) || 0;
    setLicenseCount(Math.max(0, count));
  };

  const handleBillingCycleChange = (cycle: 'MONTHLY' | 'ANNUAL' | 'QUARTERLY') => {
    setBillingCycle(cycle);
  };

  const handleUpgradeSubscription = async () => {
    if (!selectedPlan) return;
    
    try {
      const response = await fetch(`/api/institutions/${id}/subscriptions`, {
        method: subscription ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan,
          totalLicenses: licenseCount,
          billingCycle: billingCycle
        }),
      });

      if (!response.ok) {
        throw new Error(`Error updating subscription: ${response.statusText}`);
      }

      const updatedSubscription = await response.json();
      setSubscription(updatedSubscription);
      setShowUpgradeModal(false);
      
      // Show success message
    } catch (_err) {
      console.error('Error updating subscription:', _err);
      setError(err instanceof Error ? err.message : 'An error occurred while updating the subscription');
    }
  };

  const calculatePrice = () => {
    if (!selectedPlan) return 0;
    
    const plan = availablePlans.find(p => p.id === selectedPlan);
    if (!plan) return 0;
    
    let price = plan.pricePerLicense * licenseCount;
    
    // Apply volume discounts
    let discount = 0;
    if (licenseCount >= 100) {
      discount = 0.25; // 25% discount for 100+ licenses
    } else if (licenseCount >= 50) {
      discount = 0.15; // 15% discount for 50+ licenses
    } else if (licenseCount >= 20) {
      discount = 0.10; // 10% discount for 20+ licenses
    } else if (licenseCount >= 10) {
      discount = 0.05; // 5% discount for 10+ licenses
    }
    
    price = price * (1 - discount);
    
    // Apply billing cycle adjustments
    if (billingCycle === 'ANNUAL') {
      price = price * 12 * 0.9; // 10% discount for annual billing
    } else if (billingCycle === 'QUARTERLY') {
      price = price * 3 * 0.95; // 5% discount for quarterly billing
    }
    
    return Math.round(price * 100) / 100;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {!subscription ? (
        <div className="bg-yellow-50 p-5 rounded-lg border border-yellow-200">
          <h3 className="font-medium text-yellow-800">No Active Subscription</h3>
          <p className="mt-2 text-sm text-yellow-700">
            This institution doesn&apos;t have an active subscription. Add a subscription plan to enable access to platform features.
          </p>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="mt-3 px-4 py-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
          >
            Add Subscription
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-900">Current Subscription</h3>
              <p className="text-sm text-gray-500">
                Manage your institution&apos;s subscription and licenses
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Change Plan
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-5 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800">
                    {subscription.status}
                  </span>
                  <h3 className="mt-1 text-lg font-medium">
                    {subscription.plan?.name || 'Unknown Plan'}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {subscription.plan?.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {subscription.plan?.currency} {subscription.totalAmount}
                  </p>
                  <p className="text-sm text-gray-500">
                    {subscription.billingCycle === 'MONTHLY' ? 'Monthly' : 
                     subscription.billingCycle === 'ANNUAL' ? 'Annually' : 'Quarterly'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="text-sm text-gray-500">Licenses</h4>
                <div className="flex justify-between mt-1">
                  <p className="font-medium">{subscription.assignedLicenses} used</p>
                  <p className="text-sm">{subscription.totalLicenses} total</p>
                </div>
                <div className="w-full mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <ProgressBar progress={(subscription.assignedLicenses / subscription.totalLicenses) * 100} />
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="text-sm text-gray-500">Volume Discount</h4>
                <p className="font-medium mt-1">{subscription.volumeDiscount * 100}%</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="text-sm text-gray-500">Start Date</h4>
                <p className="font-medium mt-1">{new Date(subscription.startDate).toLocaleDateString()}</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="text-sm text-gray-500">Renewal Date</h4>
                <p className="font-medium mt-1">{new Date(subscription.renewalDate).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="p-5 border-t border-gray-200">
              <h4 className="font-medium mb-3">Plan Features</h4>
              {subscription.plan?.features ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {subscription.plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No feature information available</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderLicenses = () => {
    if (!subscription || !subscription.licenses) {
      return (
        <div className="bg-yellow-50 p-5 rounded-lg border border-yellow-200">
          <h3 className="font-medium text-yellow-800">No License Information Available</h3>
          <p className="mt-2 text-sm text-yellow-700">
            Please add a subscription plan or contact support for assistance.
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-gray-900">License Management</h3>
            <p className="text-sm text-gray-500">
              Manage and assign licenses to users
            </p>
          </div>
          <div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add More Licenses
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">License Usage</h4>
                <p className="text-sm text-gray-500">
                  {subscription.assignedLicenses} of {subscription.totalLicenses} licenses assigned
                </p>
              </div>
              <div>
                <span className={`px-3 py-1 text-sm rounded-full ${
                  subscription.assignedLicenses / subscription.totalLicenses > 0.9
                    ? 'bg-red-100 text-red-800'
                    : subscription.assignedLicenses / subscription.totalLicenses > 0.7
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {Math.round((subscription.assignedLicenses / subscription.totalLicenses) * 100)}% Used
                </span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscription.licenses.map((license) => (
                  <tr key={license.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {license.id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        license.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        license.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {license.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {license.assignedTo || '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {license.assignedDate ? new Date(license.assignedDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {license.expiryDate ? new Date(license.expiryDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => { /* Handle assignment/revocation */ }}
                      >
                        {license.assignedTo ? 'Revoke' : 'Assign'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderBilling = () => {
    if (!subscription) {
      return (
        <div className="bg-yellow-50 p-5 rounded-lg border border-yellow-200">
          <h3 className="font-medium text-yellow-800">No Billing Information Available</h3>
          <p className="mt-2 text-sm text-yellow-700">
            Please add a subscription plan to view billing information.
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="font-medium text-gray-900">Billing History</h3>
          <p className="text-sm text-gray-500">
            View and download invoices
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-4 text-sm text-center text-gray-500">
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {new Date(invoice.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {subscription.plan?.currency} {invoice.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'UNPAID' ? 'bg-yellow-100 text-yellow-800' :
                          invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => { /* Handle download/payment */ }}
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderPlans = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-gray-900">Available Plans</h3>
        <p className="text-sm text-gray-500">
          Compare subscription plans and features
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {availablePlans.map((plan) => {
          const isCurrentPlan = subscription?.planId === plan.id;
          
          return (
            <div
              key={plan.id}
              className={`bg-white rounded-lg shadow overflow-hidden border-2 ${
                isCurrentPlan ? 'border-blue-500' : 'border-transparent'
              }`}
            >
              <div className="p-5 border-b">
                {isCurrentPlan && (
                  <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 mb-2">
                    Current Plan
                  </span>
                )}
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-gray-500 mt-1">{plan.description}</p>
                <p className="text-2xl font-bold mt-4">
                  {plan.currency} {plan.pricePerLicense}
                </p>
                <p className="text-sm text-gray-500">per license</p>
              </div>
              
              <div className="p-5">
                <h4 className="font-medium mb-3">Features</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-5 border-t">
                {isCurrentPlan ? (
                  <button
                    onClick={() => {
                      setSelectedPlan(plan.id);
                      setLicenseCount(subscription.totalLicenses);
                      setBillingCycle(subscription.billingCycle);
                      setShowUpgradeModal(true);
                    }}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  >
                    Modify Subscription
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedPlan(plan.id);
                      setLicenseCount(subscription ? subscription.totalLicenses : 10);
                      setBillingCycle(subscription ? subscription.billingCycle : 'ANNUAL');
                      setShowUpgradeModal(true);
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {subscription ? 'Switch to This Plan' : 'Select This Plan'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading subscription data...</div>;
  }

  if (error) {
    return (
      <div className="p-5 bg-red-50 text-red-500 rounded">
        <h3 className="font-semibold">Error</h3>
        <p>{error}</p>
        <button 
          onClick={fetchSubscription}
          className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 text-sm mt-2"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="border-b mb-6">
        <ul className="flex space-x-2">
          <li>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('licenses')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'licenses'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Licenses
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('billing')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'billing'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Billing
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'plans'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Plans
            </button>
          </li>
        </ul>
      </div>
      
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'licenses' && renderLicenses()}
      {activeTab === 'billing' && renderBilling()}
      {activeTab === 'plans' && renderPlans()}
      
      {/* Upgrade/Change Plan Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{subscription ? 'Change Subscription' : 'Add Subscription'}</h3>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close modal"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="plan" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Plan
                </label>
                <select
                  id="plan"
                  value={selectedPlan}
                  onChange={(e) => handlePlanChange(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select a plan</option>
                  {availablePlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - {plan.currency} {plan.pricePerLicense}/license
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="licenses" className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Licenses
                </label>
                <div className="flex items-center">
                  <input
                    id="licenses"
                    type="number"
                    min="1"
                    value={licenseCount}
                    onChange={handleLicenseCountChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {licenseCount >= 100 ? '25% volume discount applied'
                  : licenseCount >= 50 ? '15% volume discount applied'
                  : licenseCount >= 20 ? '10% volume discount applied'
                  : licenseCount >= 10 ? '5% volume discount applied'
                  : 'Add 10+ licenses for a 5% discount'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Billing Cycle
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={billingCycle === 'MONTHLY'}
                      onChange={() => handleBillingCycleChange('MONTHLY')}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm">Monthly</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={billingCycle === 'QUARTERLY'}
                      onChange={() => handleBillingCycleChange('QUARTERLY')}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm">Quarterly (5% off)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={billingCycle === 'ANNUAL'}
                      onChange={() => handleBillingCycleChange('ANNUAL')}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm">Annual (10% off)</span>
                  </label>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded mt-6">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-500">Plan</span>
                  <span className="text-sm font-medium">
                    {selectedPlan ? availablePlans.find(p => p.id === selectedPlan)?.name : '—'}
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-500">Licenses</span>
                  <span className="text-sm font-medium">{licenseCount}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-500">Billing Cycle</span>
                  <span className="text-sm font-medium">
                    {billingCycle === 'MONTHLY' ? 'Monthly' : billingCycle === 'ANNUAL' ? 'Annual' : 'Quarterly'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t mt-2">
                  <span className="font-medium">Total</span>
                  <span className="font-bold">
                    {selectedPlan ? `${availablePlans.find(p => p.id === selectedPlan)?.currency} ${calculatePrice()}` : '—'}
                    {billingCycle === 'MONTHLY' ? '/month' : billingCycle === 'ANNUAL' ? '/year' : '/quarter'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpgradeSubscription}
                disabled={!selectedPlan || licenseCount <= 0}
                className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
                  !selectedPlan || licenseCount <= 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {subscription ? 'Update Subscription' : 'Add Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;