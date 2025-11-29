import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Settings, ExternalLink, Shield } from 'lucide-react';
import { IntegrationStatusBadge, ConnectionStatus } from './IntegrationStatusBadge';

export interface ProviderProps {
  id: string;
  name: string;
  description: string;
  logo: React.ReactNode;
  status: ConnectionStatus;
  lastSync?: Date;
  features: string[];
  onConnect: () => void;
  onConfigure: () => void;
  helpText?: string;
}

export const ProviderCard: React.FC<ProviderProps> = ({
  name,
  description,
  logo,
  status,
  lastSync,
  features,
  onConnect,
  onConfigure
}) => {
  const isConnected = status === 'connected' || status === 'syncing';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`relative p-6 rounded-xl border transition-all duration-200 ${
        isConnected 
          ? 'bg-white border-indigo-100 shadow-lg shadow-indigo-500/5' 
          : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center text-2xl">
          {logo}
        </div>
        <IntegrationStatusBadge status={status} lastSync={lastSync} />
      </div>

      {/* Content */}
      <h3 className="text-lg font-bold text-slate-900 mb-2">{name}</h3>
      <p className="text-sm text-slate-500 mb-6 min-h-[40px]">{description}</p>

      {/* Features */}
      <div className="space-y-2 mb-6">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-center text-xs text-slate-600">
            <div className="w-1 h-1 rounded-full bg-indigo-400 mr-2" />
            {feature}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-auto">
        {isConnected ? (
          <>
            <button
              onClick={onConfigure}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-medium rounded-lg border border-slate-200 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Configure
            </button>
            <button 
              className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
              aria-label="Open provider portal"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={onConnect}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm shadow-indigo-200 transition-all"
          >
            Connect
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Security Badge */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <Shield className="w-4 h-4 text-emerald-500" />
      </div>
    </motion.div>
  );
};
