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

export default function DevelopmentNotice() {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-6 mb-8" role="alert">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <svg 
            className="w-6 h-6 text-amber-500" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-amber-900 mb-2">
            Development Platform - Content Under Expert Review
          </h3>
          <div className="text-sm text-amber-800 space-y-2">
            <p className="font-medium">
              This Training Centre is currently in development. Course frameworks represent proposed structure only.
            </p>
            <p>
              <strong>Actual content will be authored and peer-reviewed by chartered educational psychologists</strong> (HCPC-registered, doctorate-level) prior to beta testing. All courses will undergo rigorous evidence validation, academic peer review, and professional accreditation before launch.
            </p>
            <p className="text-xs mt-3 text-amber-700">
              Current platform demonstrates technical capabilities only. Evidence-based content development is scheduled for Weeks 13-16.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}