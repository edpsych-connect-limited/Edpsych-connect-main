/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import MISIntegrationSettings from '@/components/settings/MISIntegrationSettings';
import { Settings, User, Bell, Shield, Database, Moon, Sun, Volume2, VolumeX } from 'lucide-react';

type SettingsTab = 'general' | 'account' | 'integrations' | 'notifications' | 'privacy';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState<'system' | 'light' | 'dark'>('system');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weekly: true,
  });

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'General', icon: <Settings className="w-4 h-4" /> },
    { id: 'account', label: 'Account', icon: <User className="w-4 h-4" /> },
    { id: 'integrations', label: 'Integrations', icon: <Database className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Settings</h1>
        
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200 dark:border-slate-700 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">General Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {voiceEnabled ? <Volume2 className="w-5 h-5 text-green-600" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">Voice Assistant</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Enable voice commands for navigation</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={`relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer ${
                      voiceEnabled ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${
                      voiceEnabled ? 'left-6' : 'left-1'
                    }`}></span>
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {darkMode === 'dark' ? <Moon className="w-5 h-5 text-indigo-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">Theme</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Choose your preferred colour scheme</p>
                    </div>
                  </div>
                  <select
                    value={darkMode}
                    onChange={(e) => setDarkMode(e.target.value as 'system' | 'light' | 'dark')}
                    className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-900 dark:text-white"
                    aria-label="Select theme"
                    title="Select theme"
                  >
                    <option value="system">System Default</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">Language</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Select your preferred language</p>
                  </div>
                  <select
                    className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-900 dark:text-white"
                    aria-label="Select language"
                    title="Select language"
                  >
                    <option value="en">English (UK)</option>
                    <option value="cy">Cymraeg (Welsh)</option>
                    <option value="gd">Gàidhlig (Scottish Gaelic)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account Settings */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Account Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Name</p>
                    <p className="font-medium text-slate-900 dark:text-white">{session?.user?.name || 'Not set'}</p>
                  </div>
                  <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Email</p>
                    <p className="font-medium text-slate-900 dark:text-white">{session?.user?.email || 'user@example.com'}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Edit Profile
                  </button>
                  <button className="px-4 py-2 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-white rounded-lg text-sm font-medium transition-colors">
                    Change Password
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Session</h2>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-red-600 hover:text-red-700 font-medium text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Integrations Settings */}
        {activeTab === 'integrations' && (
          <MISIntegrationSettings />
        )}

        {/* Notifications Settings */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Notification Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">Email Notifications</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive important updates via email</p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                    className={`relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer ${
                      notifications.email ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${
                      notifications.email ? 'left-6' : 'left-1'
                    }`}></span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">Push Notifications</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Get real-time alerts in your browser</p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, push: !notifications.push })}
                    className={`relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer ${
                      notifications.push ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${
                      notifications.push ? 'left-6' : 'left-1'
                    }`}></span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">Weekly Summary</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive a weekly digest of activity</p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, weekly: !notifications.weekly })}
                    className={`relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer ${
                      notifications.weekly ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${
                      notifications.weekly ? 'left-6' : 'left-1'
                    }`}></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Settings */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Privacy & Data</h2>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <h3 className="font-medium text-slate-900 dark:text-white mb-2">Data Protection</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Your data is protected under UK GDPR regulations. We implement enterprise-grade security measures
                    including encryption at rest and in transit, role-based access control, and comprehensive audit logging.
                  </p>
                  <a href="/docs/data-protection" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 text-sm font-medium">
                    View Data Protection Policy →
                  </a>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <h3 className="font-medium text-slate-900 dark:text-white mb-2">Data Export</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    You have the right to request a copy of all your personal data. Export requests are typically
                    processed within 48 hours.
                  </p>
                  <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Request Data Export
                  </button>
                </div>

                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <h3 className="font-medium text-red-800 dark:text-red-300 mb-2">Delete Account</h3>
                  <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Request Account Deletion
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Consent Management</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">Analytics</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Help us improve the platform with anonymous usage data</p>
                  </div>
                  <button 
                    className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-green-500 cursor-pointer"
                    aria-label="Toggle analytics"
                    title="Toggle analytics"
                  >
                    <span className="absolute left-6 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out"></span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">Research Participation</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Allow anonymised data to be used in educational research</p>
                  </div>
                  <button 
                    className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-slate-300 dark:bg-slate-600 cursor-pointer"
                    aria-label="Toggle research participation"
                    title="Toggle research participation"
                  >
                    <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out"></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
