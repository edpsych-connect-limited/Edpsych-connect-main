/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useState } from 'react';
import { FaBookOpen, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { useSession } from 'next-auth/react';

interface TutoringRequest {
  studentId: string;
  subject: string;
  topic: string;
  currentLevel: 'foundation' | 'developing' | 'secure' | 'mastery';
  learningObjectives: string[];
  timeAvailable: number;
  preferredLearningStyle: 'visual' | 'auditory' | 'kinaesthetic' | 'reading';
}

interface TutoringResponse {
  personalisedExplanation: string;
  interactiveExercise: {
    type: string;
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
  };
  nextSteps: string[];
  resources: {
    type: string;
    title: string;
    url: string;
    description: string;
  }[];
  masteryAssessment: {
    currentLevel: string;
    progressToNextLevel: number;
    recommendedPracticeTime: number;
  };
  motivationalMessage: string;
}

export default function TutoringInterfaceSimple() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<TutoringResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<TutoringRequest>({
    studentId: session?.user?.email || '',
    subject: '',
    topic: '',
    currentLevel: 'developing',
    learningObjectives: [''],
    timeAvailable: 30,
    preferredLearningStyle: 'visual'
  });

  const subjects = [
    'Mathematics', 'English', 'Science', 'History', 'Geography'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/orchestrator/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get tutoring assistance');
      }

      const data = await response.json();
      setResponse(data.result);
    } catch (_err) {
      setError(_err instanceof Error ? _err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...formData.learningObjectives];
    newObjectives[index] = value;
    setFormData({ ...formData, learningObjectives: newObjectives });
  };

  const addObjective = () => {
    setFormData({
      ...formData,
      learningObjectives: [...formData.learningObjectives, '']
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-8">
          <FaBookOpen className="text-4xl text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">AI Tutoring Assistant</h1>
          <p className="text-gray-600 mt-2">Get personalized tutoring help</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="subject-select" className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                id="subject-select"
                aria-label="Select subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select subject</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g., Algebra, Photosynthesis"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Learning Objectives</label>
            {formData.learningObjectives.map((objective, index) => (
              <input
                key={index}
                type="text"
                value={objective}
                onChange={(e) => handleObjectiveChange(index, e.target.value)}
                placeholder="What do you want to learn?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
                required
              />
            ))}
            <button
              type="button"
              onClick={addObjective}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Add Objective
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Getting tutoring assistance...</span>
              </>
            ) : (
              'Get Tutoring Help'
            )}
          </button>
        </form>
      </div>

      {response && (
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-6">
            <FaCheckCircle className="text-2xl text-green-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">Your Tutoring Session</h2>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Personalized Explanation</h3>
              <p className="text-gray-700">{response.personalisedExplanation}</p>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Interactive Exercise</h3>
              <p className="font-medium mb-2">{response.interactiveExercise.question}</p>

              {response.interactiveExercise.options && (
                <div className="space-y-1 mb-3">
                  {response.interactiveExercise.options.map((option, index) => (
                    <div key={index} className="p-2 border rounded">{option}</div>
                  ))}
                </div>
              )}

              <details>
                <summary className="cursor-pointer text-blue-600">Show Answer</summary>
                <div className="mt-2 p-3 bg-gray-50 rounded">
                  <p><strong>Answer:</strong> {response.interactiveExercise.correctAnswer}</p>
                  <p className="mt-1"><strong>Explanation:</strong> {response.interactiveExercise.explanation}</p>
                </div>
              </details>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Next Steps</h3>
              <ul className="space-y-1">
                {response.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2 mt-0.5">{index + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Motivational Message</h3>
              <p className="text-lg italic text-gray-700">&quot;{response.motivationalMessage}&quot;</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}