import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaGraduationCap, FaGamepad, FaPlay, FaQuestionCircle, FaTrophy } from 'react-icons/fa';
import { BattleRoyaleGame } from './BattleRoyaleGame';

const BattleRoyalePreview: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const features = [
    {
      icon: <FaUsers className="text-2xl text-blue-600" />,
      title: 'Multiplayer Experience',
      description: 'Compete with peers in real-time educational challenges'
    },
    {
      icon: <FaGraduationCap className="text-2xl text-green-600" />,
      title: 'Educational Content',
      description: 'Curriculum-aligned challenges that reinforce learning'
    },
    {
      icon: <FaGamepad className="text-2xl text-purple-600" />,
      title: 'Interactive Gameplay',
      description: 'Engaging 3D environment with real-time interactions'
    },
    {
      icon: <FaTrophy className="text-2xl text-yellow-600" />,
      title: 'Skill-Based Progression',
      description: 'Level up based on academic performance and problem-solving'
    }
  ];

  if (isPlaying) {
    return (
      <div className="relative">
        <BattleRoyaleGame />
        <button 
          onClick={() => setIsPlaying(false)}
          className="absolute top-4 right-4 z-50 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg"
        >
          Exit Game
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
      {/* Header with Game Preview */}
      <div className="relative h-80 bg-gradient-to-r from-blue-900 to-purple-900">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="relative flex items-center justify-center h-full">
          <div className="text-center text-white">
            <h3 className="text-3xl font-bold mb-4">Battle Royale Learning</h3>
            <p className="text-xl mb-6">Educational gaming meets competitive learning</p>
            <button 
              onClick={() => setIsPlaying(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center mx-auto shadow-lg hover:scale-105 transform duration-200"
            >
              <FaPlay className="mr-2" />
              Launch Demo Game
            </button>
          </div>
        </div>
        
        {/* Visual Game Elements Overlay */}
        <div className="absolute top-10 left-10 w-16 h-16 bg-blue-500 opacity-70 rounded-lg transform rotate-12 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-green-500 opacity-60 rounded-full animate-bounce"></div>
        <div className="absolute top-20 right-40 w-12 h-12 bg-yellow-500 opacity-50 rounded-lg transform -rotate-12 animate-pulse"></div>
      </div>
      
      {/* Game Info */}
      <div className="p-8">
        <div className="mb-8">
          <h4 className="text-2xl font-bold text-gray-800 mb-4">Educational Game Features</h4>
          <p className="text-gray-600">
            Our Battle Royale learning environment transforms education into an engaging multiplayer experience. 
            Students compete by solving educational challenges while navigating a dynamic 3D world powered by Three.js.
          </p>
        </div>
        
        {/* Game Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 p-4 rounded-lg"
            >
              <div className="mb-3">{feature.icon}</div>
              <h5 className="font-semibold text-gray-800 mb-2">{feature.title}</h5>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
        
        {/* Game Stats */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-xl font-semibold text-gray-800 mb-4">Game Performance Metrics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Concurrent Players', value: '500+' },
              { label: 'Educational Challenges', value: '1,000+' },
              { label: 'Knowledge Domains', value: '12' },
              { label: 'Learning Effectiveness', value: '92%' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="mt-8 flex justify-center">
          <button 
            onClick={() => setIsPlaying(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors mr-4 shadow-md hover:shadow-lg"
          >
            Try Battle Royale
          </button>
          <button className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center">
            <FaQuestionCircle className="mr-2" />
            How It Works
          </button>
        </div>
      </div>
    </div>
  );
};

export default BattleRoyalePreview;