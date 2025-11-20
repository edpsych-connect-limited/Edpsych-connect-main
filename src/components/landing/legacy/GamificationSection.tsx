import React from 'react';

const GamificationSection: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-6">Gamified Learning Experience</h2>
        <p className="text-lg text-gray-600 mb-8">
          Motivate students with points, badges, leaderboards, and real-time feedback.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-indigo-50 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">Points & Rewards</h3>
            <p>Earn points for completing lessons and challenges.</p>
          </div>
          <div className="p-6 bg-indigo-50 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">Badges</h3>
            <p>Unlock achievements and showcase progress.</p>
          </div>
          <div className="p-6 bg-indigo-50 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">Leaderboards</h3>
            <p>Encourage healthy competition among peers.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GamificationSection;