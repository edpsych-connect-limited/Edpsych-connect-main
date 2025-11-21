import React, { useState, useEffect } from 'react';

interface Question {
  id: string;
  questionText: string;
  format?: {
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    precision?: number;
  };
}

interface NumericQuestionProps {
  question: Question;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAnswerChange: (answerData: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentAnswer?: any;
}

const NumericQuestion: React.FC<NumericQuestionProps> = ({
  question,
  onAnswerChange,
  currentAnswer
}) => {
  const [value, setValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Get format properties with defaults
  const min = question.format?.min;
  const max = question.format?.max;
  const step = question.format?.step || 1;
  const unit = question.format?.unit || '';
  const precision = question.format?.precision || 0;

  // Initialize from current answer if available
  useEffect(() => {
    if (currentAnswer && currentAnswer.value !== undefined) {
      setValue(currentAnswer.value.toString());
    }
  }, [currentAnswer]);

  // Validate the numeric input
  const validateInput = (input: string): boolean => {
    // Empty input is allowed (for now)
    if (!input) {
      setError(null);
      return true;
    }

    // Check if it's a valid number
    const numValue = parseFloat(input);
    if (isNaN(numValue)) {
      setError('Please enter a valid number');
      return false;
    }

    // Check min constraint
    if (min !== undefined && numValue < min) {
      setError(`Value must be greater than or equal to ${min}`);
      return false;
    }

    // Check max constraint
    if (max !== undefined && numValue > max) {
      setError(`Value must be less than or equal to ${max}`);
      return false;
    }

    setError(null);
    return true;
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    if (validateInput(newValue)) {
      // Notify parent of change only if valid
      const numValue = newValue ? parseFloat(newValue) : null;
      
      onAnswerChange({
        value: numValue,
        unit,
        type: 'numeric'
      });
    }
  };

  // Format with appropriate precision
  const formatValue = (val: number): string => {
    return val.toFixed(precision);
  };

  // Handle increment/decrement
  const handleIncrement = () => {
    const currentVal = value ? parseFloat(value) : 0;
    if (max !== undefined && currentVal >= max) return;
    
    const newValue = formatValue(currentVal + step);
    setValue(newValue);
    validateInput(newValue);
    
    onAnswerChange({
      value: parseFloat(newValue),
      unit,
      type: 'numeric'
    });
  };

  const handleDecrement = () => {
    const currentVal = value ? parseFloat(value) : 0;
    if (min !== undefined && currentVal <= min) return;
    
    const newValue = formatValue(currentVal - step);
    setValue(newValue);
    validateInput(newValue);
    
    onAnswerChange({
      value: parseFloat(newValue),
      unit,
      type: 'numeric'
    });
  };

  return (
    <div className="numeric-question">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center">
          <div className="relative rounded-md shadow-sm flex-grow">
            <input
              type="text"
              id={`numeric-${question.id}`}
              value={value}
              onChange={handleChange}
              className={`block w-full pr-12 sm:text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                error 
                  ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              placeholder="Enter a number"
              aria-describedby={error ? `error-${question.id}` : undefined}
            />
            {unit && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">{unit}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col ml-2">
            <button
              type="button"
              onClick={handleIncrement}
              disabled={max !== undefined && value ? parseFloat(value) >= max : false}
              className="p-1 border border-gray-300 text-gray-700 bg-gray-50 rounded-t-md hover:bg-gray-100 focus:outline-none"
              aria-label="Increase value"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleDecrement}
              disabled={min !== undefined && value ? parseFloat(value) <= min : false}
              className="p-1 border border-gray-300 border-t-0 text-gray-700 bg-gray-50 rounded-b-md hover:bg-gray-100 focus:outline-none"
              aria-label="Decrease value"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        {error && (
          <div id={`error-${question.id}`} className="mt-1 text-red-600 text-sm">
            {error}
          </div>
        )}
        
        {min !== undefined || max !== undefined ? (
          <div className="text-sm text-gray-500">
            {min !== undefined && max !== undefined
              ? `Valid range: ${min} to ${max}${unit ? ` ${unit}` : ''}`
              : min !== undefined
              ? `Minimum value: ${min}${unit ? ` ${unit}` : ''}`
              : `Maximum value: ${max}${unit ? ` ${unit}` : ''}`
            }
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default NumericQuestion;