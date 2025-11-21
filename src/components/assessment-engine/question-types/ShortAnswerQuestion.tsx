import React, { useState, useEffect } from 'react';

interface Question {
  id: string;
  questionText: string;
  format?: {
    maxLength?: number;
    placeholder?: string;
  };
}

interface ShortAnswerQuestionProps {
  question: Question;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAnswerChange: (answerData: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentAnswer?: any;
}

const ShortAnswerQuestion: React.FC<ShortAnswerQuestionProps> = ({
  question,
  onAnswerChange,
  currentAnswer
}) => {
  const [answer, setAnswer] = useState('');
  const maxLength = question.format?.maxLength || 250;
  const placeholder = question.format?.placeholder || 'Enter your answer here...';

  // Initialize from current answer if available
  useEffect(() => {
    if (currentAnswer && currentAnswer.text) {
      setAnswer(currentAnswer.text);
    }
  }, [currentAnswer]);

  // Handle text input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAnswer = e.target.value;
    setAnswer(newAnswer);
    
    // Notify parent of change
    onAnswerChange({
      text: newAnswer,
      type: 'short_answer'
    });
  };

  return (
    <div className="short-answer-question">
      <div className="mt-1">
        <input
          type="text"
          id={`question-${question.id}`}
          value={answer}
          onChange={handleInputChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>
      
      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>Short answer (max {maxLength} characters)</span>
        <span>{answer.length}/{maxLength}</span>
      </div>
    </div>
  );
};

export default ShortAnswerQuestion;