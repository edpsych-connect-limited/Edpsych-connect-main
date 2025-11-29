/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';

const FeaturesSection: React.FC = () => {
  const features = [
    { title: 'Automatic Student Profiling', description: 'Every assessment, lesson, intervention automatically builds each student\'s profile. Zero manual data entry.' },
    { title: 'Instant Differentiation for 40 Students', description: 'One lesson plan. Platform automatically adapts it for every student\'s level, learning style, and pace.' },
    { title: 'Voice-Powered Teacher Dashboard', description: 'Ask "How is Amara doing?" Get instant insights from all her data. Speak or type - your choice.' },
    { title: 'Seamless Multi-Agency Collaboration', description: 'Teachers, EPs, parents, head teachers see exactly what they need. Parents only see their child. Everyone stays connected.' },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">How The Platform Orchestrates Everything</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((f, idx) => (
            <div key={idx} className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;