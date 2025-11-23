'use client';

import { useState, useEffect } from 'react';

export default function DiagnosticPage() {
  const [diagnosticData, setDiagnosticData] = useState<any>({
    status: 'Loading...',
    health: null,
    version: null,
    config: null,
    environment: null
  });
  
  useEffect(() => {
    async function runDiagnostics() {
      try {
        // Fetch health status
        const healthResponse = await fetch('/api/health');
        const healthData = await healthResponse.json();
        
        // Fetch version info
        const versionResponse = await fetch('/api/version');
        const versionData = await versionResponse.json();
        
        // Fetch runtime status
        const statusResponse = await fetch('/api/status');
        const statusData = await statusResponse.json();
        
        setDiagnosticData({
          status: 'Complete',
          health: healthData,
          version: versionData,
          environment: {
            runtime: process.env.NEXT_RUNTIME || 'unknown',
            node: process.versions?.node || 'unknown',
          },
          apiStatus: statusData
        });
      } catch (error) {
        setDiagnosticData({
          status: 'Error',
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    runDiagnostics();
  }, []);
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">System Diagnostic</h1>
      
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Diagnostic Status</h2>
        <div className="text-green-600 font-medium">
          {diagnosticData.status}
        </div>
      </div>
      
      {diagnosticData.error && (
        <div className="mb-6 p-4 border rounded bg-red-50 text-red-700">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <pre>{diagnosticData.error}</pre>
        </div>
      )}
      
      {diagnosticData.health && (
        <div className="mb-6 p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">Health Check</h2>
          <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
            {JSON.stringify(diagnosticData.health, null, 2)}
          </pre>
        </div>
      )}
      
      {diagnosticData.version && (
        <div className="mb-6 p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">Version Information</h2>
          <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
            {JSON.stringify(diagnosticData.version, null, 2)}
          </pre>
        </div>
      )}
      
      {diagnosticData.status && diagnosticData.status !== 'Loading...' && diagnosticData.status !== 'Complete' && (
        <div className="mb-6 p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">System Status</h2>
          <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
            {JSON.stringify(diagnosticData.status, null, 2)}
          </pre>
        </div>
      )}
      
      {diagnosticData.environment && (
        <div className="mb-6 p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">Environment</h2>
          <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
            {JSON.stringify(diagnosticData.environment, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="text-sm text-gray-500 mt-8">
        Generated at: {new Date().toISOString()}
      </div>
    </div>
  );
}