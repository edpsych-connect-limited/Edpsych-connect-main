/**
 * FILE: src/components/onboarding/steps/Step3ProfileSetup.tsx
 * PURPOSE: Step 3 - Profile setup with photo upload and professional details
 *
 * FEATURES:
 * - Photo upload with drag-and-drop
 * - HCPC number input (conditional for EPs)
 * - Organization name and details
 * - Job title and years of experience
 * - Form validation
 * - WCAG 2.1 AA compliant
 * - Responsive design
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, Camera, Check, AlertCircle, Building2, Briefcase, Calendar } from 'lucide-react';
import { useOnboarding } from '../OnboardingProvider';
import Image from 'next/image';

export function Step3ProfileSetup() {
  const { state, updateStep } = useOnboarding();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state
  const [photoUrl, setPhotoUrl] = useState<string>(state.step3Data.photoUrl || '');
  const [photoUploaded, setPhotoUploaded] = useState(state.step3Data.photoUploaded || false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [hcpcNumber, setHcpcNumber] = useState(state.step3Data.hcpcNumber || '');
  const [hcpcProvided, setHcpcProvided] = useState(state.step3Data.hcpcProvided || false);

  const [organizationName, setOrganizationName] = useState(state.step3Data.organizationName || '');
  const [organizationProvided, setOrganizationProvided] = useState(state.step3Data.organizationProvided || false);

  const [jobTitle, setJobTitle] = useState(state.step3Data.jobTitle || '');
  const [yearsExperience, setYearsExperience] = useState(state.step3Data.yearsExperience || '');

  // Check if user is an Educational Psychologist (needs HCPC)
  const isEP = state.step2Data.roleSelected === 'educational-psychologist';

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    setUploadError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file (JPG, PNG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be smaller than 5MB');
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setPhotoUrl(url);
      setPhotoUploaded(true);

      // Update context state
      updateStep(3, {
        photoUrl: url,
        photoUploaded: true
      }, false);
    };
    reader.readAsDataURL(file);

    // TODO: In production, upload to server/CDN
    // const formData = new FormData();
    // formData.append('photo', file);
    // const response = await fetch('/api/user/upload-photo', { method: 'POST', body: formData });
  }, [updateStep]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleHcpcChange = (value: string) => {
    setHcpcNumber(value);
    const isValid = value.trim().length > 0;
    setHcpcProvided(isValid);

    updateStep(3, {
      hcpcNumber: value,
      hcpcProvided: isValid
    }, false);
  };

  const handleOrganizationChange = (value: string) => {
    setOrganizationName(value);
    const isValid = value.trim().length > 0;
    setOrganizationProvided(isValid);

    updateStep(3, {
      organizationName: value,
      organizationProvided: isValid
    }, false);
  };

  const handleJobTitleChange = (value: string) => {
    setJobTitle(value);
    updateStep(3, { jobTitle: value }, false);
  };

  const handleYearsExperienceChange = (value: string) => {
    setYearsExperience(value);
    updateStep(3, { yearsExperience: value }, false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-3">
          Complete Your Profile
        </h2>
        <p className="text-lg text-gray-600">
          Help colleagues recognize you and verify your credentials
        </p>
      </div>

      {/* Photo Upload */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-900">
          Profile Photo
          <span className="ml-2 text-sm font-normal text-gray-500">(Optional)</span>
        </label>

        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Photo Preview */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Profile photo preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
                  <Camera className="w-12 h-12 text-indigo-400" aria-hidden="true" />
                </div>
              )}
            </div>
          </div>

          {/* Upload Area */}
          <div className="flex-1 w-full">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-xl p-6 text-center transition-all
                ${isDragging
                  ? 'border-indigo-500 bg-indigo-50'
                  : photoUploaded
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
                id="photo-upload"
                aria-describedby="photo-upload-description"
                title="Upload profile photo"
              />

              {photoUploaded ? (
                <div className="flex flex-col items-center gap-2">
                  <Check className="w-8 h-8 text-green-600" />
                  <p className="font-medium text-green-900">Photo uploaded!</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-indigo-600 hover:text-indigo-700 underline focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded"
                  >
                    Change photo
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-gray-400" aria-hidden="true" />
                  <p className="font-medium text-gray-900">
                    Drag & drop or{' '}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-indigo-600 hover:text-indigo-700 underline focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded"
                    >
                      browse
                    </button>
                  </p>
                  <p id="photo-upload-description" className="text-sm text-gray-500">
                    JPG, PNG up to 5MB
                  </p>
                </div>
              )}

              {uploadError && (
                <div className="mt-3 flex items-center gap-2 text-red-600 text-sm" role="alert">
                  <AlertCircle className="w-4 h-4" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Professional Details */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Professional Information
        </h3>

        {/* HCPC Number (for Educational Psychologists) */}
        {isEP && (
          <div className="space-y-2">
            <label htmlFor="hcpc-number" className="block text-sm font-semibold text-gray-900">
              HCPC Registration Number
              <span className="ml-2 text-sm font-normal text-gray-500">(Optional)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="hcpc-number"
                value={hcpcNumber}
                onChange={(e) => handleHcpcChange(e.target.value)}
                placeholder="PYL12345"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                aria-describedby="hcpc-hint"
              />
              {hcpcProvided && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Check className="w-5 h-5 text-green-600" aria-label="Valid HCPC number" />
                </div>
              )}
            </div>
            <p id="hcpc-hint" className="text-sm text-gray-600">
              Your HCPC number verifies you as a registered practitioner
            </p>
          </div>
        )}

        {/* Organization Name */}
        <div className="space-y-2">
          <label htmlFor="organization-name" className="block text-sm font-semibold text-gray-900">
            Organization / School Name
            <span className="ml-2 text-sm font-normal text-gray-500">(Optional)</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              id="organization-name"
              value={organizationName}
              onChange={(e) => handleOrganizationChange(e.target.value)}
              placeholder="e.g., Westminster Borough Council"
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              aria-describedby="organization-hint"
            />
            {organizationProvided && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Check className="w-5 h-5 text-green-600" aria-label="Organization provided" />
              </div>
            )}
          </div>
          <p id="organization-hint" className="text-sm text-gray-600">
            This helps with collaboration and institutional features
          </p>
        </div>

        {/* Job Title */}
        <div className="space-y-2">
          <label htmlFor="job-title" className="block text-sm font-semibold text-gray-900">
            Job Title
            <span className="ml-2 text-sm font-normal text-gray-500">(Optional)</span>
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              id="job-title"
              value={jobTitle}
              onChange={(e) => handleJobTitleChange(e.target.value)}
              placeholder="e.g., Senior Educational Psychologist"
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Years of Experience */}
        <div className="space-y-2">
          <label htmlFor="years-experience" className="block text-sm font-semibold text-gray-900">
            Years of Experience
            <span className="ml-2 text-sm font-normal text-gray-500">(Optional)</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
            <select
              id="years-experience"
              value={yearsExperience}
              onChange={(e) => handleYearsExperienceChange(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">Select range...</option>
              <option value="0-2">0-2 years</option>
              <option value="3-5">3-5 years</option>
              <option value="6-10">6-10 years</option>
              <option value="11-15">11-15 years</option>
              <option value="16-20">16-20 years</option>
              <option value="20+">20+ years</option>
            </select>
          </div>
        </div>
      </div>

      {/* Completion Progress */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-indigo-600">
              {[photoUploaded, organizationProvided, isEP ? hcpcProvided : true].filter(Boolean).length}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-indigo-900 mb-1">
              Profile Completion
            </p>
            <p className="text-sm text-indigo-700">
              {photoUploaded && organizationProvided && (!isEP || hcpcProvided)
                ? 'Your profile is complete! 🎉'
                : 'Add more details to help colleagues find and recognize you'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Note */}
      <div className="text-center text-sm text-gray-500">
        <p>
          🔒 All information is stored securely and complies with GDPR.{' '}
          <a href="/privacy" target="_blank" className="text-indigo-600 hover:text-indigo-700 underline">
            Privacy Policy
          </a>
        </p>
      </div>

      {/* Screen Reader Instructions */}
      <div className="sr-only" aria-live="polite">
        This is step 3 of the onboarding process. Upload a profile photo and provide your professional details. All fields are optional. Click Next when ready to continue.
      </div>
    </div>
  );
}
