'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useState } from 'react';
import { RecommendationReason, RecommendationStatus } from '../../types/recommendation-engine-types';

interface RecommendationFiltersProps {
  filters: {
    status: RecommendationStatus;
    reason: string;
    contentType: string;
    categoryId: string;
    tagId: string;
    minScore: number;
  };
  onChange: (filters: any) => void;
  onGenerate: () => void;
}

const RecommendationFilters: React.FC<RecommendationFiltersProps> = ({ 
  filters, 
  onChange, 
  onGenerate 
}) => {
  const [expanded, setExpanded] = useState(false);
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ status: e.target.value as RecommendationStatus });
  };
  
  const handleReasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ reason: e.target.value });
  };
  
  const handleContentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ contentType: e.target.value });
  };
  
  const handleMinScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ minScore: parseFloat(e.target.value) });
  };
  
  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <div className="bg-gray-50 p-3 flex justify-between items-center">
        <h2 className="font-semibold">Filters</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100"
          >
            {expanded ? 'Collapse' : 'Expand'}
          </button>
          <button
            onClick={onGenerate}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Generate New
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={handleStatusChange}
              aria-label="Filter by status"
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value={RecommendationStatus.ACTIVE}>Active</option>
              <option value={RecommendationStatus.CLICKED}>Clicked</option>
              <option value={RecommendationStatus.DISMISSED}>Dismissed</option>
              <option value={RecommendationStatus.EXPIRED}>Expired</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recommendation Reason
            </label>
            <select
              value={filters.reason}
              onChange={handleReasonChange}
              aria-label="Filter by recommendation reason"
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Reasons</option>
              <option value={RecommendationReason.SIMILAR_CONTENT}>Similar Content</option>
              <option value={RecommendationReason.USER_INTEREST}>User Interest</option>
              <option value={RecommendationReason.POPULAR}>Popular</option>
              <option value={RecommendationReason.TRENDING}>Trending</option>
              <option value={RecommendationReason.ASSESSMENT_BASED}>Assessment Based</option>
              <option value={RecommendationReason.COLLEAGUE_USED}>Colleague Used</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content Type
            </label>
            <select
              value={filters.contentType}
              onChange={handleContentTypeChange}
              aria-label="Filter by content type"
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Types</option>
              <option value="ARTICLE">Article</option>
              <option value="VIDEO">Video</option>
              <option value="ASSESSMENT">Assessment</option>
              <option value="WORKSHEET">Worksheet</option>
              <option value="TEMPLATE">Template</option>
              <option value="RESOURCE">Resource</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Score
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={filters.minScore}
              onChange={handleMinScoreChange}
              aria-label="Minimum recommendation score"
              className="w-full"
            />
            <div className="text-sm text-gray-500 text-right">
              {filters.minScore.toFixed(1)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationFilters;
