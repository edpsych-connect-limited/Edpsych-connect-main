'use client'

/**
 * Resource Costing Page
 * Calculate provision costs and funding bands
 */

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/hooks';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  PoundSterling,
  Calculator,
  TrendingUp,
  BarChart3,
  FileText,
  Download
} from 'lucide-react';
import { EHCPModuleVideoIntro } from '@/components/ehcp/EHCPModuleVideoIntro';

interface FundingBand {
  id: string;
  band_name: string;
  min_amount: number;
  max_amount: number;
  description?: string;
  applicable_needs: string[];
}

interface ProvisionCost {
  id: string;
  ehcp_id: string;
  provision_type: string;
  annual_cost: number;
  unit_cost?: number;
  units_per_week?: number;
  funding_source?: string;
  ehcp?: { student_id: string };
}

interface CostCalculation {
  id: string;
  ehcp_id: string;
  calculation_date: string;
  total_annual_cost: number;
  funding_band_id?: string;
  top_up_required: number;
  element_1: number;
  element_2: number;
  element_3: number;
  ehcp?: { student_id: string };
  funding_band?: { band_name: string };
}

export default function ResourceCostingPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [fundingBands, setFundingBands] = useState<FundingBand[]>([]);
  const [costs, setCosts] = useState<ProvisionCost[]>([]);
  const [calculations, setCalculations] = useState<CostCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'calculations' | 'bands' | 'provisions'>('calculations');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bandsRes, costsRes] = await Promise.all([
        fetch('/api/ehcp/funding-bands'),
        fetch('/api/ehcp/provision-costs')
      ]);
      
      if (bandsRes.ok) {
        const data = await bandsRes.json();
        setFundingBands(data.bands || []);
      }
      
      if (costsRes.ok) {
        const data = await costsRes.json();
        setCosts(data.costs || []);
        setCalculations(data.calculations || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const totalAnnualCost = calculations.reduce((acc, c) => acc + c.total_annual_cost, 0);
  const totalTopUp = calculations.reduce((acc, c) => acc + c.top_up_required, 0);
  const avgCostPerEHCP = calculations.length > 0 
    ? Math.round(totalAnnualCost / calculations.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/ehcp/modules"
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <PoundSterling className="h-7 w-7 text-amber-600" />
                  Resource Costing
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Calculate provision costs and manage funding bands
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {}}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </button>
              <button
                onClick={() => {}}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-amber-600 hover:bg-amber-700"
              >
                <Calculator className="h-4 w-4 mr-2" />
                New Calculation
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Video Introduction */}
        <EHCPModuleVideoIntro
          videoKey="resource-costing-funding"
          title="Resource Costing & Funding"
          description="Calculate provision costs, understand funding bands, and generate budget projections with our comprehensive costing tools."
          duration="4 min"
          gradient="from-amber-600 to-orange-600"
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <PoundSterling className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Annual Cost</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAnnualCost)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Top-Up Required</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalTopUp)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Cost per EHCP</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(avgCostPerEHCP)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">EHCPs Costed</p>
                <p className="text-2xl font-bold text-gray-900">{calculations.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* UK Funding Info */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <PoundSterling className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-900">UK EHCP Funding Elements</h3>
              <p className="text-sm text-amber-700 mt-1">
                Element 1 (Core): GBP 4,000 per pupil AWPU | 
                Element 2 (Additional Support): Up to GBP 6,000 | 
                Element 3 (Top-Up): Variable based on need. Top-up funding is provided by the LA for costs above the GBP 10,000 threshold.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="border-b">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('calculations')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'calculations'
                    ? 'border-amber-600 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Cost Calculations ({calculations.length})
              </button>
              <button
                onClick={() => setActiveTab('bands')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'bands'
                    ? 'border-amber-600 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Funding Bands ({fundingBands.length})
              </button>
              <button
                onClick={() => setActiveTab('provisions')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'provisions'
                    ? 'border-amber-600 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Provision Costs ({costs.length})
              </button>
            </nav>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading costing data...</p>
            </div>
          ) : activeTab === 'calculations' ? (
            calculations.length === 0 ? (
              <div className="p-12 text-center">
                <Calculator className="h-12 w-12 text-gray-300 mx-auto" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No calculations</h3>
                <p className="mt-2 text-gray-500">Create your first cost calculation.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">EHCP</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Element 1</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Element 2</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Element 3 (Top-Up)</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Band</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {calculations.map((calc) => (
                    <tr key={calc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {calc.ehcp?.student_id || `EHCP-${calc.ehcp_id}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(calc.calculation_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                        {formatCurrency(calc.element_1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                        {formatCurrency(calc.element_2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 text-right font-medium">
                        {formatCurrency(calc.element_3)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                        {formatCurrency(calc.total_annual_cost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                          {calc.funding_band?.band_name || 'Unassigned'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : activeTab === 'bands' ? (
            fundingBands.length === 0 ? (
              <div className="p-12 text-center">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No funding bands</h3>
                <p className="mt-2 text-gray-500">Configure funding bands for your LA.</p>
              </div>
            ) : (
              <div className="divide-y">
                {fundingBands.map((band) => (
                  <div key={band.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{band.band_name}</h3>
                        {band.description && (
                          <p className="text-sm text-gray-600 mt-1">{band.description}</p>
                        )}
                        {band.applicable_needs && band.applicable_needs.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {band.applicable_needs.map((need, idx) => (
                              <span key={idx} className="inline-flex px-2 py-1 text-xs bg-gray-100 rounded">
                                {need}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(band.min_amount)} - {formatCurrency(band.max_amount)}
                        </p>
                        <p className="text-xs text-gray-500">Annual range</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            costs.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="h-12 w-12 text-gray-300 mx-auto" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No provision costs</h3>
                <p className="mt-2 text-gray-500">Add provision costs to EHCPs.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">EHCP</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provision Type</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Units/Week</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Annual Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Funding Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {costs.map((cost) => (
                    <tr key={cost.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {cost.ehcp?.student_id || `EHCP-${cost.ehcp_id}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                        {cost.provision_type.replace(/_/g, ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                        {cost.unit_cost ? formatCurrency(cost.unit_cost) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                        {cost.units_per_week || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(cost.annual_cost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {cost.funding_source || 'Unspecified'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>
    </div>
  );
}
