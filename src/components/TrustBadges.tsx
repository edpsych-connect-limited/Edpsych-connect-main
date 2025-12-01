/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';
import { FaShieldAlt, FaLock, FaCheckCircle, FaUserShield } from 'react-icons/fa';

interface TrustBadgeProps {
  variant?: 'compact' | 'full' | 'minimal';
  showLabels?: boolean;
  className?: string;
}

const TrustBadges: React.FC<TrustBadgeProps> = ({
  variant = 'compact',
  showLabels = true,
  className = ''
}) => {
  const badges = [
    {
      icon: <FaLock className="text-blue-600" />,
      label: 'AES-256-GCM Encrypted',
      description: 'Bank-level encryption for all data'
    },
    {
      icon: <FaShieldAlt className="text-green-600" />,
      label: 'GDPR Compliant',
      description: 'European data protection standards'
    },
    {
      icon: <FaCheckCircle className="text-purple-600" />,
      label: 'SOC 2 Certified',
      description: 'Security & compliance framework'
    },
    {
      icon: <FaUserShield className="text-red-600" />,
      label: 'FERPA/COPPA Ready',
      description: 'Educational privacy standards'
    }
  ];

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center space-x-4 ${className}`}>
        {badges.map((badge, index) => (
          <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
            {badge.icon}
            <span className="font-medium">{badge.label}</span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-4 ${className}`}>
        {badges.map((badge, index) => (
          <div key={index} className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-lg">{badge.icon}</div>
            {showLabels && (
              <div className="text-sm">
                <div className="font-semibold text-gray-900">{badge.label}</div>
                <div className="text-gray-600">{badge.description}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Full variant
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {badges.map((badge, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center space-x-3 mb-3">
            <div className="text-2xl">{badge.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900">{badge.label}</h3>
          </div>
          <p className="text-gray-600 text-sm">{badge.description}</p>
          <div className="mt-3 flex items-center text-green-600 text-sm font-medium">
            <FaCheckCircle className="mr-2" />
            Verified & Compliant
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrustBadges;
