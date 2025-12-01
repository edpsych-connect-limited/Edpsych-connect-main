'use client'

/**
 * Privacy Policy Client Component for EdPsych Connect World
 * Interactive privacy policy with cookie settings integration
 */

import React from 'react';

export default function PrivacyPolicyClient() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                EdPsych Connect World (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy and ensuring
                transparency in how we collect, use, and safeguard your personal information. This Privacy Policy
                explains our practices regarding data collection and usage for our intelligent educational psychology platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Information We Collect
              </h2>

              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                Personal Information
              </h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                <li>Name and contact information (email, phone number)</li>
                <li>Educational institution details</li>
                <li>Professional credentials and qualifications</li>
                <li>Account credentials and preferences</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                Usage Data
              </h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                <li>Platform interaction and usage patterns</li>
                <li>Assessment results and progress data</li>
                <li>Learning insights and recommendations</li>
                <li>Technical data (IP address, browser type, device information)</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                Educational Data
              </h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                <li>Pupil assessment data (with explicit consent)</li>
                <li>Learning analytics and progress tracking</li>
                <li>Educational content interaction data</li>
                <li>Research participation data (voluntary)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                3. How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                <li>Provide and maintain our educational psychology platform</li>
                <li>Generate intelligent insights and recommendations</li>
                <li>Improve platform functionality and user experience</li>
                <li>Conduct research to advance educational psychology (with consent)</li>
                <li>Ensure platform security and prevent fraud</li>
                <li>Comply with legal obligations and regulatory requirements</li>
                <li>Communicate platform updates and educational resources</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                4. Data Sharing and Third Parties
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We do not sell your personal information. We may share data only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                <li>With your explicit consent</li>
                <li>With educational institutions (as authorised)</li>
                <li>With service providers who assist our operations (under strict NDA)</li>
                <li>When required by law or to protect safety</li>
                <li>In aggregated, anonymised form for research purposes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Data Security
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                We implement industry-standard security measures including encryption, secure access controls,
                regular security audits, and compliance with educational data protection standards.
                All data is encrypted in transit and at rest.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Your Rights (GDPR Compliance)
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Under GDPR, you have the following rights:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
                <li><strong>Access:</strong> Request information about your data</li>
                <li><strong>Rectification:</strong> Correct inaccurate data</li>
                <li><strong>Erasure:</strong> Request deletion of your data</li>
                <li><strong>Portability:</strong> Receive your data in a structured format</li>
                <li><strong>Restriction:</strong> Limit how we process your data</li>
                <li><strong>Objection:</strong> Object to processing for certain purposes</li>
                <li><strong>Withdraw Consent:</strong> Revoke consent at any time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Cookies and Tracking
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We use cookies and similar technologies to enhance your experience. You can manage your
                cookie preferences through our cookie settings. Essential cookies are required for
                platform functionality.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                For detailed information about our cookie usage, please visit our{' '}
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      const event = new CustomEvent('openCookieSettings');
                      window.dispatchEvent(event);
                    }
                  }}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline font-medium"
                >
                  Cookie Settings
                </button>
                .
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                8. Data Retention
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                We retain personal data only as long as necessary for the purposes outlined in this policy
                or as required by law. Educational data may be retained longer for research purposes with
                appropriate anonymisation and consent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                9. International Data Transfers
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Your data may be transferred to and processed in countries other than your own.
                We ensure appropriate safeguards are in place to protect your data during international transfers,
                in compliance with GDPR requirements.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                10. Contact Information
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                For privacy-related enquiries or to exercise your rights, please contact:
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Data Protection Officer</strong><br />
                  EdPsych Connect World<br />
                  Email: privacy@edpsychconnect.app<br />
                  Phone: +44 (0) 20 1234 5678
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                11. Updates to This Policy
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                We may update this Privacy Policy periodically. We will notify users of material changes
                via email or platform notification. Your continued use of the platform constitutes
                acceptance of the updated policy.
              </p>
            </section>
          </div>

          {/* Cookie Settings Link */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Cookie Settings
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your cookie preferences and consent settings
                </p>
              </div>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    const event = new CustomEvent('openCookieSettings');
                    window.dispatchEvent(event);
                  }
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-md transition-colors duration-200"
              >
                Manage Cookies
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
