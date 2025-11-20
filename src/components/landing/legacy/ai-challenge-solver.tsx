'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaLightbulb, FaRocket, FaCheckCircle, FaSpinner } from 'react-icons/fa';


interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'academic' | 'career' | 'personal' | 'technical';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  aiAgent: string;
  tags: string[];
}

interface Solution {
  challengeId: string;
  content: string;
  steps: string[];
  resources: Array<{
    title: string;
    type: string;
    url?: string;
  }>;
  estimatedTime: number;
  confidence: number;
  agentName: string;
}

const AIChallengeSolver: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showCustomChallenge, setShowCustomChallenge] = useState(false);

  const solutionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const predefinedChallenges: Challenge[] = [
      {
        id: 'math_homework',
        title: 'Struggling with Math Homework',
        description: 'Need help understanding algebra concepts and solving equations',
        category: 'academic',
        difficulty: 'medium',
        estimatedTime: 30,
        aiAgent: 'Student Mentor Agent',
        tags: ['mathematics', 'algebra', 'homework', 'equations']
      },
      {
        id: 'career_planning',
        title: 'Planning My Career Path',
        description: 'Exploring different career options and educational requirements',
        category: 'career',
        difficulty: 'medium',
        estimatedTime: 45,
        aiAgent: 'Student Mentor Agent',
        tags: ['career', 'planning', 'education', 'future']
      },
      {
        id: 'study_techniques',
        title: 'Improving Study Techniques',
        description: 'Learning effective study methods and time management strategies',
        category: 'personal',
        difficulty: 'easy',
        estimatedTime: 25,
        aiAgent: 'Student Mentor Agent',
        tags: ['study', 'techniques', 'time management', 'learning']
      },
      {
        id: 'programming_basics',
        title: 'Learning Programming Basics',
        description: 'Getting started with programming concepts and basic syntax',
        category: 'technical',
        difficulty: 'easy',
        estimatedTime: 60,
        aiAgent: 'Curriculum Designer Agent',
        tags: ['programming', 'coding', 'basics', 'syntax']
      },
      {
        id: 'science_project',
        title: 'Science Project Planning',
        description: 'Designing and planning a comprehensive science experiment',
        category: 'academic',
        difficulty: 'hard',
        estimatedTime: 90,
        aiAgent: 'Curriculum Designer Agent',
        tags: ['science', 'project', 'experiment', 'planning']
      },
      {
        id: 'test_anxiety',
        title: 'Managing Test Anxiety',
        description: 'Strategies to overcome anxiety and perform better on exams',
        category: 'personal',
        difficulty: 'medium',
        estimatedTime: 35,
        aiAgent: 'Intervention Specialist Agent',
        tags: ['anxiety', 'test', 'stress', 'performance']
      },
      {
        id: 'learning_path',
        title: 'Creating a Learning Path',
        description: 'Designing a personalized learning journey for skill development',
        category: 'academic',
        difficulty: 'hard',
        estimatedTime: 75,
        aiAgent: 'Learning Path Optimizer Agent',
        tags: ['learning', 'path', 'personalized', 'skills']
      },
      {
        id: 'assessment_prep',
        title: 'Assessment Preparation',
        description: 'Creating practice assessments and study guides',
        category: 'academic',
        difficulty: 'medium',
        estimatedTime: 50,
        aiAgent: 'Assessment Generator Agent',
        tags: ['assessment', 'practice', 'preparation', 'study']
      }
    ];

    setChallenges(predefinedChallenges);
  }, []);

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || challenge.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || challenge.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleChallengeSelect = async (challenge: Challenge) => {
    setIsLoading(true);
    setSolution(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

      const mockSolution: Solution = {
        challengeId: challenge.id,
        content: generateSolutionContent(challenge),
        steps: generateSolutionSteps(challenge),
        resources: generateResources(challenge),
        estimatedTime: challenge.estimatedTime,
        confidence: 0.85 + Math.random() * 0.1,
        agentName: challenge.aiAgent
      };

      setSolution(mockSolution);
    } catch (error) {
      console.error('Error generating solution:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomChallenge = async () => {
    if (!userInput.trim()) return;

    setIsLoading(true);
    setSolution(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 2500));

      const mockSolution: Solution = {
        challengeId: 'custom',
        content: `I've analyzed your custom challenge: "${userInput}". Here's a personalized approach to help you address this situation.`,
        steps: [
          'Break down your challenge into smaller, manageable parts',
          'Identify the specific skills or knowledge you need',
          'Create a step-by-step action plan',
          'Gather relevant resources and materials',
          'Set realistic timelines and milestones',
          'Track your progress and adjust as needed'
        ],
        resources: [
          { title: 'Goal Setting Worksheet', type: 'Template' },
          { title: 'Progress Tracking Tools', type: 'Digital Tool' },
          { title: 'Motivational Resources', type: 'Articles' }
        ],
        estimatedTime: 45,
        confidence: 0.82,
        agentName: 'Student Mentor Agent'
      };

      setSolution(mockSolution);
    } catch (error) {
      console.error('Error generating custom solution:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSolutionContent = (challenge: Challenge): string => {
    const templates = {
      academic: `I'll help you tackle this ${challenge.difficulty} academic challenge. The key is to break it down into manageable steps and build your understanding systematically.`,
      career: `Career planning is an exciting journey! I'll help you explore your options and create a clear path forward with actionable steps.`,
      personal: `Personal development challenges are opportunities for growth. I'll provide you with practical strategies and emotional support.`,
      technical: `Technical skills are highly valuable! I'll guide you through the learning process with clear, step-by-step instructions.`
    };

    return templates[challenge.category] || 'I&apos;ll help you address this challenge with a personalized approach.';
  };

  const generateSolutionSteps = (challenge: Challenge): string[] => {
    const stepTemplates = {
      academic: [
        'Assess your current understanding of the topic',
        'Identify specific areas where you need help',
        'Break down complex concepts into smaller parts',
        'Practice with examples and exercises',
        'Apply your knowledge to solve problems',
        'Review and reinforce your understanding'
      ],
      career: [
        'Reflect on your interests, skills, and values',
        'Research different career options',
        'Identify required education and skills',
        'Create a timeline for achieving your goals',
        'Seek mentorship and guidance',
        'Take action towards your chosen path'
      ],
      personal: [
        'Identify the specific challenge you&apos;re facing',
        'Explore your feelings and thoughts about the situation',
        'Develop coping strategies and positive thinking',
        'Build a support network',
        'Practice self-care and stress management',
        'Celebrate small victories and progress'
      ],
      technical: [
        'Set up your development environment',
        'Learn fundamental concepts and terminology',
        'Practice with simple exercises and examples',
        'Build small projects to apply your knowledge',
        'Debug and troubleshoot common issues',
        'Continue learning and expanding your skills'
      ]
    };

    return stepTemplates[challenge.category] || [
      'Define your goal clearly',
      'Break it down into steps',
      'Gather necessary resources',
      'Take action consistently',
      'Track your progress',
      'Adjust and improve as needed'
    ];
  };

  const generateResources = (challenge: Challenge): Array<{ title: string; type: string; url?: string }> => {
    const resourceTemplates = {
      academic: [
        { title: 'Khan Academy', type: 'Online Learning Platform', url: 'https://www.khanacademy.org' },
        { title: 'Study Skills Guide', type: 'PDF Resource' },
        { title: 'Practice Worksheets', type: 'Interactive Exercises' }
      ],
      career: [
        { title: 'Career Assessment Tools', type: 'Online Assessment' },
        { title: 'Industry Reports', type: 'Research Documents' },
        { title: 'Mentorship Programs', type: 'Community Resources' }
      ],
      personal: [
        { title: 'Mindfulness Apps', type: 'Mobile Applications' },
        { title: 'Goal Setting Templates', type: 'Worksheets' },
        { title: 'Motivational Books', type: 'Reading Materials' }
      ],
      technical: [
        { title: 'Codecademy', type: 'Interactive Learning', url: 'https://www.codecademy.com' },
        { title: 'GitHub', type: 'Code Repository', url: 'https://github.com' },
        { title: 'Stack Overflow', type: 'Q&A Community', url: 'https://stackoverflow.com' }
      ]
    };

    return resourceTemplates[challenge.category] || [
      { title: 'General Learning Resources', type: 'Educational Materials' },
      { title: 'Practice Exercises', type: 'Interactive Content' },
      { title: 'Community Support', type: 'Discussion Forums' }
    ];
  };

  const scrollToSolution = () => {
    if (solutionRef.current) {
      solutionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    if (solution) {
      scrollToSolution();
    }
  }, [solution]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-3">
          <FaRobot className="text-4xl text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">AI Challenge Solver</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Describe any challenge you&apos;re facing, and our AI agents will provide personalized solutions,
          step-by-step guidance, and relevant resources to help you succeed.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">Describe Your Challenge</h2>
          <button
            onClick={() => setShowCustomChallenge(!showCustomChallenge)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {showCustomChallenge ? 'Hide' : 'Show'} Custom Input
          </button>
        </div>

        <AnimatePresence>
          {showCustomChallenge && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Describe your specific challenge, question, or situation..."
                className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
              <button
                onClick={handleCustomChallenge}
                disabled={!userInput.trim() || isLoading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <FaLightbulb />
                    <span>Get AI Solution</span>
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Explore Common Challenges</h2>

        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            placeholder="Search challenges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="academic">Academic</option>
            <option value="career">Career</option>
            <option value="personal">Personal</option>
            <option value="technical">Technical</option>
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gray-50 rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleChallengeSelect(challenge)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  challenge.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                  challenge.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {challenge.difficulty}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4">{challenge.description}</p>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="capitalize">{challenge.category}</span>
                <span>{challenge.estimatedTime} min</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {challenge.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-lg shadow-lg p-8 text-center"
          >
            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI is analyzing your challenge...</h3>
            <p className="text-gray-600">Our specialized AI agents are working together to provide you with the best solution.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {solution && !isLoading && (
          <motion.div
            ref={solutionRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <FaCheckCircle className="text-2xl text-green-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Your AI Solution</h2>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Powered by</div>
                <div className="font-semibold text-blue-600">{solution.agentName}</div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Solution Overview</h3>
                <p className="text-gray-700">{solution.content}</p>
                <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
                  <span>Estimated time: {solution.estimatedTime} minutes</span>
                  <span>Confidence: {Math.round(solution.confidence * 100)}%</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <FaRocket className="mr-2 text-blue-600" />
                  Step-by-Step Action Plan
                </h3>
                <div className="space-y-3">
                  {solution.steps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {solution.resources.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Recommended Resources</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {solution.resources.map((resource, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-medium">{resource.type[0]}</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{resource.title}</div>
                          <div className="text-sm text-gray-600">{resource.type}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                  <FaRocket />
                  <span>Start Implementation</span>
                </button>
                <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200">
                  Save Solution
                </button>
                <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200">
                  Get More Details
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIChallengeSolver;