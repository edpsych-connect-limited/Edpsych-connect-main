/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface OrderItem {
  id: string;
  text: string;
  orderIndex: number;
  mediaUrl?: string;
  mediaType?: string;
}

interface Question {
  id: string;
  questionText: string;
  options?: OrderItem[];
}

interface OrderingQuestionProps {
  question: Question;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAnswerChange: (answerData: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentAnswer?: any;
}

const OrderingQuestion: React.FC<OrderingQuestionProps> = ({
  question,
  onAnswerChange,
  currentAnswer
}) => {
  const [orderedItems, setOrderedItems] = useState<string[]>([]);

  // Initialize items to sort
  useEffect(() => {
    if (question.options) {
      // If we already have an answer, use that order
      if (currentAnswer && currentAnswer.order && currentAnswer.order.length > 0) {
        setOrderedItems(currentAnswer.order);
      } else {
        // Otherwise, initialize with shuffled order
        const shuffled = [...question.options]
          .sort(() => Math.random() - 0.5)
          .map(item => item.id);
        setOrderedItems(shuffled);
        
        // Notify parent of initial order
        onAnswerChange({
          order: shuffled,
          type: 'ordering'
        });
      }
    }
  }, [question.options, currentAnswer, onAnswerChange]);

  // Move item up in the order
  const moveItemUp = (index: number) => {
    if (index === 0) return; // Already at the top
    
    setOrderedItems(prev => {
      const newOrder = [...prev];
      const temp = newOrder[index];
      newOrder[index] = newOrder[index - 1];
      newOrder[index - 1] = temp;
      
      // Notify parent of change
      onAnswerChange({
        order: newOrder,
        type: 'ordering'
      });
      
      return newOrder;
    });
  };

  // Move item down in the order
  const moveItemDown = (index: number) => {
    if (index === orderedItems.length - 1) return; // Already at the bottom
    
    setOrderedItems(prev => {
      const newOrder = [...prev];
      const temp = newOrder[index];
      newOrder[index] = newOrder[index + 1];
      newOrder[index + 1] = temp;
      
      // Notify parent of change
      onAnswerChange({
        order: newOrder,
        type: 'ordering'
      });
      
      return newOrder;
    });
  };

  // Get the text for an item by its ID
  const getItemById = (id: string): OrderItem | undefined => {
    return question.options?.find(item => item.id === id);
  };

  return (
    <div className="ordering-question">
      <div className="text-sm text-gray-600 mb-4">
        Arrange the items in the correct order using the up and down buttons.
      </div>
      
      <div className="space-y-2 mt-4">
        {orderedItems.map((itemId, index) => {
          const item = getItemById(itemId);
          if (!item) return null;
          
          return (
            <div 
              key={itemId}
              className="flex items-center p-3 border border-gray-200 rounded-lg bg-white"
            >
              <div className="w-8 text-center font-bold text-gray-500">
                {index + 1}
              </div>
              
              <div className="flex-grow mx-3">
                <div className="text-gray-800">{item.text}</div>
                
                {item.mediaUrl && item.mediaType === 'IMAGE' && (
                  <div className="mt-2 relative w-full h-32">
                    <Image 
                      src={item.mediaUrl} 
                      alt={`Item ${index + 1}`}
                      fill
                      className="object-contain rounded-md" 
                    />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col space-y-1">
                <button
                  type="button"
                  onClick={() => moveItemUp(index)}
                  disabled={index === 0}
                  className={`p-1 rounded ${
                    index === 0 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-blue-600 hover:bg-blue-100'
                  }`}
                  aria-label="Move up"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </button>
                
                <button
                  type="button"
                  onClick={() => moveItemDown(index)}
                  disabled={index === orderedItems.length - 1}
                  className={`p-1 rounded ${
                    index === orderedItems.length - 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-blue-600 hover:bg-blue-100'
                  }`}
                  aria-label="Move down"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderingQuestion;
