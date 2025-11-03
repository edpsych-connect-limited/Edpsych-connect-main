/**
 * Collaboration Thank You Page
 * Shown after successful submission of collaborative input
 */

'use client';

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow-xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Thank You for Your Input!
          </h1>

          {/* Message */}
          <p className="text-lg text-gray-600 mb-6">
            Your responses have been submitted successfully and will be carefully reviewed by the Educational Psychologist.
          </p>

          {/* Information Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">What Happens Next?</h2>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Your input will be integrated into the comprehensive assessment</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>The Educational Psychologist will use your observations to build a complete picture</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>You will receive a copy of the final assessment report when it's complete</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>If you have questions, please contact the EP who invited you</span>
              </li>
            </ul>
          </div>

          {/* Appreciation Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <p className="text-green-800 italic">
              "Your perspective is invaluable in understanding the child's unique strengths and needs.
              Thank you for taking the time to share your observations."
            </p>
          </div>

          {/* Privacy Note */}
          <p className="text-sm text-gray-500 mb-6">
            All information provided is confidential and will be used solely for assessment purposes in accordance with GDPR and the Data Protection Act 2018.
          </p>

          {/* Close Window Button */}
          <button
            onClick={() => window.close()}
            className="inline-block px-8 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Close This Window
          </button>

          {/* Branding */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-600 font-medium">EdPsych Connect World</p>
            <p className="text-sm text-gray-500 mt-1">Supporting educational psychology professionals across the UK</p>
          </div>
        </div>
      </div>
    </div>
  );
}
