/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useState, useEffect, useRef } from 'react';

interface Question {
  id: string;
  questionText: string;
  format?: {
    acceptedTypes?: string[];
    maxSizeInMB?: number;
  };
}

interface FileUploadQuestionProps {
  question: Question;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAnswerChange: (answerData: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentAnswer?: any;
}

const FileUploadQuestion: React.FC<FileUploadQuestionProps> = ({
  question,
  onAnswerChange,
  currentAnswer
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format properties
  const acceptedTypes = question.format?.acceptedTypes || [];
  const maxSizeInMB = question.format?.maxSizeInMB || 10; // Default 10MB
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  // Initialize from current answer if available
  useEffect(() => {
    if (currentAnswer && currentAnswer.fileUrl) {
      setFileUrl(currentAnswer.fileUrl);
      setFile(null); // Clear file state since we have a URL
    }
  }, [currentAnswer]);

  // Get acceptable file types string for input element
  const getAcceptString = (): string => {
    if (!acceptedTypes || acceptedTypes.length === 0) {
      return '*/*'; // Accept any file type if not specified
    }
    return acceptedTypes.join(',');
  };

  // Validate the selected file
  const validateFile = (selectedFile: File): boolean => {
    // Check file size
    if (selectedFile.size > maxSizeInBytes) {
      setError(`File size exceeds the maximum limit of ${maxSizeInMB}MB`);
      return false;
    }

    // Check file type if restrictions exist
    if (acceptedTypes && acceptedTypes.length > 0) {
      const fileType = selectedFile.type;
      const fileExtension = `.${selectedFile.name.split('.').pop()?.toLowerCase()}`;
      
      const isValidType = acceptedTypes.some(type => {
        // Handle mime types and extensions
        return type === fileType || 
               type === fileExtension || 
               (type.startsWith('.') && fileExtension === type) ||
               (type.endsWith('/*') && fileType.startsWith(type.replace('/*', '')));
      });

      if (!isValidType) {
        setError(`File type not accepted. Please upload one of these types: ${acceptedTypes.join(', ')}`);
        return false;
      }
    }

    setError(null);
    return true;
  };

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file
    if (!validateFile(selectedFile)) {
      e.target.value = '';
      return;
    }

    setFile(selectedFile);
    setLoading(true);

    try {
      // In a real app, we would upload the file to a server here
      // For this implementation, we'll create a local object URL
      const objectUrl = URL.createObjectURL(selectedFile);
      setFileUrl(objectUrl);

      // Notify parent of change
      onAnswerChange({
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        fileUrl: objectUrl, // In a real app, this would be the URL from the server
        type: 'file_upload'
      });

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (_err) {
      console.error('Error handling file:', _err);
      setError('Failed to process file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Clear the selected file
  const handleClearFile = () => {
    setFile(null);
    setFileUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Notify parent of change
    onAnswerChange({
      fileName: null,
      fileType: null,
      fileSize: null,
      fileUrl: null,
      type: 'file_upload'
    });
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
      return `${bytes} bytes`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  return (
    <div className="file-upload-question">
      <div className="mb-4">
        {/* File upload constraints */}
        <div className="text-sm text-gray-600 mb-2">
          {acceptedTypes && acceptedTypes.length > 0 && (
            <div>Accepted file types: {acceptedTypes.join(', ')}</div>
          )}
          <div>Maximum file size: {maxSizeInMB}MB</div>
        </div>

        {/* File upload input */}
        {!fileUrl ? (
          <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor={`file-upload-${question.id}`}
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <span>Upload a file</span>
                  <input
                    id={`file-upload-${question.id}`}
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept={getAcceptString()}
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    disabled={loading}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
            </div>
          </div>
        ) : (
          // Display uploaded file
          <div className="mt-2 p-4 border rounded-md bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {file?.name || (fileUrl ? 'Uploaded file' : '')}
                  </p>
                  {file && (
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleClearFile}
                className="ml-4 text-sm font-medium text-red-600 hover:text-red-500"
                disabled={loading}
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="mt-2 text-center">
            <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-1 text-sm text-gray-500">Uploading file...</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-2 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadQuestion;