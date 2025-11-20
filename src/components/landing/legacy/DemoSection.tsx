import React from 'react';
import Link from 'next/link';

const DemoSection: React.FC = () => {
  return (
    <section className="py-20 bg-gray-100 text-center">
      <h2 className="text-3xl font-bold mb-4">See EdPsych Connect in Action</h2>
      <p className="text-lg text-gray-600 mb-8">
        Experience how neuroscience-driven insights and gamification can transform learning.
      </p>
      <Link
        href="/book-demo"
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
      >
        Book a Demo
      </Link>
    </section>
  );
};

export default DemoSection;