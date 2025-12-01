'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfessionalRegistrationPage() {
  const router = useRouter();
  // const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: '',
    yearsExperience: '',
    bio: '',
    location: '',
    dailyRate: '',
    specialisms: [] as string[],
    hcpcNumber: '',
    insuranceProvider: '',
    insuranceNumber: '',
    insuranceExpiry: '',
    dbsNumber: '',
    dbsExpiry: '',
  });

  const specialismOptions = [
    'Autism / ASD',
    'ADHD',
    'Dyslexia',
    'SEMH',
    'Early Years',
    'Post-16',
    'Tribunal Work',
    'CBT',
    'Supervision',
    'Training',
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSpecialismToggle = (spec: string) => {
    setFormData(prev => {
      const current = prev.specialisms;
      if (current.includes(spec)) {
        return { ...prev, specialisms: current.filter(s => s !== spec) };
      } else {
        return { ...prev, specialisms: [...current, spec] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/marketplace/professionals/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Registration failed');

      router.push('/marketplace/dashboard?welcome=true');
    } catch (_error) {
      console._error('Error registering:', _error);
      alert('Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Join the Professional Network</h1>
          <p className="mt-2 text-gray-600">Start accepting bookings and grow your practice</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
            {[1, 2, 3].map((s) => (
              <div 
                key={s}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Basic Info</span>
            <span>Professional Details</span>
            <span>Compliance</span>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-8">
          <form onSubmit={handleSubmit}>
            {/* STEP 1: BASIC INFO */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                
                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">Professional Title</label>
                  <input
                    type="text"
                    id="jobTitle"
                    name="jobTitle"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g. Senior Educational Psychologist"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location (Base)</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g. London, UK"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Professional Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    required
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Tell clients about your experience and approach..."
                    value={formData.bio}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                  >
                    Next: Professional Details
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: PROFESSIONAL DETAILS */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Professional Details</h2>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="yearsExperience" className="block text-sm font-medium text-gray-700">Years of Experience</label>
                    <input
                      type="number"
                      id="yearsExperience"
                      name="yearsExperience"
                      required
                      min="0"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.yearsExperience}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="dailyRate" className="block text-sm font-medium text-gray-700">Daily Rate (£)</label>
                    <input
                      type="number"
                      id="dailyRate"
                      name="dailyRate"
                      required
                      min="0"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.dailyRate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialisms</label>
                  <div className="grid grid-cols-2 gap-3">
                    {specialismOptions.map(spec => (
                      <label key={spec} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.specialisms.includes(spec)}
                          onChange={() => handleSpecialismToggle(spec)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{spec}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-gray-600 px-6 py-2 hover:text-gray-900"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                  >
                    Next: Compliance
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: COMPLIANCE */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Compliance & Vetting</h2>
                <p className="text-sm text-gray-500 bg-blue-50 p-4 rounded-md">
                  To join the LA Framework Panel (18% commission), you will need to provide proof of £6M insurance coverage later.
                </p>

                <div>
                  <label htmlFor="hcpcNumber" className="block text-sm font-medium text-gray-700">HCPC Registration Number</label>
                  <input
                    type="text"
                    id="hcpcNumber"
                    name="hcpcNumber"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.hcpcNumber}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="insuranceProvider" className="block text-sm font-medium text-gray-700">Insurance Provider</label>
                    <input
                      type="text"
                      id="insuranceProvider"
                      name="insuranceProvider"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.insuranceProvider}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="insuranceNumber" className="block text-sm font-medium text-gray-700">Policy Number</label>
                    <input
                      type="text"
                      id="insuranceNumber"
                      name="insuranceNumber"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.insuranceNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="dbsNumber" className="block text-sm font-medium text-gray-700">DBS Certificate Number</label>
                    <input
                      type="text"
                      id="dbsNumber"
                      name="dbsNumber"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.dbsNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="dbsExpiry" className="block text-sm font-medium text-gray-700">DBS Expiry Date</label>
                    <input
                      type="date"
                      id="dbsExpiry"
                      name="dbsExpiry"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.dbsExpiry}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-gray-600 px-6 py-2 hover:text-gray-900"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-600 text-white px-8 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating Profile...' : 'Complete Registration'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
