'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Professional {
  id: number;
  userId: number;
  name: string;
  avatar: string | null;
  title: string;
  bio: string;
  location: string;
  specialisms: string[];
  dailyRate: number;
  rating: number;
  reviewCount: number;
  isLaPanel: boolean;
  nextAvailable: string | null;
  yearsExperience: number;
  verified: boolean;
}

function MarketplaceSearchContent() {
  const searchParams = useSearchParams();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    location: searchParams.get('location') || '',
    specialisms: [] as string[],
    availability: '',
    maxRate: '',
    laPanel: false,
  });

  useEffect(() => {
    fetchProfessionals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]); // Re-fetch when filters change

  const fetchProfessionals = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.q) queryParams.set('q', filters.q);
      if (filters.location) queryParams.set('location', filters.location);
      if (filters.specialisms.length) queryParams.set('specialisms', filters.specialisms.join(','));
      if (filters.availability) queryParams.set('availability', filters.availability);
      if (filters.maxRate) queryParams.set('max_rate', filters.maxRate);
      if (filters.laPanel) queryParams.set('la_panel', 'true');

      const res = await fetch(`/api/marketplace/professionals/search?${queryParams.toString()}`);
      const data = await res.json();
      setProfessionals(data.results || []);
    } catch (_error) {
      console.error('Search failed:', _error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header / Search Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Find an Educational Psychologist</h1>
            <Link 
              href="/marketplace/register"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Are you a professional? Join us &rarr;
            </Link>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, keyword, or bio..."
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={filters.q}
                onChange={(e) => handleFilterChange('q', e.target.value)}
              />
            </div>
            <div className="w-64">
              <input
                type="text"
                placeholder="Location (e.g. London)"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>
            <button 
              onClick={fetchProfessionals}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="w-64 flex-shrink-0 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Availability</h3>
              <select 
                aria-label="Filter by availability"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={filters.availability}
                onChange={(e) => handleFilterChange('availability', e.target.value)}
              >
                <option value="">Any time</option>
                <option value="immediate">Immediate (3 days)</option>
                <option value="next_week">Next 7 days</option>
                <option value="next_month">Next 30 days</option>
              </select>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Max Daily Rate</h3>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">£</span>
                <input
                  type="number"
                  placeholder="Max rate"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={filters.maxRate}
                  onChange={(e) => handleFilterChange('maxRate', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={filters.laPanel}
                  onChange={(e) => handleFilterChange('laPanel', e.target.checked)}
                />
                <span className="font-semibold text-gray-900">LA Panel Approved</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Only show professionals vetted for Local Authority work (Enhanced DBS, £6M Insurance).
              </p>
            </div>
          </div>

          {/* Results Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Searching professionals...</p>
              </div>
            ) : professionals.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">No professionals found</h3>
                <p className="mt-2 text-gray-500">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {professionals.map((pro) => (
                  <div key={pro.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex gap-6 hover:shadow-md transition-shadow">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden relative">
                        {pro.avatar ? (
                          <Image 
                            src={pro.avatar} 
                            alt={pro.name} 
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-gray-400">{pro.name.charAt(0)}</span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-gray-900">{pro.name}</h2>
                            {pro.verified && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium">Verified</span>
                            )}
                            {pro.isLaPanel && (
                              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                LA Panel
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 font-medium">{pro.title}</p>
                          <p className="text-sm text-gray-500 mt-1">{pro.location} • {pro.yearsExperience} years exp.</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">£{pro.dailyRate}</p>
                          <p className="text-sm text-gray-500">per day</p>
                        </div>
                      </div>

                      <p className="mt-4 text-gray-600 line-clamp-2">{pro.bio}</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {pro.specialisms.slice(0, 5).map((spec) => (
                          <span key={spec} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md">
                            {spec}
                          </span>
                        ))}
                        {pro.specialisms.length > 5 && (
                          <span className="text-xs text-gray-500 py-1">+{pro.specialisms.length - 5} more</span>
                        )}
                      </div>

                      <div className="mt-6 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                            {pro.rating.toFixed(1)} ({pro.reviewCount} reviews)
                          </span>
                          {pro.nextAvailable && (
                            <span className="text-green-600 font-medium">
                              Available from {new Date(pro.nextAvailable).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <Link 
                          href={`/marketplace/profile/${pro.id}`}
                          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 font-medium"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MarketplaceSearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <MarketplaceSearchContent />
    </Suspense>
  );
}