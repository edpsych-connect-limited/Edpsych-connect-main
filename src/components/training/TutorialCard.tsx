'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useState } from 'react';
import Image from 'next/image';

interface TutorialProps {
  tutorial: {
    id: string;
    title: string;
    description: string;
    category: 'beginner' | 'intermediate' | 'advanced';
    duration: number;
    format: 'video' | 'interactive' | 'guide';
    thumbnailUrl?: string;
    completed?: boolean;
    progress?: number;
    tags: string[];
    url: string;
    featured?: boolean;
  };
  onComplete: () => void;
}

const TutorialCard: React.FC<TutorialProps> = ({ tutorial, onComplete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to get category styling
  const getCategoryStyles = () => {
    switch(tutorial.category) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to get format styling and icon
  const getFormatInfo = () => {
    switch(tutorial.format) {
      case 'video':
        return {
          styles: 'bg-purple-100 text-purple-800',
          icon: '🎬' // In a real implementation, this would be an SVG or icon component
        };
      case 'interactive':
        return {
          styles: 'bg-blue-100 text-blue-800',
          icon: '🖱️'
        };
      case 'guide':
        return {
          styles: 'bg-indigo-100 text-indigo-800',
          icon: '📄'
        };
      default:
        return {
          styles: 'bg-gray-100 text-gray-800',
          icon: '📚'
        };
    }
  };

  const formatInfo = getFormatInfo();

  // Simulate launching a tutorial
  const handleLaunchTutorial = () => {
    // In a real implementation, this would navigate to the tutorial URL
    setIsModalOpen(true);
  };

  // Simulate completing a tutorial
  const handleCompleteTutorial = () => {
    onComplete();
    setIsModalOpen(false);
  };

  return (
    <div 
      className={`relative border rounded-lg overflow-hidden transition-all ${
        isHovered ? 'shadow-md transform -translate-y-1' : 'shadow'
      } ${tutorial.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tutorial Completion Badge */}
      {tutorial.completed && (
        <div className="absolute top-3 right-3 z-10 bg-green-500 text-white rounded-full p-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Tutorial Thumbnail */}
      <div className="relative h-40 bg-gray-200">
        {tutorial.thumbnailUrl ? (
          <Image 
            src={tutorial.thumbnailUrl} 
            alt={tutorial.title} 
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <span className="text-gray-500 text-lg">No Image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>

      {/* Tutorial Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryStyles()}`}>
            {tutorial.category.charAt(0).toUpperCase() + tutorial.category.slice(1)}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center ${formatInfo.styles}`}>
            <span className="mr-1">{formatInfo.icon}</span>
            {tutorial.format.charAt(0).toUpperCase() + tutorial.format.slice(1)}
          </span>
        </div>
        
        <h3 className="font-semibold text-gray-800 mb-1">{tutorial.title}</h3>
        <p className="text-sm text-gray-600 mb-3">{tutorial.description}</p>
        
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{tutorial.duration} min</span>
          </div>
          
          {tutorial.progress !== undefined && !tutorial.completed && (
            <span className="text-xs text-blue-700">{tutorial.progress}% Complete</span>
          )}
        </div>
        
        {/* Tags */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {tutorial.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
            {tutorial.tags.length > 3 && (
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                +{tutorial.tags.length - 3} more
              </span>
            )}
          </div>
        </div>
        
        {/* Action Button */}
        <button
          className={`w-full py-2 rounded-md ${
            tutorial.completed 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          onClick={handleLaunchTutorial}
        >
          {tutorial.completed ? 'Review Again' : 'Start Tutorial'}
        </button>
      </div>

      {/* Tutorial Modal (simplified - in a real implementation this would be more sophisticated) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-xl w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-800">{tutorial.title}</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center mb-4">
                <div className="text-4xl">
                  {formatInfo.icon}
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">{tutorial.description}</p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-800 mb-1">What You&apos;ll Learn</h3>
                <ul className="list-disc list-inside text-blue-700">
                  <li>Core concepts of {tutorial.title}</li>
                  <li>Practical implementation techniques</li>
                  <li>Best practices for educational psychology professionals</li>
                  <li>Real-world application examples</li>
                </ul>
              </div>
              
              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 mb-1">Tutorial Details</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-600">{tutorial.duration} minutes</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm text-gray-600">
                      {tutorial.format.charAt(0).toUpperCase() + tutorial.format.slice(1)} Format
                    </span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-sm text-gray-600">
                      {tutorial.category.charAt(0).toUpperCase() + tutorial.category.slice(1)} Level
                    </span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="text-sm text-gray-600">
                      {tutorial.tags.slice(0, 2).join(', ')}
                      {tutorial.tags.length > 2 && '...'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
              <button
                className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handleCompleteTutorial}
              >
                Mark as Completed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorialCard;
