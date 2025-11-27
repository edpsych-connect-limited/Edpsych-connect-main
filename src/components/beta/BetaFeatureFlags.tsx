'use client';

import React, { useState, useEffect } from 'react';
import { FaFlask, FaToggleOn, FaToggleOff, FaExclamationTriangle, FaRocket, FaBrain, FaGamepad, FaMicrophone, FaChartLine, FaShieldAlt } from 'react-icons/fa';

/**
 * Beta Feature Flags Component
 * 
 * Allows beta testers to opt-in/out of experimental features
 * 
 * @copyright EdPsych Connect Limited 2025
 */

interface BetaFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'ai' | 'gamification' | 'voice' | 'analytics' | 'experimental';
  risk: 'low' | 'medium' | 'high';
  defaultEnabled: boolean;
}

const BETA_FEATURES: BetaFeature[] = [
  {
    id: 'ai_advanced_chat',
    name: 'Advanced AI Chat',
    description: 'Enhanced AI conversations with context memory and multi-turn reasoning',
    icon: <FaBrain className="text-purple-400" />,
    category: 'ai',
    risk: 'low',
    defaultEnabled: true,
  },
  {
    id: 'battle_royale_multiplayer',
    name: 'Battle Royale Multiplayer',
    description: 'Real-time multiplayer quiz battles with other users',
    icon: <FaGamepad className="text-green-400" />,
    category: 'gamification',
    risk: 'medium',
    defaultEnabled: false,
  },
  {
    id: 'voice_commands_v2',
    name: 'Enhanced Voice Commands',
    description: 'New voice command capabilities with UK accent optimisation',
    icon: <FaMicrophone className="text-blue-400" />,
    category: 'voice',
    risk: 'low',
    defaultEnabled: true,
  },
  {
    id: 'predictive_analytics',
    name: 'Predictive Analytics',
    description: 'AI-powered predictions for student progress and intervention timing',
    icon: <FaChartLine className="text-yellow-400" />,
    category: 'analytics',
    risk: 'medium',
    defaultEnabled: false,
  },
  {
    id: 'auto_ehcp_drafting',
    name: 'AI EHCP Draft Generation',
    description: 'Automatically generate EHCP draft sections from assessment data',
    icon: <FaRocket className="text-orange-400" />,
    category: 'ai',
    risk: 'high',
    defaultEnabled: false,
  },
  {
    id: 'experimental_ui',
    name: 'Experimental UI Components',
    description: 'Try new UI designs and interactions before they go live',
    icon: <FaFlask className="text-pink-400" />,
    category: 'experimental',
    risk: 'medium',
    defaultEnabled: false,
  },
];

interface BetaFeatureFlagsProps {
  /** Callback when features change */
  onFeaturesChange?: (features: Record<string, boolean>) => void;
  /** Compact mode for sidebar */
  compact?: boolean;
}

export function BetaFeatureFlags({ onFeaturesChange, compact = false }: BetaFeatureFlagsProps) {
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [showWarning, setShowWarning] = useState(false);
  const [pendingFeature, setPendingFeature] = useState<string | null>(null);

  // Load saved preferences
  useEffect(() => {
    const saved = localStorage.getItem('beta_features');
    if (saved) {
      try {
        setFeatures(JSON.parse(saved));
      } catch {
        // Initialize with defaults
        const defaults: Record<string, boolean> = {};
        BETA_FEATURES.forEach(f => {
          defaults[f.id] = f.defaultEnabled;
        });
        setFeatures(defaults);
      }
    } else {
      const defaults: Record<string, boolean> = {};
      BETA_FEATURES.forEach(f => {
        defaults[f.id] = f.defaultEnabled;
      });
      setFeatures(defaults);
    }
  }, []);

  // Save preferences when changed
  useEffect(() => {
    if (Object.keys(features).length > 0) {
      localStorage.setItem('beta_features', JSON.stringify(features));
      onFeaturesChange?.(features);
    }
  }, [features, onFeaturesChange]);

  const toggleFeature = (featureId: string) => {
    const feature = BETA_FEATURES.find(f => f.id === featureId);
    const isEnabling = !features[featureId];

    // Show warning for high-risk features being enabled
    if (feature?.risk === 'high' && isEnabling) {
      setPendingFeature(featureId);
      setShowWarning(true);
      return;
    }

    setFeatures(prev => ({
      ...prev,
      [featureId]: !prev[featureId],
    }));
  };

  const confirmHighRiskFeature = () => {
    if (pendingFeature) {
      setFeatures(prev => ({
        ...prev,
        [pendingFeature]: true,
      }));
    }
    setShowWarning(false);
    setPendingFeature(null);
  };

  const getRiskBadge = (risk: 'low' | 'medium' | 'high') => {
    const classes = {
      low: 'bg-green-500/20 text-green-400 border-green-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      high: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full border ${classes[risk]}`}>
        {risk.charAt(0).toUpperCase() + risk.slice(1)} Risk
      </span>
    );
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      ai: 'AI & Machine Learning',
      gamification: 'Gamification',
      voice: 'Voice & Speech',
      analytics: 'Analytics',
      experimental: 'Experimental',
    };
    return labels[category] || category;
  };

  // Group features by category
  const groupedFeatures = BETA_FEATURES.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, BetaFeature[]>);

  if (compact) {
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <FaFlask className="text-purple-400" />
          Beta Features
        </h4>
        <div className="space-y-1">
          {BETA_FEATURES.slice(0, 3).map(feature => (
            <button
              key={feature.id}
              onClick={() => toggleFeature(feature.id)}
              className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                features[feature.id]
                  ? 'bg-purple-500/20 text-purple-300'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              <span className="flex items-center gap-2">
                {feature.icon}
                <span className="truncate">{feature.name}</span>
              </span>
              {features[feature.id] ? (
                <FaToggleOn className="text-purple-400" />
              ) : (
                <FaToggleOff className="text-slate-500" />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <FaFlask className="text-purple-400 text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Beta Feature Toggles</h3>
            <p className="text-sm text-slate-400">Enable experimental features</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FaShieldAlt className="text-slate-400" />
          <span className="text-xs text-slate-400">
            {Object.values(features).filter(Boolean).length} of {BETA_FEATURES.length} enabled
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
          <div key={category}>
            <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
              {getCategoryLabel(category)}
            </h4>
            <div className="space-y-3">
              {categoryFeatures.map(feature => (
                <div
                  key={feature.id}
                  className={`p-4 rounded-lg border transition-all ${
                    features[feature.id]
                      ? 'bg-purple-500/10 border-purple-500/30'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        {feature.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-medium text-white">{feature.name}</h5>
                          {getRiskBadge(feature.risk)}
                        </div>
                        <p className="text-sm text-slate-400 mt-1">{feature.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFeature(feature.id)}
                      className="flex-shrink-0 p-2 rounded-lg hover:bg-white/10 transition-colors"
                      aria-label={`Toggle ${feature.name}`}
                    >
                      {features[feature.id] ? (
                        <FaToggleOn className="text-purple-400 text-2xl" />
                      ) : (
                        <FaToggleOff className="text-slate-500 text-2xl" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* High Risk Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <FaExclamationTriangle className="text-red-400 text-xl" />
              </div>
              <h4 className="text-lg font-semibold text-white">High Risk Feature</h4>
            </div>
            <p className="text-slate-300 mb-4">
              This feature is marked as high risk. It may have unexpected behaviour or impact your data.
              Please proceed with caution and report any issues.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowWarning(false);
                  setPendingFeature(null);
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmHighRiskFeature}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors"
              >
                Enable Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Hook to check if a beta feature is enabled
 */
export function useBetaFeature(featureId: string): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const checkFeature = () => {
      const saved = localStorage.getItem('beta_features');
      if (saved) {
        try {
          const features = JSON.parse(saved);
          setEnabled(!!features[featureId]);
        } catch {
          setEnabled(false);
        }
      }
    };

    checkFeature();
    
    // Listen for storage changes
    window.addEventListener('storage', checkFeature);
    return () => window.removeEventListener('storage', checkFeature);
  }, [featureId]);

  return enabled;
}

export default BetaFeatureFlags;
