/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';
import Link from 'next/link';

const CtaSection: React.FC = () => {
  return (
    <section className="py-20 bg-indigo-600 text-white text-center">
      <h2 className="text-3xl font-bold mb-4">Get 47+ Hours Back Every Month</h2>
      <p className="text-lg mb-8">
        No more Sunday evenings planning 40 different lessons. No more wondering who's falling behind.
        The platform that knows every student and adapts teaching automatically.
      </p>
      <Link
        href="/book-demo"
        className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg shadow hover:bg-gray-100 transition"
      >
        See How It Works
      </Link>
    </section>
  );
};

export default CtaSection;