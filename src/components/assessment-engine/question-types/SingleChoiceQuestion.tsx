import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface QuestionOption {
  id: string;
  text: string;
  orderIndex: number;
  isCorrect: boolean;
  mediaUrl?: string;
  mediaType?: string;
}

interface Question {
  id: string;
  questionText: string;
  options?: QuestionOption[];
}

interface SingleChoiceQuestionProps {
  question: Question;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAnswerChange: (answerData: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentAnswer?: any;
}

const SingleChoiceQuestion: React.FC<SingleChoiceQuestionProps> = ({
  question,
  onAnswerChange,
  currentAnswer
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Initialize from current answer if available
  useEffect(() => {
    if (currentAnswer && currentAnswer.selectedOptionIds && currentAnswer.selectedOptionIds.length > 0) {
      setSelectedOption(currentAnswer.selectedOptionIds[0]);
    }
  }, [currentAnswer]);

  // Handle radio button change
  const handleOptionChange = (optionId: string) => {
    setSelectedOption(optionId);
    
    // Notify parent of change
    onAnswerChange({
      selectedOptionIds: [optionId],
      type: 'single_choice'
    });
  };

  // Sort options by orderIndex
  const sortedOptions = question.options 
    ? [...question.options].sort((a, b) => a.orderIndex - b.orderIndex) 
    : [];

  return (
    <div className="single-choice-question">
      <fieldset>
        <legend className="sr-only">Select one option</legend>
        <div className="text-sm text-gray-600 mb-4">Select one option:</div>
        
        <div className="space-y-3">
          {sortedOptions.map(option => (
            <div key={option.id} className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id={option.id}
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.id}
                  checked={selectedOption === option.id}
                  onChange={() => handleOptionChange(option.id)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor={option.id} className="text-gray-700 cursor-pointer">
                  {option.text}
                </label>
                
                {/* Render option media if available */}
                {option.mediaUrl && option.mediaType === 'IMAGE' && (
                  <div className="mt-2 relative w-full h-32">
                    <Image 
                      src={option.mediaUrl} 
                      alt={`Option ${option.orderIndex} visual`} 
                      fill
                      className="object-contain rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </fieldset>
    </div>
  );
};

export default SingleChoiceQuestion;