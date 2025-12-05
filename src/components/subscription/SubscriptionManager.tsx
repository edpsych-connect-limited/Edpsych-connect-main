'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import useSubscription from '../../hooks/useSubscription';
import { SubscriptionStatus, SubscriptionTier, BillingCycle } from '../../types';


interface SubscriptionManagerProps {
  className?: string;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ className = '' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionData = useSession();
  const session = sessionData?.data ?? null;
  const { subscription, isActive, tier, status } = useSubscription();

  const handleManageSubscription = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/subscriptions/create-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to create customer portal session');
      }
      
      const { url } = await response.json();
      window.location.href = url;
    } catch (_err) {
      console.error('Error creating portal session:', _err);
      setError('There was an error opening the subscription management portal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (amount: number | undefined) => {
    if (amount === undefined) return '£0.00';
    return `£${(amount / 100).toFixed(2)}`;
  };

  const getBillingCycleLabel = (cycle: BillingCycle | undefined) => {
    if (!cycle) return '';
    
    switch (cycle) {
      case BillingCycle.MONTHLY:
        return 'Monthly';
      case BillingCycle.TERMLY:
        return 'Termly';
      case BillingCycle.ANNUALLY:
        return 'Annually';
      default:
        return '';
    }
  };

  const getTierLabel = (tier: SubscriptionTier | null) => {
    if (!tier) return 'No Subscription';
    
    switch (tier) {
      case SubscriptionTier.ESSENTIAL:
        return 'Essential';
      case SubscriptionTier.PROFESSIONAL:
        return 'Professional';
      case SubscriptionTier.ENTERPRISE:
        return 'Enterprise';
      case SubscriptionTier.PSYCHOLOGIST:
        return 'Educational Psychologist';
      case SubscriptionTier.RESEARCHER:
        return 'Researcher';
      case SubscriptionTier.CUSTOM:
        return 'Custom';
      default:
        return 'Unknown';
    }
  };

  const getStatusLabel = (status: SubscriptionStatus | null) => {
    if (!status) return 'Inactive';
    
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return 'Active';
      case SubscriptionStatus.PAST_DUE:
        return 'Past Due';
      case SubscriptionStatus.CANCELLED:
        return 'Cancelled';
      case SubscriptionStatus.UNPAID:
        return 'Unpaid';
      case SubscriptionStatus.TRIALING:
        return 'Trial';
      case SubscriptionStatus.TRIAL_EXPIRED:
        return 'Trial Expired';
      default:
        return 'Inactive';
    }
  };

  const getStatusColor = (status: SubscriptionStatus | null) => {
    if (!status) return 'bg-gray-200 text-gray-800';
    
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case SubscriptionStatus.PAST_DUE:
        return 'bg-yellow-100 text-yellow-800';
      case SubscriptionStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      case SubscriptionStatus.UNPAID:
        return 'bg-red-100 text-red-800';
      case SubscriptionStatus.TRIALING:
        return 'bg-blue-100 text-blue-800';
      case SubscriptionStatus.TRIAL_EXPIRED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  if (!session) {
    return (
      <div className={`subscription-manager ${className}`}>
        <div className="not-logged-in">
          <p>Please log in to view your subscription details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`subscription-manager ${className}`}>
      <h2 className="section-title">Your Subscription</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="subscription-card">
        <div className="subscription-header">
          <h3>{getTierLabel(tier)}</h3>
          <span className={`status-badge ${getStatusColor(status)}`}>
            {getStatusLabel(status)}
          </span>
        </div>
        
        {subscription ? (
          <div className="subscription-details">
            <div className="detail-row">
              <span className="detail-label">Billing Cycle:</span>
              <span className="detail-value">{getBillingCycleLabel(subscription.billingCycle)}</span>
            </div>
            
            {subscription.currentPeriodEnd && (
              <div className="detail-row">
                <span className="detail-label">Next Billing Date:</span>
                <span className="detail-value">{formatDate(subscription.currentPeriodEnd)}</span>
              </div>
            )}
            
            {subscription.quantity && (
              <div className="detail-row">
                <span className="detail-label">Number of Pupils:</span>
                <span className="detail-value">{subscription.quantity}</span>
              </div>
            )}
            
            {subscription.amount && (
              <div className="detail-row">
                <span className="detail-label">Amount:</span>
                <span className="detail-value">{formatPrice(subscription.amount)}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="no-subscription-message">
            <p>You don&apos;t have an active subscription.</p>
            <p>Choose a plan to get started with EdPsych Connect.</p>
          </div>
        )}
        
        <div className="subscription-actions">
          {isActive ? (
            <button 
              className="manage-btn"
              onClick={handleManageSubscription}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Manage Subscription'}
            </button>
          ) : (
            <Link href="/pricing" className="btn-primary">
              View Pricing Plans
            </Link>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .subscription-manager {
          margin: 2rem 0;
        }
        
        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: #333;
        }
        
        .subscription-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
        }
        
        .subscription-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #eee;
        }
        
        .subscription-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a44c0;
          margin: 0;
        }
        
        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .subscription-details {
          margin-bottom: 1.5rem;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }
        
        .detail-label {
          color: #666;
          font-weight: 500;
        }
        
        .detail-value {
          font-weight: 600;
          color: #333;
        }
        
        .subscription-actions {
          margin-top: 1.5rem;
          display: flex;
          justify-content: center;
        }
        
        .manage-btn {
          background: #1a44c0;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .manage-btn:hover {
          background: #153aa8;
        }
        
        .manage-btn:disabled {
          background: #b0b0b0;
          cursor: not-allowed;
        }
        
        .btn-primary {
          display: inline-block;
          background: #1a44c0;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-weight: 500;
          text-decoration: none;
          transition: background 0.2s;
        }
        
        .btn-primary:hover {
          background: #153aa8;
        }
        
        .no-subscription-message {
          text-align: center;
          margin: 1.5rem 0;
          color: #666;
        }
        
        .error-message {
          background: #fef2f2;
          color: #ef4444;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }
        
        .not-logged-in {
          text-align: center;
          padding: 2rem;
          background: #f9fafb;
          border-radius: 8px;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default SubscriptionManager;
