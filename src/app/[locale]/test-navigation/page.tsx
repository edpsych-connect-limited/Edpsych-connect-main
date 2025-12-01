'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import Link from 'next/link';
import { useRouter as _useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NavigationTest() {
  const [testResults, setTestResults] = useState<any[]>([]);

  const routes = [
    { path: '/', label: 'Home' },
    { path: '/assessments', label: 'Assessments' },
    { path: '/interventions', label: 'Interventions' },
    { path: '/ehcp', label: 'EHCP' },
    { path: '/cases', label: 'Cases' },
    { path: '/progress', label: 'Progress' },
    { path: '/ai-agents', label: 'AI Agents' },
    { path: '/training', label: 'Training' },
    { path: '/gamification', label: 'Gamification' },
    { path: '/help', label: 'Help' },
    { path: '/blog', label: 'Blog' },
    { path: '/admin', label: 'Admin' },
  ];

  const testRoute = async (path: string) => {
    try {
      const response = await fetch(path);
      return {
        path,
        status: response.status,
        ok: response.ok,
        error: null
      };
    } catch (_error) {
      return {
        path,
        status: 0,
        ok: false,
        _error: _error instanceof Error ? _error.message : 'Unknown _error'
      };
    }
  };

  const runAllTests = async () => {
    const results = [];
    for (const route of routes) {
      const result = await testRoute(route.path);
      results.push({ ...result, label: route.label });
    }
    setTestResults(results);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🔍 Navigation Diagnostic Tool
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Route Status</h2>
          <button
            onClick={runAllTests}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 mb-4"
          >
            Test All Routes
          </button>

          {testResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {testResults.map((result, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded border ${
                    result.ok
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{result.label}</span>
                    <span className="text-sm">
                      {result.path} - Status: {result.status}
                      {result.error && ` (${result.error})`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Navigation Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center"
              >
                {route.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Info</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
            <p><strong>User Agent:</strong> {typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}</p>
            <p><strong>Deployment Time:</strong> {new Date().toISOString()}</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-900 mb-2">Troubleshooting Steps:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-800">
            <li>Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)</li>
            <li>Clear browser cache</li>
            <li>Try in incognito/private browsing mode</li>
            <li>Check browser console for JavaScript errors (F12)</li>
            <li>Verify you're on the latest deployment</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
