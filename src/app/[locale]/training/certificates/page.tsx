import { logger } from "@/lib/logger";
'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  issueDate: Date;
  completionDate: Date;
  cpdHours: number;
  verificationCode: string;
  instructor: string;
  grade?: string;
  skills: string[];
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/training/certificates`);
      if (!response.ok) {
        throw new Error('Failed to fetch certificates');
      }

      const certificatesData = await response.json();
      setCertificates(certificatesData);
    } catch (error) {
      console.error('Error loading certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = (certificate: Certificate) => {
    logger.debug('Downloading PDF for certificate:', certificate.id);
    const message = 'PDF generation functionality would be implemented here';
    if (typeof window !== 'undefined') {
      const alertDiv = document.createElement('div');
      alertDiv.setAttribute('role', 'alert');
      alertDiv.setAttribute('aria-live', 'assertive');
      alertDiv.className = 'fixed top-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      alertDiv.textContent = message;
      document.body.appendChild(alertDiv);
      setTimeout(() => document.body.removeChild(alertDiv), 3000);
    }
  };

  const handlePrint = (certificate: Certificate) => {
    logger.debug('Printing certificate:', certificate.id);
    window.print();
  };

  const handleShare = (certificate: Certificate) => {
    const shareUrl = `${window.location.origin}/verify/${certificate.verificationCode}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Certificate: ${certificate.courseTitle}`,
        text: `I've completed ${certificate.courseTitle} and earned ${certificate.cpdHours} CPD hours!`,
        url: shareUrl
      }).catch((error) => logger.debug('Error sharing', error));
    } else {
      navigator.clipboard.writeText(shareUrl);
      const message = 'Verification link copied to clipboard!';
      if (typeof window !== 'undefined') {
        const alertDiv = document.createElement('div');
        alertDiv.setAttribute('role', 'alert');
        alertDiv.setAttribute('aria-live', 'assertive');
        alertDiv.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);
        setTimeout(() => document.body.removeChild(alertDiv), 3000);
      }
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const totalCpdHours = certificates.reduce((acc, cert) => acc + cert.cpdHours, 0);

  if (loading) {
    return (
      <div className="flex justify-centre items-centre min-h-screen" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="sr-only">Loading certificates...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Certificates</h1>
          <p className="text-lg text-gray-600">
            View and download your professional development certificates
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
            <div className="flex items-centre justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Total Certificates</h3>
              <span className="text-3xl">🎓</span>
            </div>
            <p className="text-4xl font-bold">{certificates.length}</p>
            <p className="text-sm opacity-90 mt-1">Courses completed</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
            <div className="flex items-centre justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">CPD Hours Earned</h3>
              <span className="text-3xl">⏱️</span>
            </div>
            <p className="text-4xl font-bold">{totalCpdHours}</p>
            <p className="text-sm opacity-90 mt-1">Professional development hours</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
            <div className="flex items-centre justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Latest Certificate</h3>
              <span className="text-3xl">🏆</span>
            </div>
            <p className="text-lg font-bold line-clamp-2">
              {certificates.length > 0 ? certificates[0].courseTitle : 'None yet'}
            </p>
            <p className="text-sm opacity-90 mt-1">
              {certificates.length > 0 ? formatDate(certificates[0].issueDate) : 'Complete a course'}
            </p>
          </div>
        </div>

        {certificates.length > 0 ? (
          <div className="space-y-6">
            {certificates.map((certificate) => (
              <div key={certificate.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/3 bg-gradient-to-br from-blue-50 to-blue-100 p-8 flex items-centre justify-centre">
                    <div className="text-centre">
                      <div className="text-6xl mb-4">🎓</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Certificate of Completion</h3>
                      <p className="text-sm text-gray-600">EdPsych Connect</p>
                    </div>
                  </div>

                  <div className="md:w-2/3 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{certificate.courseTitle}</h2>
                        <p className="text-sm text-gray-600">Instructor: {certificate.instructor}</p>
                      </div>
                      {certificate.grade && (
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          certificate.grade === 'Distinction' ? 'bg-yellow-100 text-yellow-800' :
                          certificate.grade === 'Merit' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {certificate.grade}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Issue Date</p>
                        <p className="font-semibold text-gray-900">{formatDate(certificate.issueDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Completion Date</p>
                        <p className="font-semibold text-gray-900">{formatDate(certificate.completionDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">CPD Hours</p>
                        <p className="font-semibold text-gray-900">{certificate.cpdHours} hours</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Verification Code</p>
                        <p className="font-semibold text-gray-900 font-mono text-xs">{certificate.verificationCode}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Skills Acquired:</p>
                      <div className="flex flex-wrap gap-2">
                        {certificate.skills.map((skill, index) => (
                          <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-4 border-t">
                      <button
                        onClick={() => handleDownloadPdf(certificate)}
                        className="flex items-centre gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download PDF
                      </button>
                      <button
                        onClick={() => handlePrint(certificate)}
                        className="flex items-centre gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print
                      </button>
                      <button
                        onClick={() => handleShare(certificate)}
                        className="flex items-centre gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Share
                      </button>
                      <Link
                        href={`/training/courses/${certificate.courseId}`}
                        className="flex items-centre gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Course
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-centre">
            <div className="text-6xl mb-4">🎓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Certificates Yet</h2>
            <p className="text-gray-600 mb-6">
              Complete courses to earn certificates and track your professional development.
            </p>
            <Link
              href="/training"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
            >
              Explore Courses
            </Link>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">💡</div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">About Certificate Verification</h3>
              <p className="text-blue-800 text-sm mb-3">
                All certificates include a unique verification code that can be used to confirm authenticity. 
                Employers and professional bodies can verify your certificates using the verification link.
              </p>
              <Link
                href="/verify"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Verify a Certificate →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}