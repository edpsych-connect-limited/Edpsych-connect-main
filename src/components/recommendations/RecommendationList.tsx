/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';
import { RecommendationReason, RecommendationStatus } from '../../types/recommendation-engine-types';

interface RecommendationListProps {
  recommendations: any[];
  onStatusChange: () => void;
  onPaginate: (offset: number) => void;
  currentOffset: number;
  limit: number;
  totalCount: number;
}

const RecommendationList: React.FC<RecommendationListProps> = ({
  recommendations,
  onStatusChange,
  onPaginate,
  currentOffset,
  limit,
  totalCount
}) => {
  const totalPages = Math.ceil(totalCount / limit);
  const currentPage = Math.floor(currentOffset / limit) + 1;
  
  // Handle changing the status of a recommendation (accept, dismiss, etc)
  const handleStatusChange = async (id: string, status: RecommendationStatus) => {
    try {
      const response = await fetch(`/api/recommendations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        onStatusChange();
      }
    } catch (_error) {
      console.error('Error updating recommendation status:', _error);
    }
  };
  
  // Get appropriate icon and color for recommendation reason
  const getReasonIcon = (reason: RecommendationReason) => {
    switch (reason) {
      case RecommendationReason.SIMILAR_CONTENT:
        return { icon: '📚', bgColor: 'bg-blue-100', textColor: 'text-blue-800' };
      case RecommendationReason.USER_INTEREST:
        return { icon: '❤️', bgColor: 'bg-red-100', textColor: 'text-red-800' };
      case RecommendationReason.POPULAR:
        return { icon: '🔥', bgColor: 'bg-orange-100', textColor: 'text-orange-800' };
      case RecommendationReason.TRENDING:
        return { icon: '📈', bgColor: 'bg-green-100', textColor: 'text-green-800' };
      case RecommendationReason.ASSESSMENT_BASED:
        return { icon: '📝', bgColor: 'bg-purple-100', textColor: 'text-purple-800' };
      case RecommendationReason.COLLEAGUE_USED:
        return { icon: '👥', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' };
      default:
        return { icon: '📎', bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
    }
  };
  
  // Format the recommendation reason for display
  const formatReason = (reason: RecommendationReason) => {
    return reason.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    const newOffset = (page - 1) * limit;
    onPaginate(newOffset);
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec) => {
          const { icon, bgColor, textColor } = getReasonIcon(rec.reason);
          
          return (
            <div 
              key={rec.id} 
              className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg line-clamp-2">{rec.contentTitle}</h3>
                  <span className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">
                    {rec.contentType}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {rec.contentDescription || 'No description available'}
                </p>
                
                <div className="flex items-center mb-4">
                  <span className={`text-xs ${bgColor} ${textColor} px-2 py-1 rounded-full flex items-center`}>
                    <span className="mr-1">{icon}</span>
                    {formatReason(rec.reason)}
                  </span>
                  <span className="ml-auto text-sm text-gray-500">
                    Score: {(rec.score * 100).toFixed(0)}%
                  </span>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleStatusChange(rec.id, RecommendationStatus.CLICKED)}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md text-sm hover:bg-blue-700 transition-colors"
                  >
                    View Content
                  </button>
                  <button
                    onClick={() => handleStatusChange(rec.id, RecommendationStatus.DISMISSED)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
                    aria-label="Dismiss"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                  currentPage === i + 1
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default RecommendationList;
