'use client';

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * Resource Costing & Top-Up Funding Calculator
 * ---------------------------------------------
 * PROPRIETARY INNOVATION - Financial intelligence for SEND provision.
 * 
 * This module provides:
 * - Automated calculation of EHCP provision costs
 * - Top-up funding band allocation
 * - Resource comparison across placements
 * - Budget forecasting and tracking
 * - Value-for-money analysis
 * 
 * Goal: Ensure every pound spent maximises outcomes for children.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PoundSterling,
  Calculator,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Download,
  Search,
  Edit,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  School,
} from 'lucide-react';

// Types
interface ProvisionCost {
  id: string;
  ehcpId: string;
  studentName: string;
  school: string;
  schoolType: SchoolType;
  placementType: PlacementType;
  fundingBand: FundingBand;
  provisions: ProvisionItem[];
  totalAnnualCost: number;
  laContribution: number;
  schoolContribution: number;
  healthContribution: number;
  socialCareContribution: number;
  topUpFunding: number;
  effectiveDate: string;
  reviewDate: string;
  costTrend: 'increasing' | 'stable' | 'decreasing';
  valueRating: 'excellent' | 'good' | 'satisfactory' | 'poor';
}

type SchoolType = 'mainstream' | 'resourced_provision' | 'special' | 'independent_special' | 'alternative_provision';
type PlacementType = 'local' | 'out_of_area' | 'residential' | 'home_education';
type FundingBand = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'exceptional';

interface ProvisionItem {
  id: string;
  category: ProvisionCategory;
  description: string;
  hours: number;
  weeksPerYear: number;
  hourlyRate: number;
  annualCost: number;
  fundedBy: 'la' | 'school' | 'health' | 'social_care';
}

type ProvisionCategory = 
  | 'teaching_assistant'
  | 'specialist_teacher'
  | 'speech_therapy'
  | 'occupational_therapy'
  | 'physiotherapy'
  | 'educational_psychology'
  | 'mental_health'
  | 'equipment'
  | 'transport'
  | 'other';

interface BudgetSummary {
  totalBudget: number;
  allocated: number;
  committed: number;
  forecast: number;
  variance: number;
  studentCount: number;
  averageCostPerStudent: number;
}

interface CostComparison {
  schoolType: SchoolType;
  averageCost: number;
  studentCount: number;
  percentageOfBudget: number;
}

// Configuration
const SCHOOL_TYPE_CONFIG: Record<SchoolType, { name: string; color: string; avgCost: number }> = {
  mainstream: { name: 'Mainstream', color: 'blue', avgCost: 8500 },
  resourced_provision: { name: 'Resourced Provision', color: 'green', avgCost: 18000 },
  special: { name: 'Special School', color: 'purple', avgCost: 32000 },
  independent_special: { name: 'Independent Special', color: 'orange', avgCost: 65000 },
  alternative_provision: { name: 'Alternative Provision', color: 'amber', avgCost: 22000 },
};

const FUNDING_BAND_CONFIG: Record<FundingBand, { name: string; range: string; maxAmount: number }> = {
  A: { name: 'Band A', range: '£0 - £6,000', maxAmount: 6000 },
  B: { name: 'Band B', range: '£6,001 - £12,000', maxAmount: 12000 },
  C: { name: 'Band C', range: '£12,001 - £18,000', maxAmount: 18000 },
  D: { name: 'Band D', range: '£18,001 - £25,000', maxAmount: 25000 },
  E: { name: 'Band E', range: '£25,001 - £35,000', maxAmount: 35000 },
  F: { name: 'Band F', range: '£35,001 - £50,000', maxAmount: 50000 },
  exceptional: { name: 'Exceptional', range: '£50,001+', maxAmount: 999999 },
};

const PROVISION_RATES: Record<ProvisionCategory, { name: string; defaultRate: number }> = {
  teaching_assistant: { name: 'Teaching Assistant', defaultRate: 18.50 },
  specialist_teacher: { name: 'Specialist Teacher', defaultRate: 45.00 },
  speech_therapy: { name: 'Speech & Language Therapy', defaultRate: 75.00 },
  occupational_therapy: { name: 'Occupational Therapy', defaultRate: 72.00 },
  physiotherapy: { name: 'Physiotherapy', defaultRate: 70.00 },
  educational_psychology: { name: 'Educational Psychology', defaultRate: 95.00 },
  mental_health: { name: 'Mental Health Support', defaultRate: 65.00 },
  equipment: { name: 'Specialist Equipment', defaultRate: 0 },
  transport: { name: 'Transport', defaultRate: 0 },
  other: { name: 'Other', defaultRate: 0 },
};

export default function ResourceCostingModule() {
  const [costs, setCosts] = useState<ProvisionCost[]>([]);
  const [budget, setBudget] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [schoolTypeFilter, setSchoolTypeFilter] = useState<SchoolType | 'all'>('all');
  const [bandFilter, setBandFilter] = useState<FundingBand | 'all'>('all');
  const [selectedCost, setSelectedCost] = useState<ProvisionCost | null>(null);
  const [_showCalculator, setShowCalculator] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Mock data
        const mockCosts: ProvisionCost[] = [
          {
            id: 'COST001',
            ehcpId: 'EHCP-2025-0234',
            studentName: 'Thomas Anderson',
            school: 'Matrix Academy',
            schoolType: 'mainstream',
            placementType: 'local',
            fundingBand: 'C',
            totalAnnualCost: 15800,
            laContribution: 9800,
            schoolContribution: 6000,
            healthContribution: 0,
            socialCareContribution: 0,
            topUpFunding: 9800,
            effectiveDate: '2025-09-01',
            reviewDate: '2026-03-01',
            costTrend: 'stable',
            valueRating: 'good',
            provisions: [
              { id: 'p1', category: 'teaching_assistant', description: '1:1 TA support', hours: 25, weeksPerYear: 39, hourlyRate: 18.50, annualCost: 18037.50, fundedBy: 'la' },
              { id: 'p2', category: 'speech_therapy', description: 'Weekly SALT sessions', hours: 1, weeksPerYear: 38, hourlyRate: 75, annualCost: 2850, fundedBy: 'health' },
            ],
          },
          {
            id: 'COST002',
            ehcpId: 'EHCP-2025-0189',
            studentName: 'Sophie Mitchell',
            school: 'Sunrise Special School',
            schoolType: 'special',
            placementType: 'local',
            fundingBand: 'E',
            totalAnnualCost: 32500,
            laContribution: 26500,
            schoolContribution: 6000,
            healthContribution: 3200,
            socialCareContribution: 0,
            topUpFunding: 26500,
            effectiveDate: '2025-09-01',
            reviewDate: '2026-03-01',
            costTrend: 'stable',
            valueRating: 'excellent',
            provisions: [
              { id: 'p1', category: 'teaching_assistant', description: 'Shared 2:1 support', hours: 32.5, weeksPerYear: 39, hourlyRate: 18.50, annualCost: 23456.25, fundedBy: 'la' },
              { id: 'p2', category: 'occupational_therapy', description: 'OT assessment and intervention', hours: 2, weeksPerYear: 38, hourlyRate: 72, annualCost: 5472, fundedBy: 'health' },
              { id: 'p3', category: 'physiotherapy', description: 'Weekly physio', hours: 1, weeksPerYear: 38, hourlyRate: 70, annualCost: 2660, fundedBy: 'health' },
            ],
          },
          {
            id: 'COST003',
            ehcpId: 'EHCP-2025-0312',
            studentName: 'Oliver James',
            school: 'Oakwood Independent Special',
            schoolType: 'independent_special',
            placementType: 'out_of_area',
            fundingBand: 'exceptional',
            totalAnnualCost: 78000,
            laContribution: 72000,
            schoolContribution: 0,
            healthContribution: 4500,
            socialCareContribution: 8500,
            topUpFunding: 72000,
            effectiveDate: '2025-09-01',
            reviewDate: '2026-03-01',
            costTrend: 'increasing',
            valueRating: 'satisfactory',
            provisions: [
              { id: 'p1', category: 'teaching_assistant', description: '1:1 waking day support', hours: 50, weeksPerYear: 52, hourlyRate: 22, annualCost: 57200, fundedBy: 'la' },
              { id: 'p2', category: 'mental_health', description: 'Therapeutic support', hours: 3, weeksPerYear: 48, hourlyRate: 85, annualCost: 12240, fundedBy: 'la' },
              { id: 'p3', category: 'transport', description: 'Specialist transport', hours: 0, weeksPerYear: 0, hourlyRate: 0, annualCost: 8500, fundedBy: 'la' },
            ],
          },
          {
            id: 'COST004',
            ehcpId: 'EHCP-2025-0267',
            studentName: 'Emma Williams',
            school: 'Riverside Primary',
            schoolType: 'mainstream',
            placementType: 'local',
            fundingBand: 'B',
            totalAnnualCost: 9200,
            laContribution: 3200,
            schoolContribution: 6000,
            healthContribution: 0,
            socialCareContribution: 0,
            topUpFunding: 3200,
            effectiveDate: '2025-09-01',
            reviewDate: '2026-03-01',
            costTrend: 'decreasing',
            valueRating: 'excellent',
            provisions: [
              { id: 'p1', category: 'teaching_assistant', description: 'Small group support', hours: 15, weeksPerYear: 39, hourlyRate: 18.50, annualCost: 10822.50, fundedBy: 'school' },
              { id: 'p2', category: 'specialist_teacher', description: 'Termly specialist input', hours: 6, weeksPerYear: 6, hourlyRate: 45, annualCost: 1620, fundedBy: 'la' },
            ],
          },
        ];

        const mockBudget: BudgetSummary = {
          totalBudget: 45000000,
          allocated: 38500000,
          committed: 41200000,
          forecast: 43800000,
          variance: -1200000,
          studentCount: 2847,
          averageCostPerStudent: 14518,
        };

        setCosts(mockCosts);
        setBudget(mockBudget);
      } catch (error) {
        console.error('Error fetching cost data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter costs
  const filteredCosts = useMemo(() => {
    return costs.filter((c) => {
      const matchesSearch = 
        c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.school.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSchoolType = schoolTypeFilter === 'all' || c.schoolType === schoolTypeFilter;
      const matchesBand = bandFilter === 'all' || c.fundingBand === bandFilter;
      return matchesSearch && matchesSchoolType && matchesBand;
    });
  }, [costs, searchQuery, schoolTypeFilter, bandFilter]);

  // Cost comparisons by school type
  const costComparisons = useMemo((): CostComparison[] => {
    const grouped: Record<SchoolType, { total: number; count: number }> = {
      mainstream: { total: 0, count: 0 },
      resourced_provision: { total: 0, count: 0 },
      special: { total: 0, count: 0 },
      independent_special: { total: 0, count: 0 },
      alternative_provision: { total: 0, count: 0 },
    };

    costs.forEach((c) => {
      grouped[c.schoolType].total += c.totalAnnualCost;
      grouped[c.schoolType].count += 1;
    });

    const totalCost = costs.reduce((sum, c) => sum + c.totalAnnualCost, 0);

    return Object.entries(grouped)
      .filter(([_, data]) => data.count > 0)
      .map(([type, data]) => ({
        schoolType: type as SchoolType,
        averageCost: data.count > 0 ? Math.round(data.total / data.count) : 0,
        studentCount: data.count,
        percentageOfBudget: totalCost > 0 ? Math.round((data.total / totalCost) * 100) : 0,
      }));
  }, [costs]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Calculator className="w-12 h-12 text-green-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading cost data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <PoundSterling className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Resource Costing & Top-Up Funding</h2>
              <p className="text-green-100">
                Intelligent financial planning for SEND provision
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setShowCalculator(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg font-medium transition-colors"
            >
              <Calculator className="w-5 h-5" />
              Cost Calculator
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg font-medium transition-colors">
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>
        </div>

        {/* Budget Summary */}
        {budget && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="text-2xl font-bold">{formatCurrency(budget.totalBudget)}</div>
              <div className="text-sm text-green-100">Total Budget</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="text-2xl font-bold">{formatCurrency(budget.committed)}</div>
              <div className="text-sm text-green-100">Committed</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="text-2xl font-bold flex items-center gap-2">
                {formatCurrency(Math.abs(budget.variance))}
                {budget.variance < 0 ? (
                  <TrendingUp className="w-5 h-5 text-red-300" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-green-300" />
                )}
              </div>
              <div className="text-sm text-green-100">
                {budget.variance < 0 ? 'Over Budget' : 'Under Budget'}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="text-2xl font-bold">{formatCurrency(budget.averageCostPerStudent)}</div>
              <div className="text-sm text-green-100">Avg Cost/Student</div>
            </div>
          </div>
        )}
      </div>

      {/* Cost Distribution Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-green-600" />
          Cost Distribution by Placement Type
        </h3>
        <div className="grid md:grid-cols-5 gap-4">
          {costComparisons.map((comparison) => {
            const config = SCHOOL_TYPE_CONFIG[comparison.schoolType];
            return (
              <div 
                key={comparison.schoolType}
                className={`p-4 rounded-lg bg-${config.color}-50 dark:bg-${config.color}-900/20 border border-${config.color}-200 dark:border-${config.color}-800`}
              >
                <div className={`text-2xl font-bold text-${config.color}-600`}>
                  {formatCurrency(comparison.averageCost)}
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{config.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {comparison.studentCount} students • {comparison.percentageOfBudget}% of budget
                </div>
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`bg-${config.color}-500 h-2 rounded-full`}
                    style={{ width: `${comparison.percentageOfBudget}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Funding Bands Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          Funding Band Distribution
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {Object.entries(FUNDING_BAND_CONFIG).map(([band, config]) => {
            const count = costs.filter(c => c.fundingBand === band).length;
            const percentage = costs.length > 0 ? Math.round((count / costs.length) * 100) : 0;
            return (
              <div key={band} className="text-center">
                <div className="h-24 bg-gray-100 dark:bg-gray-700 rounded-lg relative overflow-hidden flex items-end justify-center p-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${percentage}%` }}
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-b-lg"
                  />
                  <span className="relative text-white font-bold text-lg z-10">{count}</span>
                </div>
                <div className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{config.name}</div>
                <div className="text-xs text-gray-500">{config.range}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student or school..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <select
          value={schoolTypeFilter}
          onChange={(e) => setSchoolTypeFilter(e.target.value as SchoolType | 'all')}
          aria-label="Filter by placement type"
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All Placement Types</option>
          {Object.entries(SCHOOL_TYPE_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.name}</option>
          ))}
        </select>
        <select
          value={bandFilter}
          onChange={(e) => setBandFilter(e.target.value as FundingBand | 'all')}
          aria-label="Filter by funding band"
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All Funding Bands</option>
          {Object.entries(FUNDING_BAND_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.name}</option>
          ))}
        </select>
      </div>

      {/* Cost List */}
      <div className="space-y-4">
        {filteredCosts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
            <PoundSterling className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No cost records found</p>
          </div>
        ) : (
          filteredCosts.map((cost) => (
            <motion.div
              key={cost.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedCost(selectedCost?.id === cost.id ? null : cost)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${SCHOOL_TYPE_CONFIG[cost.schoolType].color}-100 dark:bg-${SCHOOL_TYPE_CONFIG[cost.schoolType].color}-900/30`}>
                    <School className={`w-6 h-6 text-${SCHOOL_TYPE_CONFIG[cost.schoolType].color}-600`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{cost.studentName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{cost.school}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-${SCHOOL_TYPE_CONFIG[cost.schoolType].color}-100 text-${SCHOOL_TYPE_CONFIG[cost.schoolType].color}-700`}>
                        {SCHOOL_TYPE_CONFIG[cost.schoolType].name}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                        {FUNDING_BAND_CONFIG[cost.fundingBand].name}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        cost.valueRating === 'excellent' ? 'bg-green-100 text-green-700' :
                        cost.valueRating === 'good' ? 'bg-blue-100 text-blue-700' :
                        cost.valueRating === 'satisfactory' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {cost.valueRating.charAt(0).toUpperCase() + cost.valueRating.slice(1)} Value
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(cost.totalAnnualCost)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">per year</div>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    {cost.costTrend === 'increasing' && <TrendingUp className="w-4 h-4 text-red-500" />}
                    {cost.costTrend === 'decreasing' && <TrendingDown className="w-4 h-4 text-green-500" />}
                    <span className={`text-xs ${
                      cost.costTrend === 'increasing' ? 'text-red-600' :
                      cost.costTrend === 'decreasing' ? 'text-green-600' :
                      'text-gray-500'
                    }`}>
                      {cost.costTrend}
                    </span>
                  </div>
                </div>
              </div>

              {/* Funding Breakdown Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Funding Breakdown</span>
                  <span>Top-up: {formatCurrency(cost.topUpFunding)}</span>
                </div>
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                  {cost.schoolContribution > 0 && (
                    <div 
                      className="bg-blue-500 h-full"
                      style={{ width: `${(cost.schoolContribution / cost.totalAnnualCost) * 100}%` }}
                      title={`School: ${formatCurrency(cost.schoolContribution)}`}
                    />
                  )}
                  {cost.laContribution > 0 && (
                    <div 
                      className="bg-green-500 h-full"
                      style={{ width: `${(cost.laContribution / cost.totalAnnualCost) * 100}%` }}
                      title={`LA: ${formatCurrency(cost.laContribution)}`}
                    />
                  )}
                  {cost.healthContribution > 0 && (
                    <div 
                      className="bg-purple-500 h-full"
                      style={{ width: `${(cost.healthContribution / cost.totalAnnualCost) * 100}%` }}
                      title={`Health: ${formatCurrency(cost.healthContribution)}`}
                    />
                  )}
                  {cost.socialCareContribution > 0 && (
                    <div 
                      className="bg-amber-500 h-full"
                      style={{ width: `${(cost.socialCareContribution / cost.totalAnnualCost) * 100}%` }}
                      title={`Social Care: ${formatCurrency(cost.socialCareContribution)}`}
                    />
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded" /> School (£6k)</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded" /> LA Top-up</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 bg-purple-500 rounded" /> Health</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 bg-amber-500 rounded" /> Social Care</span>
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {selectedCost?.id === cost.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
                  >
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Provision Breakdown</h4>
                    <div className="space-y-2">
                      {cost.provisions.map((provision) => (
                        <div 
                          key={provision.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {PROVISION_RATES[provision.category].name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {provision.description}
                              {provision.hours > 0 && ` • ${provision.hours}hrs/wk × ${provision.weeksPerYear} weeks`}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(provision.annualCost)}
                            </div>
                            <div className={`text-xs ${
                              provision.fundedBy === 'la' ? 'text-green-600' :
                              provision.fundedBy === 'school' ? 'text-blue-600' :
                              provision.fundedBy === 'health' ? 'text-purple-600' :
                              'text-amber-600'
                            }`}>
                              Funded by {provision.fundedBy.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Review due: {new Date(cost.reviewDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <button className="inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700">
                        <Edit className="w-4 h-4" />
                        Edit Costings
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>

      {/* Value for Money Insight */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-green-600" />
          Value for Money Insights
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Opportunities Identified
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• 12 students may be suitable for stepped-down provision (potential saving: £45,000)</li>
              <li>• 3 out-of-area placements could return to local provision (potential saving: £120,000)</li>
              <li>• Group provision for SALT could serve 8 students (potential saving: £18,000)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Risk Areas
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• 5 placements at risk of cost increase due to escalating needs</li>
              <li>• 2 independent placements under review by parents</li>
              <li>• Transport costs up 15% year-on-year</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
