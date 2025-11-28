import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Clock } from 'lucide-react';

export type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'syncing' | 'pending';

interface Props {
  status: ConnectionStatus;
  lastSync?: Date;
  className?: string;
}

export const IntegrationStatusBadge: React.FC<Props> = ({ status, lastSync, className = '' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: CheckCircle,
          text: 'Active',
          color: 'text-emerald-600',
          bg: 'bg-emerald-50 border-emerald-200',
          dot: 'bg-emerald-500'
        };
      case 'syncing':
        return {
          icon: RefreshCw,
          text: 'Syncing...',
          color: 'text-blue-600',
          bg: 'bg-blue-50 border-blue-200',
          dot: 'bg-blue-500 animate-pulse'
        };
      case 'error':
        return {
          icon: XCircle,
          text: 'Error',
          color: 'text-red-600',
          bg: 'bg-red-50 border-red-200',
          dot: 'bg-red-500'
        };
      case 'pending':
        return {
          icon: Clock,
          text: 'Pending Setup',
          color: 'text-amber-600',
          bg: 'bg-amber-50 border-amber-200',
          dot: 'bg-amber-500'
        };
      default:
        return {
          icon: AlertCircle,
          text: 'Disconnected',
          color: 'text-slate-500',
          bg: 'bg-slate-50 border-slate-200',
          dot: 'bg-slate-400'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex flex-col items-start ${className}`}>
      <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border ${config.bg} ${config.color} text-xs font-medium`}>
        <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {config.text}
      </div>
      {lastSync && (
        <span className="text-xs text-slate-400 mt-1 ml-1">
          Synced {new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  );
};
