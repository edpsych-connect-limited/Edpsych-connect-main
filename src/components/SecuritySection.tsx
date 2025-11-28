import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaLock, FaEye, FaCheckCircle, FaDatabase, FaUserShield } from 'react-icons/fa';
import TrustBadges from './TrustBadges';

const SecuritySection: React.FC = () => {
  const securityFeatures = [
    {
      icon: <FaLock className="text-3xl text-blue-600" />,
      title: 'AES-256-GCM Encryption',
      description: 'Military-grade encryption identical to banking standards protects all student data, assessments, and personal information.'
    },
    {
      icon: <FaShieldAlt className="text-3xl text-green-600" />,
      title: 'Zero-Trust Security',
      description: 'Every data access request is verified and authenticated. No implicit trust - everything is encrypted and validated.'
    },
    {
      icon: <FaEye className="text-3xl text-purple-600" />,
      title: 'Complete Transparency',
      description: 'Full visibility into data usage, encryption status, and security measures with comprehensive audit trails.'
    },
    {
      icon: <FaCheckCircle className="text-3xl text-red-600" />,
      title: 'Regulatory Compliance',
      description: 'Pre-built compliance with GDPR, FERPA, COPPA, and UK Data Protection Act requirements.'
    },
    {
      icon: <FaDatabase className="text-3xl text-indigo-600" />,
      title: 'Secure Multi-Database',
      description: 'Specialized databases for different data types with encryption at rest and in transit.'
    },
    {
      icon: <FaUserShield className="text-3xl text-teal-600" />,
      title: 'Educational Privacy',
      description: 'Designed specifically for educational institutions with child protection and safeguarding measures.'
    }
  ];

  const complianceStats = [
    { label: 'GDPR Compliant', value: '100%' },
    { label: 'Data Breach Protection', value: 'AES-256' },
    { label: 'Security Audits', value: 'Quarterly' },
    { label: 'Uptime SLA', value: '99.9%' }
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1"
          >
            <div className="bg-white bg-opacity-10 p-8 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                {[
                  "AES-256-GCM Encryption",
                  "GDPR Compliant",
                  "SOC 2 Certified",
                  "ISO 27001 Ready",
                  "Zero-Trust Security",
                  "Data Breach Protection",
                  "UK Data Protection Act",
                  "FERPA Compliant",
                  "COPPA Compliant",
                  "Ethical AI Framework",
                  "Bias Detection",
                  "Transparent AI"
                ].map((certification, index) => (
                  <div
                    key={index}
                    className="bg-white bg-opacity-10 p-3 rounded text-center hover:bg-opacity-20 transition-colors text-sm"
                  >
                    {certification}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2"
          >
            <h2 className="text-4xl font-bold mb-6">Bank-Level Security & Compliance</h2>
            <p className="text-xl mb-8">
              Your students&apos; data is protected with military-grade AES-256-GCM encryption. Meet all regulatory requirements with our comprehensive compliance framework designed specifically for educational institutions.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-full">
                  <FaShieldAlt className="text-white" />
                </div>
                <span>AES-256-GCM encryption for all student data</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-full">
                  <FaShieldAlt className="text-white" />
                </div>
                <span>GDPR, FERPA, and COPPA compliant</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-full">
                  <FaShieldAlt className="text-white" />
                </div>
                <span>Zero-trust security architecture</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-full">
                  <FaShieldAlt className="text-white" />
                </div>
                <span>Data breach protection & ethical AI</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Security Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20"
        >
          <h3 className="text-3xl font-bold text-center mb-12">Comprehensive Security Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white bg-opacity-10 p-6 rounded-lg hover:bg-opacity-20 transition-all"
              >
                <div className="mb-4">{feature.icon}</div>
                <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                <p className="text-white text-opacity-90">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Compliance Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 bg-white bg-opacity-10 p-8 rounded-lg"
        >
          <h3 className="text-2xl font-bold text-center mb-8">Security & Compliance Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {complianceStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-white text-opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16"
        >
          <TrustBadges variant="compact" className="justify-center" />
        </motion.div>
      </div>
    </section>
  );
};

export default SecuritySection;