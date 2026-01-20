'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/hooks';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import { ErrorDisplay } from '@/components/error-handling';
import { ProgressBar } from '@/components/common/ProgressBar.component';

interface RewardsData {
  totalRewards: number;
  rewardsEarned: number;
  rewardsPending: number;
  lastEarned: string;
  categories: Array<{
    name: string;
    amount: number;
    percentage: number;
  }>;
}

interface TreasuryData {
  totalFunds: number;
  allocatedFunds: number;
  availableFunds: number;
  lastTransaction: string;
  recentTransactions: Array<{
    id: string;
    type: 'earn' | 'spend' | 'transfer';
    amount: number;
    description: string;
    date: string;
  }>;
}

export default function TokenisationPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [rewards, setRewards] = useState<RewardsData | null>(null);
  const [treasury, setTreasury] = useState<TreasuryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rewards' | 'treasury' | 'exchange'>('rewards');
  const decisionSupportCopy = {
    rewards: 'Review pending rewards first, then prioritize the categories driving the highest progress.',
    treasury: 'Check available funds before reallocating budgets or approving new allocations.',
    exchange: 'Redeem tokens for immediate impact or transfer to support urgent collaboration needs.',
  };

  // Redirect if not authenticated
  if (!authLoading && !user) {
    redirect('/login');
  }

  // Fetch tokenisation data
  useEffect(() => {
    if (authLoading || !user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch rewards data
        const rewardsRes = await fetch('/api/tokenisation/rewards');
        if (!rewardsRes.ok) {
          throw new Error('Failed to fetch rewards data');
        }
        const rewardsData = await rewardsRes.json();
        setRewards(rewardsData);

        // Fetch treasury data
        const treasuryRes = await fetch('/api/tokenisation/treasury');
        if (!treasuryRes.ok) {
          throw new Error('Failed to fetch treasury data');
        }
        const treasuryData = await treasuryRes.json();
        setTreasury(treasuryData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading tokenisation data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <PageHeader title="Error" subtitle="Failed to load tokenisation data" />
        <div className="container mx-auto px-4 py-8">
          <ErrorDisplay
            title="Error Loading Tokenisation"
            error={error}
            retry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <PageHeader
        title="Tokenisation System"
        subtitle="Manage your rewards, treasury, and earn-to-learn incentives"
      />

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('rewards')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'rewards'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Rewards
          </button>
          <button
            onClick={() => setActiveTab('treasury')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'treasury'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Treasury
          </button>
          <button
            onClick={() => setActiveTab('exchange')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'exchange'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Exchange & Redeem
          </button>
        </div>
        <div className="mb-6 rounded-lg border border-slate-700 bg-slate-800/70 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-100">Decision Support</p>
              <p className="text-sm text-slate-300">{decisionSupportCopy[activeTab]}</p>
            </div>
            <div className="text-xs text-slate-400">
              Active view: <span className="text-slate-200">{activeTab}</span>
            </div>
          </div>
        </div>

        {/* Rewards Tab */}
        {activeTab === 'rewards' && rewards && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
                <div className="text-sm text-slate-400 mb-2">Total Rewards Available</div>
                <div className="text-4xl font-bold text-blue-400 mb-4">{rewards.totalRewards}</div>
                <div className="text-xs text-slate-500">Across all reward categories</div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-green-500 transition-colors">
                <div className="text-sm text-slate-400 mb-2">Rewards Earned</div>
                <div className="text-4xl font-bold text-green-400 mb-4">{rewards.rewardsEarned}</div>
                <div className="text-xs text-slate-500">Successfully earned</div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-amber-500 transition-colors">
                <div className="text-sm text-slate-400 mb-2">Pending Rewards</div>
                <div className="text-4xl font-bold text-amber-400 mb-4">{rewards.rewardsPending}</div>
                <div className="text-xs text-slate-500">Awaiting confirmation</div>
              </div>
            </div>

            {/* Reward Categories */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
              <h3 className="text-xl font-bold mb-6">Reward Categories Breakdown</h3>
              <div className="space-y-4">
                {rewards.categories.map((category, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <span className="text-slate-300">{category.name}</span>
                        <span className="text-blue-400 font-bold">{category.amount}</span>
                      </div>
                      <ProgressBar
                        value={category.percentage}
                        max={100}
                        variant="gradient"
                        className="h-2 bg-slate-700"
                      />
                    </div>
                    <span className="text-slate-400 text-sm w-12 text-right">{category.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Last Earned */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="text-sm text-slate-400 mb-2">Last Reward Earned</div>
              <div className="text-lg text-slate-200">{rewards.lastEarned}</div>
            </div>
          </div>
        )}

        {/* Treasury Tab */}
        {activeTab === 'treasury' && treasury && (
          <div className="space-y-8">
            {/* Treasury Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-purple-500 transition-colors">
                <div className="text-sm text-slate-400 mb-2">Total Funds</div>
                <div className="text-4xl font-bold text-purple-400 mb-4">${treasury.totalFunds.toFixed(2)}</div>
                <div className="text-xs text-slate-500">Complete treasury</div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-orange-500 transition-colors">
                <div className="text-sm text-slate-400 mb-2">Allocated Funds</div>
                <div className="text-4xl font-bold text-orange-400 mb-4">${treasury.allocatedFunds.toFixed(2)}</div>
                <div className="text-xs text-slate-500">In active use</div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-lime-500 transition-colors">
                <div className="text-sm text-slate-400 mb-2">Available Funds</div>
                <div className="text-4xl font-bold text-lime-400 mb-4">${treasury.availableFunds.toFixed(2)}</div>
                <div className="text-xs text-slate-500">Ready to spend</div>
              </div>
            </div>

            {/* Fund Allocation Visualization */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
              <h3 className="text-xl font-bold mb-6">Fund Allocation</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-300">Allocated</span>
                    <span className="text-orange-400">${treasury.allocatedFunds.toFixed(2)}</span>
                  </div>
                  <ProgressBar
                    value={treasury.allocatedFunds}
                    max={treasury.totalFunds}
                    variant="orange"
                    className="h-3 bg-slate-700"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-300">Available</span>
                    <span className="text-lime-400">${treasury.availableFunds.toFixed(2)}</span>
                  </div>
                  <ProgressBar
                    value={treasury.availableFunds}
                    max={treasury.totalFunds}
                    variant="lime"
                    className="h-3 bg-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
              <h3 className="text-xl font-bold mb-6">Recent Transactions</h3>
              <div className="space-y-3">
                {treasury.recentTransactions.slice(0, 10).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="text-slate-200 font-medium">{transaction.description}</div>
                      <div className="text-sm text-slate-400">{new Date(transaction.date).toLocaleDateString()}</div>
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        transaction.type === 'earn'
                          ? 'text-green-400'
                          : transaction.type === 'spend'
                            ? 'text-red-400'
                            : 'text-blue-400'
                      }`}
                    >
                      {transaction.type === 'earn' ? '+' : transaction.type === 'spend' ? '-' : '&gt;'}
                      ${Math.abs(transaction.amount).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Exchange & Redeem Tab */}
        {activeTab === 'exchange' && (
          <div className="space-y-8">
            {/* Exchange Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 hover:border-blue-500 transition-colors cursor-pointer">
                <div className="text-2xl font-bold mb-4 text-blue-400">Card Redeem for Credits</div>
                <p className="text-slate-300 mb-6">Convert your earned tokens into platform credits</p>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-slate-400">1 Token =</span>
                    <span className="text-blue-400 font-bold">$0.10 Credit</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Min Redemption</span>
                    <span className="text-blue-400 font-bold">100 Tokens</span>
                  </div>
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">
                  Redeem Credits
                </button>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 hover:border-purple-500 transition-colors cursor-pointer">
                <div className="text-2xl font-bold mb-4 text-purple-400">Rewards Transfer to Friend</div>
                <p className="text-slate-300 mb-6">Share your tokens with other platform users</p>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Transfer Fee</span>
                    <span className="text-purple-400 font-bold">2% per transfer</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Min Transfer</span>
                    <span className="text-purple-400 font-bold">50 Tokens</span>
                  </div>
                </div>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors">
                  Transfer Tokens
                </button>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 hover:border-green-500 transition-colors cursor-pointer">
                <div className="text-2xl font-bold mb-4 text-green-400">Library Premium Features</div>
                <p className="text-slate-300 mb-6">Unlock premium content and advanced features</p>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Advanced Analytics</span>
                    <span className="text-green-400 font-bold">250 Tokens</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">API Access</span>
                    <span className="text-green-400 font-bold">500 Tokens</span>
                  </div>
                </div>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors">
                  Browse Premium
                </button>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 hover:border-amber-500 transition-colors cursor-pointer">
                <div className="text-2xl font-bold mb-4 text-amber-400">Awards Upgrade Tier</div>
                <p className="text-slate-300 mb-6">Use tokens to upgrade your subscription plan</p>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Premium Monthly</span>
                    <span className="text-amber-400 font-bold">300 Tokens</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Enterprise Yearly</span>
                    <span className="text-amber-400 font-bold">2000 Tokens</span>
                  </div>
                </div>
                <button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg transition-colors">
                  Upgrade Now
                </button>
              </div>
            </div>

            {/* How to Earn */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
              <h3 className="text-xl font-bold mb-6">How to Earn Tokens</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border-l-4 border-blue-500 pl-6">
                  <h4 className="text-lg font-semibold text-blue-400 mb-2">Complete Assessments</h4>
                  <p className="text-slate-400">Earn tokens for each assessment completed</p>
                  <div className="mt-2 text-sm text-slate-500">25 tokens per assessment</div>
                </div>

                <div className="border-l-4 border-green-500 pl-6">
                  <h4 className="text-lg font-semibold text-green-400 mb-2">Active Learning</h4>
                  <p className="text-slate-400">Earn tokens by engaging with training materials</p>
                  <div className="mt-2 text-sm text-slate-500">10 tokens per course completed</div>
                </div>

                <div className="border-l-4 border-purple-500 pl-6">
                  <h4 className="text-lg font-semibold text-purple-400 mb-2">Community Contribution</h4>
                  <p className="text-slate-400">Earn tokens by helping other users</p>
                  <div className="mt-2 text-sm text-slate-500">50 tokens per accepted contribution</div>
                </div>

                <div className="border-l-4 border-amber-500 pl-6">
                  <h4 className="text-lg font-semibold text-amber-400 mb-2">Gamification</h4>
                  <p className="text-slate-400">Earn tokens by winning battles and challenges</p>
                  <div className="mt-2 text-sm text-slate-500">100 tokens per battle royale win</div>
                </div>

                <div className="border-l-4 border-pink-500 pl-6">
                  <h4 className="text-lg font-semibold text-pink-400 mb-2">Loyalty Bonus</h4>
                  <p className="text-slate-400">Monthly bonus for active platform usage</p>
                  <div className="mt-2 text-sm text-slate-500">200 tokens monthly bonus</div>
                </div>

                <div className="border-l-4 border-cyan-500 pl-6">
                  <h4 className="text-lg font-semibold text-cyan-400 mb-2">Referral Programme</h4>
                  <p className="text-slate-400">Earn tokens by referring new users</p>
                  <div className="mt-2 text-sm text-slate-500">500 tokens per referral</div>
                </div>
              </div>
            </div>

            {/* Help & Support */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
              <h3 className="text-xl font-bold mb-4">Need Help?</h3>
              <p className="text-slate-300 mb-6">
                Learn more about our tokenisation system and how to maximize your earnings.
              </p>
              <Link
                href="/help"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
              >
                View Help Centre
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
