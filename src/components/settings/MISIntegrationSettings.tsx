'use client';

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * MIS Integration Settings Component
 * 
 * Zero-touch setup for school MIS integration with:
 * - Wonde API configuration
 * - SIMS Direct connection
 * - Arbor API setup
 * - Sync status monitoring
 * - Automated data import controls
 */

import React, { useState, useEffect } from 'react';
import { 
  Database, RefreshCw, CheckCircle, AlertCircle, Clock, 
  Shield, Settings, Loader2, Play, Trash2,
  ExternalLink, HelpCircle, Video
} from 'lucide-react';
import { VideoModal } from '@/components/video/VideoTutorialPlayer';
import toast from 'react-hot-toast';

interface IntegrationProvider {
  id: string;
  name: string;
  description: string;
  logo: string;
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  lastSync?: string;
  recordsSynced?: number;
  apiKeyConfigured: boolean;
}

interface SyncLog {
  id: string;
  timestamp: string;
  provider: string;
  recordsProcessed: number;
  status: 'success' | 'error' | 'partial';
  errors?: string[];
}

export default function MISIntegrationSettings() {
  const [providers, setProviders] = useState<IntegrationProvider[]>([
    {
      id: 'wonde',
      name: 'Wonde',
      description: 'UK\'s leading school data API - connects to SIMS, Arbor, Bromcom, and more',
      logo: '/images/integrations/wonde-logo.png',
      status: 'disconnected',
      apiKeyConfigured: false,
    },
    {
      id: 'sims',
      name: 'SIMS Direct',
      description: 'Direct connection to Capita SIMS management system',
      logo: '/images/integrations/sims-logo.png',
      status: 'disconnected',
      apiKeyConfigured: false,
    },
    {
      id: 'arbor',
      name: 'Arbor Education',
      description: 'Direct Arbor MIS integration for student data',
      logo: '/images/integrations/arbor-logo.png',
      status: 'disconnected',
      apiKeyConfigured: false,
    },
  ]);

  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [showVideoHelp, setShowVideoHelp] = useState(false);
  const [videoHelpKey, setVideoHelpKey] = useState('admin-mis-integration');
  const [videoHelpTitle, setVideoHelpTitle] = useState('MIS Integration Setup Guide');
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [syncSchedule, setSyncSchedule] = useState('daily');

  // Provider-specific video mapping
  const providerVideos: Record<string, { key: string; title: string }> = {
    wonde: { key: 'mis-wonde-setup', title: 'Wonde MIS Integration Setup' },
    sims: { key: 'mis-sims-integration', title: 'SIMS Integration Guide' },
    arbor: { key: 'mis-arbor-integration', title: 'Arbor MIS Integration' },
    troubleshooting: { key: 'mis-sync-troubleshooting', title: 'MIS Sync Troubleshooting' },
  };

  const showProviderVideo = (providerId: string) => {
    const video = providerVideos[providerId] || { key: 'admin-mis-integration', title: 'MIS Integration Setup Guide' };
    setVideoHelpKey(video.key);
    setVideoHelpTitle(video.title);
    setShowVideoHelp(true);
  };

  // Load existing configuration
  useEffect(() => {
    loadIntegrationSettings();
  }, []);

  const loadIntegrationSettings = async () => {
    try {
      const response = await fetch('/api/settings/integrations');
      if (response.ok) {
        const data = await response.json();
        if (data.providers) {
          setProviders(data.providers);
        }
        if (data.syncLogs) {
          setSyncLogs(data.syncLogs);
        }
        if (data.autoSync !== undefined) {
          setAutoSyncEnabled(data.autoSync);
        }
      }
    } catch (error) {
      console.error('Failed to load integration settings:', error);
    }
  };

  const handleConnect = async (providerId: string) => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/integrations/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: providerId,
          apiKey: apiKey,
          schoolId: schoolId || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Successfully connected to ${providers.find(p => p.id === providerId)?.name}`);
        setProviders(prev => prev.map(p => 
          p.id === providerId 
            ? { ...p, status: 'connected', apiKeyConfigured: true }
            : p
        ));
        setApiKey('');
        setSchoolId('');
        setSelectedProvider(null);
      } else {
        toast.error(data.error || 'Failed to connect');
      }
    } catch (_error) {
      toast.error('Connection failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async (providerId: string) => {
    setIsTesting(true);
    try {
      const response = await fetch('/api/settings/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Connection test successful!');
      } else {
        toast.error(data.error || 'Connection test failed');
      }
    } catch (_error) {
      toast.error('Test failed. Please check your connection.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncNow = async (providerId: string) => {
    setProviders(prev => prev.map(p => 
      p.id === providerId ? { ...p, status: 'syncing' } : p
    ));

    try {
      const response = await fetch('/api/settings/integrations/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Synced ${data.recordsProcessed} records`);
        setProviders(prev => prev.map(p => 
          p.id === providerId 
            ? { 
                ...p, 
                status: 'connected', 
                lastSync: new Date().toISOString(),
                recordsSynced: data.recordsProcessed 
              }
            : p
        ));
        // Add to sync logs
        setSyncLogs(prev => [{
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          provider: providerId,
          recordsProcessed: data.recordsProcessed,
          status: 'success',
        }, ...prev.slice(0, 9)]);
      } else {
        toast.error(data.error || 'Sync failed');
        setProviders(prev => prev.map(p => 
          p.id === providerId ? { ...p, status: 'error' } : p
        ));
      }
    } catch (_error) {
      toast.error('Sync failed. Please try again.');
      setProviders(prev => prev.map(p => 
        p.id === providerId ? { ...p, status: 'error' } : p
      ));
    }
  };

  const handleDisconnect = async (providerId: string) => {
    if (!confirm('Are you sure you want to disconnect this integration? This will not delete any imported data.')) {
      return;
    }

    try {
      const response = await fetch('/api/settings/integrations/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerId }),
      });

      if (response.ok) {
        toast.success('Integration disconnected');
        setProviders(prev => prev.map(p => 
          p.id === providerId 
            ? { ...p, status: 'disconnected', apiKeyConfigured: false, lastSync: undefined, recordsSynced: undefined }
            : p
        ));
      }
    } catch (_error) {
      toast.error('Failed to disconnect');
    }
  };

  const getStatusIcon = (status: IntegrationProvider['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'syncing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: IntegrationProvider['status']) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'syncing':
        return 'Syncing...';
      case 'error':
        return 'Error';
      default:
        return 'Not Connected';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-600" />
            MIS Integration
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Connect your school's Management Information System for automatic student data sync
          </p>
        </div>
        <button
          onClick={() => setShowVideoHelp(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
        >
          <Video className="w-4 h-4" />
          Watch Setup Guide
        </button>
      </div>

      {/* Auto-Sync Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Sync Settings
        </h3>
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={autoSyncEnabled}
                onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-11 h-6 rounded-full transition-colors ${autoSyncEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${autoSyncEnabled ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`} />
              </div>
            </div>
            <span className="text-gray-700 dark:text-gray-300">Enable automatic sync</span>
          </label>

          {autoSyncEnabled && (
            <select
              value={syncSchedule}
              onChange={(e) => setSyncSchedule(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-label="Sync schedule frequency"
              title="Select sync frequency"
            >
              <option value="hourly">Every hour</option>
              <option value="daily">Daily (overnight)</option>
              <option value="weekly">Weekly (Sunday night)</option>
            </select>
          )}
        </div>
      </div>

      {/* Provider Cards */}
      <div className="grid gap-6">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <Database className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{provider.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{provider.description}</p>
                    {provider.lastSync && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        Last sync: {new Date(provider.lastSync).toLocaleString('en-GB')} • {provider.recordsSynced} records
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(provider.status)}
                  <span className={`text-sm font-medium ${
                    provider.status === 'connected' ? 'text-green-600' :
                    provider.status === 'syncing' ? 'text-blue-600' :
                    provider.status === 'error' ? 'text-red-600' :
                    'text-gray-500'
                  }`}>
                    {getStatusText(provider.status)}
                  </span>
                </div>
              </div>

              {/* Connected Actions */}
              {provider.status === 'connected' && (
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => handleSyncNow(provider.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Sync Now
                  </button>
                  <button
                    onClick={() => handleTestConnection(provider.id)}
                    disabled={isTesting}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    Test Connection
                  </button>
                  <button
                    onClick={() => handleDisconnect(provider.id)}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Disconnect
                  </button>
                </div>
              )}

              {/* Connect Form */}
              {provider.status === 'disconnected' && selectedProvider === provider.id && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your API key"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  {provider.id === 'wonde' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        School ID (optional)
                      </label>
                      <input
                        type="text"
                        value={schoolId}
                        onChange={(e) => setSchoolId(e.target.value)}
                        placeholder="Your Wonde school ID"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleConnect(provider.id)}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Connect
                    </button>
                    <button
                      onClick={() => setSelectedProvider(null)}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Your API key is encrypted and stored securely
                  </p>
                </div>
              )}

              {/* Connect Button */}
              {provider.status === 'disconnected' && selectedProvider !== provider.id && (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => setSelectedProvider(provider.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Database className="w-4 h-4" />
                    Connect {provider.name}
                  </button>
                  <button
                    onClick={() => showProviderVideo(provider.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Video className="w-4 h-4" />
                    Watch Setup Guide
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Sync History */}
      {syncLogs.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Sync History</h3>
            <button
              onClick={() => showProviderVideo('troubleshooting')}
              className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <HelpCircle className="w-4 h-4" />
              Troubleshooting Guide
            </button>
          </div>
          <div className="space-y-3">
            {syncLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {log.status === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : log.status === 'error' ? (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {providers.find(p => p.id === log.provider)?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(log.timestamp).toLocaleString('en-GB')}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {log.recordsProcessed} records
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <HelpCircle className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Need help connecting?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Our MIS integration guide walks you through the setup process step by step.
              Most schools complete setup in under 5 minutes.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                onClick={() => setShowVideoHelp(true)}
                className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Video className="w-4 h-4" />
                Watch video guide
              </button>
              <a
                href="/help/mis-integration"
                className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Read documentation
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Video Help Modal */}
      {showVideoHelp && (
        <VideoModal
          videoKey={videoHelpKey}
          title={videoHelpTitle}
          isOpen={showVideoHelp}
          onClose={() => setShowVideoHelp(false)}
        />
      )}
    </div>
  );
}
