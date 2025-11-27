/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useState, useEffect } from 'react';
import RecommendationList from './RecommendationList';
import RecommendationFilters from './RecommendationFilters';
import { RecommendationStatus } from '../../types/recommendation-engine-types';

/**
 * Main dashboard component for personalized content recommendations
 * Shows a list of recommendations with filtering and sorting capabilities
 */
const RecommendationDashboard: React.FC = () => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | null }>({ message: '', type: null });
  const [filters, setFilters] = useState({
    status: RecommendationStatus.ACTIVE,
    reason: '',
    contentType: '',
    categoryId: '',
    tagId: '',
    minScore: 0,
    limit: 12,
    offset: 0
  });
  
  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    setToast({ message: '', type: null });
    
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.reason) queryParams.append('reason', filters.reason);
      if (filters.contentType) queryParams.append('contentType', filters.contentType);
      if (filters.categoryId) queryParams.append('categoryId', filters.categoryId);
      if (filters.tagId) queryParams.append('tagId', filters.tagId);
      if (filters.minScore > 0) queryParams.append('minScore', filters.minScore.toString());
      queryParams.append('limit', filters.limit.toString());
      queryParams.append('offset', filters.offset.toString());
      
      // Fetch recommendations
      const response = await fetch(`/api/recommendations?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setRecommendations(data.data.recommendations);
        setTotalCount(data.data.count);
      } else {
        throw new Error(data.message || 'Failed to fetch recommendations');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setToast({
        message: err instanceof Error ? err.message : 'An unknown error occurred',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate new recommendations
  const generateRecommendations = async () => {
    setIsLoading(true);
    setToast({ message: '', type: null });
    
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ limit: 20 })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate new recommendations');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setToast({
          message: 'New recommendations generated successfully',
          type: 'success'
        });
        
        // Refresh the recommendation list
        fetchRecommendations();
      } else {
        throw new Error(data.message || 'Failed to generate recommendations');
      }
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'An unknown error occurred',
        type: 'error'
      });
      setIsLoading(false);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters, offset: 0 }); // Reset offset when changing filters
  };
  
  // Pagination
  const handlePageChange = (newOffset: number) => {
    setFilters({ ...filters, offset: newOffset });
  };
  
  // Initial fetch on component mount and when filters change
  useEffect(() => {
    fetchRecommendations();
  }, [filters]);
  
  return (
    <div className="w-full p-4 bg-white border border-gray-200 rounded-md shadow-sm">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Your Personalized Recommendations</h1>
          <p className="text-gray-600">Discover content tailored to your interests and needs</p>
        </div>
        
        {toast.type && (
          <div className={`p-3 rounded-md ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {toast.message}
          </div>
        )}
        
        <RecommendationFilters 
          filters={filters}
          onChange={handleFilterChange}
          onGenerate={generateRecommendations}
        />
        
        {isLoading ? (
          <div className="flex justify-center items-center p-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-500 rounded-md">
            {error}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-lg mb-4">No recommendations found based on your criteria.</p>
            <p>Try adjusting your filters or generate new recommendations.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="font-medium">
                Showing {recommendations.length} of {totalCount} recommendations
              </p>
              <select 
                className="max-w-[200px] p-2 border border-gray-300 rounded-md"
                value={filters.limit.toString()}
                onChange={(e) => handleFilterChange({ limit: Number(e.target.value) })}
              >
                <option value="6">6 per page</option>
                <option value="12">12 per page</option>
                <option value="24">24 per page</option>
                <option value="48">48 per page</option>
              </select>
            </div>
            
            <RecommendationList 
              recommendations={recommendations}
              onStatusChange={fetchRecommendations}
              onPaginate={handlePageChange}
              currentOffset={filters.offset}
              limit={filters.limit}
              totalCount={totalCount}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationDashboard;