import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalculator, FaRocket, FaStar, FaCheck, FaArrowRight, FaLightbulb } from 'react-icons/fa';


interface UserProfile {
  role: 'student' | 'teacher' | 'parent' | 'school' | 'individual';
  usage: 'light' | 'moderate' | 'heavy';
  features: string[];
  budget: 'low' | 'medium' | 'high' | 'enterprise';
  duration: 'monthly' | 'annual' | 'lifetime';
}

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  currency: string;
  billingCycle: 'monthly' | 'annual';
  features: string[];
  aiAgents: string[];
  limits: {
    students?: number;
    aiInteractions?: number;
    storage?: string;
    support?: string;
  };
  popular?: boolean;
  enterprise?: boolean;
  customization: {
    allowed: boolean;
    options: string[];
  };
}

interface Recommendation {
  plan: PricingPlan;
  reasoning: string[];
  savings: {
    amount: number;
    percentage: number;
    description: string;
  };
  confidence: number;
}

const SmartPricingWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    role: 'student',
    usage: 'moderate',
    features: [],
    budget: 'medium',
    duration: 'monthly'
  });
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [allPlans] = useState<PricingPlan[]>([
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for individual students exploring AI-powered learning',
      basePrice: 9.99,
      currency: 'USD',
      billingCycle: 'monthly',
      features: [
        'Access to 3 AI Agents',
        '50 AI Interactions per month',
        'Basic progress tracking',
        'Email support',
        'Mobile app access'
      ],
      aiAgents: ['Student Mentor Agent', 'Curriculum Designer Agent'],
      limits: {
        aiInteractions: 50,
        storage: '1GB',
        support: 'Email'
      },
      customization: {
        allowed: false,
        options: []
      }
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Ideal for serious learners and individual educators',
      basePrice: 29.99,
      currency: 'USD',
      billingCycle: 'monthly',
      features: [
        'Access to all 6 AI Agents',
        '200 AI Interactions per month',
        'Advanced analytics & reporting',
        'Priority email support',
        'Custom learning paths',
        'Progress visualization',
        'Mobile & desktop access'
      ],
      aiAgents: ['All AI Agents'],
      limits: {
        aiInteractions: 200,
        storage: '10GB',
        support: 'Priority Email & Chat'
      },
      popular: true,
      customization: {
        allowed: true,
        options: ['Custom branding', 'Additional storage']
      }
    },
    {
      id: 'school',
      name: 'School License',
      description: 'Comprehensive solution for schools and educational institutions',
      basePrice: 99.99,
      currency: 'USD',
      billingCycle: 'monthly',
      features: [
        'Unlimited AI Interactions',
        'Up to 500 students',
        'All 6 AI Agents',
        'Advanced analytics dashboard',
        'Teacher training & support',
        'Custom curriculum integration',
        'Dedicated account manager',
        'Phone & email support',
        'White-label option'
      ],
      aiAgents: ['All AI Agents'],
      limits: {
        students: 500,
        support: 'Dedicated Account Manager'
      },
      customization: {
        allowed: true,
        options: ['Custom integrations', 'White-labeling', 'API access', 'Custom reporting']
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Full-scale enterprise solution with unlimited access',
      basePrice: 499.99,
      currency: 'USD',
      billingCycle: 'monthly',
      features: [
        'Everything in School License',
        'Unlimited students',
        'Custom AI agent development',
        'On-premise deployment option',
        'Advanced security & compliance',
        '24/7 phone support',
        'Custom integrations',
        'Dedicated technical team',
        'SLA guarantee'
      ],
      aiAgents: ['All AI Agents + Custom Agents'],
      limits: {
        support: '24/7 Dedicated Technical Team'
      },
      enterprise: true,
      customization: {
        allowed: true,
        options: ['Custom AI development', 'On-premise deployment', 'Custom security', 'Advanced integrations']
      }
    }
  ]);

  const questions = [
    {
      id: 1,
      question: 'What best describes your role?',
      options: [
        { value: 'student', label: 'Student', icon: '🎓', description: 'Individual learner' },
        { value: 'teacher', label: 'Teacher', icon: '👨‍🏫', description: 'Educator or tutor' },
        { value: 'parent', label: 'Parent', icon: '👨‍👩‍👧‍👦', description: 'Supporting child\'s learning' },
        { value: 'school', label: 'School', icon: '🏫', description: 'Educational institution' },
        { value: 'individual', label: 'Individual', icon: '👤', description: 'Personal development' }
      ]
    },
    {
      id: 2,
      question: 'How often do you plan to use the platform?',
      options: [
        { value: 'light', label: 'Light Usage', icon: '🌟', description: 'Occasional use (1-2 times/week)' },
        { value: 'moderate', label: 'Moderate Usage', icon: '⚡', description: 'Regular use (3-5 times/week)' },
        { value: 'heavy', label: 'Heavy Usage', icon: '🚀', description: 'Daily intensive use' }
      ]
    },
    {
      id: 3,
      question: 'Which features are most important to you?',
      type: 'multiSelect',
      options: [
        { value: 'ai_agents', label: 'AI Agent Interactions', icon: '🤖' },
        { value: 'progress_tracking', label: 'Progress Tracking', icon: '📊' },
        { value: 'curriculum_design', label: 'Curriculum Design', icon: '📚' },
        { value: 'assessment_creation', label: 'Assessment Creation', icon: '📝' },
        { value: 'analytics', label: 'Advanced Analytics', icon: '📈' },
        { value: 'collaboration', label: 'Collaboration Tools', icon: '🤝' },
        { value: 'mobile_access', label: 'Mobile Access', icon: '📱' },
        { value: 'api_access', label: 'API Access', icon: '🔌' }
      ]
    },
    {
      id: 4,
      question: 'What is your budget range?',
      options: [
        { value: 'low', label: '$0-20/month', icon: '💰', description: 'Basic features' },
        { value: 'medium', label: '$20-100/month', icon: '💎', description: 'Most popular' },
        { value: 'high', label: '$100-300/month', icon: '👑', description: 'Advanced features' },
        { value: 'enterprise', label: '$300+/month', icon: '🏢', description: 'Enterprise solutions' }
      ]
    },
    {
      id: 5,
      question: 'How long do you plan to use the service?',
      options: [
        { value: 'monthly', label: 'Month-to-Month', icon: '📅', description: 'Flexible monthly billing' },
        { value: 'annual', label: 'Annual Plan', icon: '📆', description: 'Save 20% with annual billing' },
        { value: 'lifetime', label: 'Lifetime Access', icon: '♾️', description: 'One-time payment, lifetime access' }
      ]
    }
  ];

  const handleAnswer = (questionId: number, answer: any) => {
    if (questionId === 3) {
      // Multi-select for features
      setUserProfile(prev => ({
        ...prev,
        features: answer
      }));
    } else {
      const field = questionId === 1 ? 'role' :
                   questionId === 2 ? 'usage' :
                   questionId === 4 ? 'budget' : 'duration';

      setUserProfile(prev => ({
        ...prev,
        [field]: answer
      }));
    }

    if (currentStep < questions.length) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateRecommendation();
    }
  };

  const calculateRecommendation = async () => {
    setIsCalculating(true);

    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const recommendedPlan = findOptimalPlan();
      const reasoning = generateReasoning(recommendedPlan);
      const savings = calculateSavings(recommendedPlan);

      setRecommendation({
        plan: recommendedPlan,
        reasoning,
        savings,
        confidence: 0.87
      });
    } catch (error) {
      console.error('Error calculating recommendation:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const findOptimalPlan = (): PricingPlan => {
    // Simple recommendation logic based on user profile
    if (userProfile.role === 'school' || userProfile.budget === 'enterprise') {
      return allPlans.find(p => p.id === 'enterprise')!;
    }

    if (userProfile.role === 'teacher' || userProfile.usage === 'heavy' || userProfile.budget === 'high') {
      return allPlans.find(p => p.id === 'school')!;
    }

    if (userProfile.usage === 'moderate' || userProfile.budget === 'medium') {
      return allPlans.find(p => p.id === 'professional')!;
    }

    return allPlans.find(p => p.id === 'starter')!;
  };

  const generateReasoning = (plan: PricingPlan): string[] => {
    const reasoning: string[] = [];

    if (userProfile.role === 'student') {
      reasoning.push('Selected for individual student needs with essential AI agent access');
    } else if (userProfile.role === 'teacher') {
      reasoning.push('Chosen for educators who need comprehensive assessment and curriculum tools');
    } else if (userProfile.role === 'school') {
      reasoning.push('Recommended for institutions requiring multi-user access and advanced analytics');
    }

    if (userProfile.usage === 'heavy') {
      reasoning.push('Includes higher interaction limits suitable for intensive daily use');
    }

    if (userProfile.budget === 'low') {
      reasoning.push('Provides best value for budget-conscious users');
    }

    if (plan.popular) {
      reasoning.push('Most popular choice among users with similar profiles');
    }

    return reasoning;
  };

  const calculateSavings = (plan: PricingPlan) => {
    let savings = 0;
    let percentage = 0;
    let description = '';

    if (userProfile.duration === 'annual') {
      savings = plan.basePrice * 12 * 0.2; // 20% annual savings
      percentage = 20;
      description = 'Annual billing discount';
    } else if (userProfile.duration === 'lifetime') {
      savings = plan.basePrice * 24; // Assume 2 years of monthly payments
      percentage = 50;
      description = 'Lifetime access savings';
    }

    return { amount: savings, percentage, description };
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setUserProfile({
      role: 'student',
      usage: 'moderate',
      features: [],
      budget: 'medium',
      duration: 'monthly'
    });
    setRecommendation(null);
  };

  const currentQuestion = questions[currentStep - 1];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 mb-8"
      >
        <div className="flex items-center justify-center space-x-3">
          <FaCalculator className="text-4xl text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">Smart Pricing Wizard</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Our AI analyzes your needs to recommend the perfect plan with the best value.
          Answer a few questions and get a personalized recommendation.
        </p>
      </motion.div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex space-x-2">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index + 1 <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Questions */}
      <AnimatePresence mode="wait">
        {!recommendation && !isCalculating && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {currentQuestion.question}
            </h2>

            <div className="space-y-4">
              {currentQuestion.type === 'multiSelect' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {currentQuestion.options.map((option: any) => (
                    <label key={option.value} className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={userProfile.features.includes(option.value)}
                        onChange={(e) => {
                          const newFeatures = e.target.checked
                            ? [...userProfile.features, option.value]
                            : userProfile.features.filter(f => f !== option.value);
                          handleAnswer(3, newFeatures);
                        }}
                      />
                      <div className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        userProfile.features.includes(option.value)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="text-2xl mb-2">{option.icon}</div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuestion.options.map((option: any) => (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(currentQuestion.id, option.value)}
                      className="p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl">{option.icon}</div>
                        <div>
                          <div className="font-semibold text-gray-900">{option.label}</div>
                          {option.description && (
                            <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {currentQuestion.type === 'multiSelect' && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
                >
                  <span>Continue</span>
                  <FaArrowRight />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calculating State */}
      <AnimatePresence>
        {isCalculating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-lg shadow-lg p-8 text-center"
          >
            <div className="animate-spin text-6xl text-blue-600 mx-auto mb-4">🧠</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">AI is analyzing your needs...</h3>
            <p className="text-gray-600">Our intelligent pricing algorithm is calculating the perfect plan for you.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recommendation */}
      <AnimatePresence>
        {recommendation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Recommendation Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white text-center">
              <FaStar className="text-4xl mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">Your Perfect Plan</h2>
              <p className="text-xl opacity-90">Based on your needs, we recommend:</p>
            </div>

            {/* Plan Details */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">{recommendation.plan.name}</h3>
                  <p className="text-gray-600 mt-1">{recommendation.plan.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-blue-600">
                    ${recommendation.plan.basePrice}
                    <span className="text-lg text-gray-500">/{recommendation.plan.billingCycle}</span>
                  </div>
                  {recommendation.savings.amount > 0 && (
                    <div className="text-green-600 font-medium">
                      Save ${recommendation.savings.amount.toFixed(2)} ({recommendation.savings.percentage}%)
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Included Features:</h4>
                  <ul className="space-y-2">
                    {recommendation.plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <FaCheck className="text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">AI Agents:</h4>
                  <ul className="space-y-2">
                    {recommendation.plan.aiAgents.map((agent, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <FaRocket className="text-blue-500 flex-shrink-0" />
                        <span className="text-gray-700">{agent}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Reasoning */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Why this plan is perfect for you:</h4>
                <ul className="space-y-2">
                  {recommendation.reasoning.map((reason, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <FaLightbulb className="text-yellow-500 flex-shrink-0 mt-1" />
                      <span className="text-gray-700">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center">
                <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                  <FaRocket />
                  <span>Get Started Today</span>
                </button>
                <button className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200">
                  Compare All Plans
                </button>
                <button
                  onClick={resetWizard}
                  className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200"
                >
                  Retake Quiz
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartPricingWizard;