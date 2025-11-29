'use client'

import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import React from 'react';
import { Play, Shield, Users, Gamepad2 } from 'lucide-react';

interface FeatureSpotlightVideoProps {
  videoId: string;
  title: string;
  description: string;
  icon?: 'security' | 'differentiation' | 'gamification';
  className?: string;
}

export const FeatureSpotlightVideo: React.FC<FeatureSpotlightVideoProps> = ({
  videoId,
  title,
  description,
  icon = 'security',
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = React.useState(false);

  const getIcon = () => {
    switch (icon) {
      case 'security': return <Shield className="w-6 h-6 text-blue-600" />;
      case 'differentiation': return <Users className="w-6 h-6 text-purple-600" />;
      case 'gamification': return <Gamepad2 className="w-6 h-6 text-green-600" />;
      default: return <Shield className="w-6 h-6 text-blue-600" />;
    }
  };

  const videoUrl = `https://app.heygen.com/embed/${videoId}`;

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 ${className}`}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-slate-50 rounded-lg">
            {getIcon()}
          </div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        </div>
        
        <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden mb-4 group cursor-pointer">
          {!isPlaying ? (
            <div onClick={() => setIsPlaying(true)} className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 text-blue-600 ml-1" />
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full inline-block backdrop-blur-sm">
                  Watch Feature Spotlight
                </p>
              </div>
            </div>
          ) : (
            <iframe
              title={`Feature Spotlight: ${title}`}
              src={videoUrl}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          )}
        </div>

        <p className="text-slate-600 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};
