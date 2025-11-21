import React from 'react';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Settings</h1>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">General Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white">Voice Assistant</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Enable voice commands for navigation</p>
              </div>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-green-500 cursor-pointer">
                <span className="absolute left-6 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out"></span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white">Dark Mode</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Toggle application theme</p>
              </div>
              <button className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-lg text-sm font-medium">
                System Default
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Account</h2>
          <div className="space-y-4">
            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Email</p>
              <p className="font-medium text-slate-900 dark:text-white">user@example.com</p>
            </div>
            <button className="text-red-600 hover:text-red-700 font-medium text-sm">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
