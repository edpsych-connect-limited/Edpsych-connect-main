'use client';

import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link href="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
          </div>
          <p className="text-slate-600 mt-2">Last updated: November 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="prose prose-slate max-w-none">
            <h2>1. Introduction</h2>
            <p>
              EdPsych Connect Limited ("we", "our", "us") is committed to protecting the privacy and security of your personal information.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our educational psychology platform.
            </p>
            <p>
              As a provider of services to educational institutions and professionals in the UK, we adhere to the highest standards of data protection,
              including compliance with the UK General Data Protection Regulation (UK GDPR), the Data Protection Act 2018, and relevant education sector guidance.
            </p>

            <h2>2. Information We Collect</h2>

            <h3>2.1 Information You Provide Directly</h3>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, organisation, role, and professional credentials</li>
              <li><strong>Assessment Data:</strong> ECCA assessment responses, observations, and results for students/clients</li>
              <li><strong>EHCP Information:</strong> Education Health and Care Plan content, amendments, and reviews</li>
              <li><strong>Case Management Data:</strong> Student information, intervention plans, progress notes</li>
              <li><strong>Training Records:</strong> Course enrollments, completion data, CPD hours, certificates</li>
              <li><strong>Payment Information:</strong> Billing address and payment details (processed securely through Stripe)</li>
            </ul>

            <h3>2.2 Information Collected Automatically</h3>
            <ul>
              <li><strong>Usage Data:</strong> Features accessed, time spent, actions taken within the platform</li>
              <li><strong>Technical Data:</strong> IP address, browser type, device information, operating system</li>
              <li><strong>Analytics Data:</strong> Platform usage patterns, feature engagement, performance metrics</li>
            </ul>

            <h2>3. How We Use Your Information</h2>

            <h3>3.1 Primary Purposes</h3>
            <ul>
              <li>Providing and improving our educational psychology services</li>
              <li>Conducting ECCA cognitive assessments and generating professional reports</li>
              <li>Managing EHCP workflows, tracking amendments and reviews</li>
              <li>Delivering training courses and tracking CPD hours</li>
              <li>Facilitating intervention planning and progress monitoring</li>
              <li>Processing payments and managing subscriptions</li>
              <li>Providing customer support and responding to inquiries</li>
            </ul>

            <h3>3.2 Legal Basis for Processing (UK GDPR)</h3>
            <ul>
              <li><strong>Contract Performance:</strong> Processing necessary to provide our services</li>
              <li><strong>Legal Obligation:</strong> Compliance with UK education and data protection laws</li>
              <li><strong>Legitimate Interests:</strong> Platform improvement, security, fraud prevention</li>
              <li><strong>Consent:</strong> Marketing communications and optional features (where required)</li>
            </ul>

            <h2>4. Special Category Data (Sensitive Personal Information)</h2>
            <p>
              We process special category data, including information about children's health, special educational needs, and disabilities.
              This processing is necessary for:
            </p>
            <ul>
              <li>Provision of health or social care services (GDPR Article 9(2)(h))</li>
              <li>Purposes of safeguarding (DPA 2018 Schedule 1, Part 2)</li>
              <li>Compliance with legal obligations in the education sector</li>
            </ul>
            <p>
              We implement appropriate safeguards including encryption, access controls, and staff training to protect this sensitive information.
            </p>

            <h2>5. Data Sharing and Disclosure</h2>

            <h3>5.1 Within Your Organisation</h3>
            <p>
              For institutional subscriptions, data is shared with authorised users within your local authority or school as configured by your administrator.
            </p>

            <h3>5.2 Third-Party Service Providers</h3>
            <ul>
              <li><strong>Hosting:</strong> Vercel (United States) - covered by UK adequacy regulations</li>
              <li><strong>Database:</strong> Neon (PostgreSQL) - EU/UK data centres</li>
              <li><strong>Payment Processing:</strong> Stripe - PCI DSS compliant</li>
              <li><strong>AI Services:</strong> Anthropic Claude - for assessment interpretation and support</li>
              <li><strong>Email Services:</strong> For notifications and communications</li>
            </ul>
            <p>
              All third-party processors are bound by data processing agreements ensuring UK GDPR compliance.
            </p>

            <h3>5.3 Legal Requirements</h3>
            <p>
              We may disclose information when required by law, court order, or to protect the rights, safety, and security of individuals, particularly in safeguarding contexts.
            </p>

            <h2>6. Data Retention</h2>
            <ul>
              <li><strong>Assessment Records:</strong> Retained for 7 years after last access (aligned with professional guidelines)</li>
              <li><strong>EHCP Documents:</strong> Retained as per local authority retention schedules</li>
              <li><strong>Training Records:</strong> Retained for 7 years for CPD verification purposes</li>
              <li><strong>Account Data:</strong> Retained for duration of active subscription plus 2 years</li>
              <li><strong>Marketing Data:</strong> Until consent is withdrawn or 3 years of inactivity</li>
            </ul>

            <h2>7. Your Rights Under UK GDPR</h2>
            <p>You have the following rights:</p>
            <ul>
              <li><strong>Right to Access:</strong> Request copies of your personal data</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Right to Erasure:</strong> Request deletion (subject to legal retention requirements)</li>
              <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
              <li><strong>Right to Data Portability:</strong> Receive data in a structured format</li>
              <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
              <li><strong>Rights Related to Automated Decision-Making:</strong> Challenge AI-assisted assessments</li>
            </ul>
            <p>
              To exercise these rights, contact us at <a href="mailto:privacy@edpsychconnect.com">privacy@edpsychconnect.com</a>
            </p>

            <h2>8. Security Measures</h2>
            <ul>
              <li>End-to-end encryption for data in transit (TLS 1.3)</li>
              <li>Encryption at rest for all database storage</li>
              <li>Multi-factor authentication options</li>
              <li>Regular security audits and penetration testing</li>
              <li>Staff training on data protection and confidentiality</li>
              <li>Role-based access controls</li>
              <li>Audit logging of all data access</li>
            </ul>

            <h2>9. Children's Privacy</h2>
            <p>
              Our platform is designed for use by educational professionals, not directly by children under 13.
              When professionals use our platform to assess or support children, they must obtain appropriate consent from parents/guardians
              and comply with relevant safeguarding policies.
            </p>

            <h2>10. International Data Transfers</h2>
            <p>
              Some of our service providers are located outside the UK/EEA. Where this occurs, we ensure appropriate safeguards are in place,
              including Standard Contractual Clauses and adequacy decisions. Your data is primarily stored in UK/EU data centres.
            </p>

            <h2>11. Cookies and Tracking Technologies</h2>
            <p>
              We use essential cookies for platform functionality and optional cookies for analytics. You can manage cookie preferences through
              your browser settings. For detailed information, see our Cookie Policy.
            </p>

            <h2>12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. Significant changes will be communicated via email and platform notifications.
              Continued use after changes indicates acceptance of the updated policy.
            </p>

            <h2>13. Contact Us</h2>
            <p>For privacy-related questions or to exercise your rights:</p>
            <ul>
              <li><strong>Email:</strong> privacy@edpsychconnect.com</li>
              <li><strong>Data Protection Officer:</strong> Dr Scott Ighavongbe-Patrick</li>
              <li><strong>Address:</strong> EdPsych Connect Limited, 38 Buckingham View, Chesham, Buckinghamshire, HP5 3HA</li>
              <li><strong>Company Number:</strong> 14989115 (Registered in England and Wales)</li>
            </ul>

            <h2>14. Regulatory Authority</h2>
            <p>
              You have the right to lodge a complaint with the Information Commissioner's Office (ICO), the UK's supervisory authority for data protection:
            </p>
            <ul>
              <li><strong>Website:</strong> <a href="https://ico.org.uk" target="_blank" rel="noopener">ico.org.uk</a></li>
              <li><strong>Helpline:</strong> 0303 123 1113</li>
            </ul>

            <div className="mt-12 p-6 bg-indigo-50 rounded-xl border-2 border-indigo-200">
              <p className="text-sm text-slate-700">
                <strong>Professional Standards:</strong> As HCPC registered professionals, we adhere to the Standards of Conduct, Performance and Ethics,
                including specific requirements around confidentiality and information governance. All data handling complies with BPS Code of Ethics and Conduct.
              </p>
            </div>
          </div>
        </div>

        {/* Related Links */}
        <div className="mt-8 flex justify-center gap-6 text-sm">
          <Link href="/terms" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Terms of Service →
          </Link>
          <Link href="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Back to Home →
          </Link>
        </div>
      </div>
    </div>
  );
}
