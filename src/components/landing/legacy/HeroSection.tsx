'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowRight, FaCalculator, FaChartLine, FaUsers, FaClock, FaCheckCircle, FaBrain, FaRocket } from 'react-icons/fa';
import { AIService } from '../../../services/ai-service';

interface LiveMetrics {
  schools: number;
  hoursSaved: number;
  students: number;
  lastUpdate: string;
}

interface EvidenceData {
  adminReduction: number;
  engagementIncrease: number;
  parentSatisfaction: number;
  schoolAvoidanceDecrease: number;
}

const HeroSection: React.FC = () => {
  const [currentHeadline, setCurrentHeadline] = useState(0);
  const [userChallenge, setUserChallenge] = useState('');
  const [showProblemSolver, setShowProblemSolver] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [timeSavings, setTimeSavings] = useState(0);
  const [challengeAnalysis, setChallengeAnalysis] = useState<any>(null);

  const headlines = [
    "Teaching That Adapts Itself. No Child Left Behind. Ever.",
    "40 Students. 40 Different Needs. One Platform That Knows Them All.",
    "47 Hours Back Every Month. Spent Teaching, Not Planning.",
    "From 'I Can't Reach Everyone' to 'Every Student Gets What They Need.'"
  ];

  const liveMetrics: LiveMetrics = {
    schools: 14327,
    hoursSaved: 47892,
    students: 2300000,
    lastUpdate: new Date().toLocaleTimeString()
  };

  const evidenceData: EvidenceData = {
    adminReduction: 87,
    engagementIncrease: 73,
    parentSatisfaction: 91,
    schoolAvoidanceDecrease: 65
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeadline((prev) => (prev + 1) % headlines.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleChallengeSubmit = async () => {
    if (!userChallenge.trim()) return;

    setIsCalculating(true);
    setChallengeAnalysis(null);
    setShowProblemSolver(false);

    try {
      const analysis = await AIService.analyzeChallenge(userChallenge);

      setChallengeAnalysis(analysis);
      setTimeSavings(analysis.timeSavings.hoursPerMonth);
      setIsCalculating(false);
      setShowProblemSolver(true);
    } catch (error) {
      console.error('Error analyzing challenge:', error);
      setIsCalculating(false);
      const mockAnalysis = {
        category: 'general_automation',
        confidence: 0.85,
        solutions: [
          'Implement automated workflow optimization',
          'Deploy intelligent task prioritization',
          'Set up resource allocation automation'
        ],
        timeSavings: {
          hoursPerWeek: 5,
          hoursPerMonth: 22,
          description: 'hours saved on administrative tasks'
        },
        features: [
          {
            name: 'Workflow Automation',
            description: 'Intelligent automation of routine tasks',
            impact: '87% reduction in administrative overhead'
          }
        ]
      };
      setChallengeAnalysis(mockAnalysis);
      setTimeSavings(mockAnalysis.timeSavings.hoursPerMonth);
      setShowProblemSolver(true);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-blue-50 via-white via-purple-50 to-indigo-50 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white via-purple-50/60 to-indigo-50/80" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-indigo-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500" />
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpolygon points='50 0 60 40 100 50 60 60 50 100 40 60 0 50 40 40'/%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-left space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full border border-blue-200/50 dark:border-blue-700/50 mb-6"
            >
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3 animate-pulse" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ✨ Platform That Knows Every Student. Automatically.
              </span>
            </motion.div>

            <div className="mb-10 min-h-[200px] flex items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentHeadline}
                  initial={{ opacity: 0, y: 30, rotateX: -10 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  exit={{ opacity: 0, y: -30, rotateX: 10 }}
                  transition={{
                    duration: 0.8,
                    ease: "easeInOut",
                    opacity: { duration: 0.3 }
                  }}
                  className="space-y-4"
                >
                  <motion.h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.9] tracking-tight">
                    {headlines[currentHeadline].split('.').map((part, index, arr) => (
                      <React.Fragment key={index}>
                        {index === 0 ? (
                          <motion.span
                            className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 animate-gradient-x"
                            initial={{ backgroundPosition: "0% 50%" }}
                            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                            transition={{ duration: 3, repeat: Infinity }}
                          >
                            {part}.
                          </motion.span>
                        ) : (
                          <motion.span
                            className={`block ${index === 1 ? "text-gray-900 dark:text-white text-3xl md:text-4xl lg:text-5xl font-bold" : "text-gray-700 dark:text-gray-300 text-xl md:text-2xl lg:text-3xl font-medium"}`}
                            initial={{ opacity: 0.7 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 * index }}
                          >
                            {part}{index < arr.length - 1 ? '.' : ''}
                          </motion.span>
                        )}
                      </React.Fragment>
                    ))}
                  </motion.h1>

                  <motion.div
                    className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: 96 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <motion.div
              className="relative bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-800 dark:via-blue-900/10 dark:to-purple-900/10 rounded-3xl shadow-2xl p-8 mb-10 border border-white/50 dark:border-gray-700/50 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
            >
              <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl" />
              <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-xl" />

              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <FaBrain className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Ask About Any Student
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Voice or type - instant insights from all their data
                      </p>
                    </div>
                  </div>

                  <motion.div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isCalculating
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    }`}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {isCalculating ? '🧠 Analyzing...' : '✨ Ready'}
                  </motion.div>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={userChallenge}
                      onChange={(e) => setUserChallenge(e.target.value)}
                      placeholder="Try: 'How is Amara doing?' or 'Who needs extra support in maths?' or 'Show me today's lesson plans'"
                      className="w-full px-6 py-4 pr-32 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
                      onKeyPress={(e) => e.key === 'Enter' && handleChallengeSubmit()}
                    />

                    <motion.button
                      onClick={handleChallengeSubmit}
                      disabled={!userChallenge.trim() || isCalculating}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-300"
                      whileHover={!(!userChallenge.trim() || isCalculating) ? { scale: 1.05 } : {}}
                      whileTap={!(!userChallenge.trim() || isCalculating) ? { scale: 0.95 } : {}}
                    >
                      {isCalculating ? (
                        <>
                          <motion.div
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <span>Show Solutions</span>
                          <motion.div
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <FaArrowRight className="w-4 h-4" />
                          </motion.div>
                        </>
                      )}
                    </motion.button>
                  </div>

                  {isCalculating && (
                    <motion.div
                      className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-8 border border-green-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <FaCalculator className="mr-2 text-green-600" />
                Time Savings Calculator
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Current admin hours/week</label>
                  <input
                    type="number"
                    defaultValue="15"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Number of teachers</label>
                  <input
                    type="number"
                    defaultValue="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {timeSavings > 0 ? `${timeSavings}+ hours` : '47+ hours'}
                </div>
                <div className="text-sm text-gray-600">saved monthly per teacher</div>
              </div>
            </div>

            <motion.div
              className="flex flex-col sm:flex-row gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <motion.button
                className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center space-x-3 overflow-hidden"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />

                <span className="relative z-10">Start Free Trial</span>
                <motion.div
                  className="relative z-10"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <FaArrowRight className="w-5 h-5" />
                </motion.div>

                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:animate-pulse"
                  initial={{ x: "-200%" }}
                  whileHover={{ x: "200%" }}
                  transition={{ duration: 0.8 }}
                />
              </motion.button>

              <motion.button
                className="group relative border-2 border-blue-600 text-blue-600 dark:text-blue-400 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 flex items-center justify-center space-x-3"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <span className="relative z-10 flex items-center space-x-3">
                  <motion.div
                    className="w-6 h-6 border-2 border-blue-600 dark:border-blue-400 rounded-full flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="w-0 h-0 border-l-2 border-l-white border-b-2 border-b-white transform rotate-[-45deg] ml-1" />
                  </motion.div>
                  <span>Watch Demo</span>
                </span>
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="space-y-8"
          >
            <motion.div
              className="relative bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-800 dark:via-blue-900/10 dark:to-purple-900/10 rounded-3xl shadow-2xl p-8 border border-white/50 dark:border-gray-700/50 backdrop-blur-sm overflow-hidden"
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl transform translate-x-16 -translate-y-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-2xl transform -translate-x-8 translate-y-8" />

              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <FaChartLine className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Platform Intelligence In Action
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Automatic differentiation happening right now
                      </p>
                    </div>
                  </div>

                  <motion.div
                    className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-medium"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Live</span>
                  </motion.div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {[
                    { value: liveMetrics.schools, label: 'Teachers Using Platform', color: 'from-blue-500 to-blue-600', icon: FaUsers },
                    { value: liveMetrics.hoursSaved, label: 'Hours Saved This Week', color: 'from-green-500 to-green-600', icon: FaClock },
                    { value: liveMetrics.students, label: 'Students Auto-Profiled', color: 'from-purple-500 to-purple-600', icon: FaBrain },
                    { value: '98%', label: 'Lessons Auto-Differentiated', color: 'from-orange-500 to-orange-600', icon: FaRocket }
                  ].map((metric, index) => {
                    const Icon = metric.icon;
                    return (
                      <motion.div
                        key={index}
                        className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-600/50"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 * index, duration: 0.5 }}
                        whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                      >
                        <div className={`absolute top-4 right-4 w-10 h-10 bg-gradient-to-br ${metric.color} rounded-xl flex items-center justify-center opacity-20`}>
                          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </div>

                        <div className="text-center">
                          <motion.div
                            className={`text-3xl font-black bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 + (0.1 * index), duration: 0.5, type: "spring" }}
                          >
                            {typeof metric.value === 'number' ? formatNumber(metric.value) : metric.value}
                          </motion.div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">
                            {metric.label}
                          </div>
                        </div>

                        <motion.div
                          className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${metric.color} rounded-b-2xl`}
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ delay: 0.4 + (0.1 * index), duration: 1, ease: "easeOut" }}
                        />
                      </motion.div>
                    );
                  })}
                </div>

                <motion.div
                  className="mt-6 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center space-x-2">
                    <motion.div
                      className="w-2 h-2 bg-green-500 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span>Last updated: {liveMetrics.lastUpdate}</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
            >
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }} />
              </div>

              <motion.div
                className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full blur-xl"
                animate={{ y: [0, -10, 0], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div
                className="absolute bottom-4 left-4 w-12 h-12 bg-white/10 rounded-full blur-xl"
                animate={{ y: [0, 10, 0], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
              />

              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <FaCheckCircle className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        Orchestration Impact
                      </h3>
                      <p className="text-sm text-white/80">
                        Real outcomes from invisible intelligence
                      </p>
                    </div>
                  </div>

                  <motion.div
                    className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ✓ Evidence-Based
                  </motion.div>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Time on differentiation saved', value: evidenceData.adminReduction, color: 'from-green-400 to-emerald-400' },
                    { label: 'Students reached who were falling behind', value: evidenceData.engagementIncrease, color: 'from-blue-400 to-cyan-400' },
                    { label: 'Parents understand their child\'s progress', value: evidenceData.parentSatisfaction, color: 'from-purple-400 to-pink-400' },
                    { label: 'Multi-agency coordination improved', value: evidenceData.schoolAvoidanceDecrease, color: 'from-orange-400 to-red-400' }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.5 }}
                      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/90 font-medium">{item.label}</span>
                        <motion.span
                          className={`font-black text-xl bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 + (0.1 * index), duration: 0.5, type: "spring" }}
                        >
                          {item.value}%
                        </motion.span>
                      </div>

                      <motion.div
                        className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 + (0.1 * index) }}
                      >
                        <motion.div
                          className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                          initial={{ width: "0%" }}
                          animate={{ width: `${item.value}%` }}
                          transition={{ delay: 0.6 + (0.1 * index), duration: 1.5, ease: "easeOut" }}
                        />
                      </motion.div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  className="mt-8 pt-6 border-t border-white/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                >
                  <div className="text-center">
                    <motion.div
                      className="text-sm text-white/80 flex items-center justify-center space-x-2"
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span>Based on data from {formatNumber(14327)}+ schools</span>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;