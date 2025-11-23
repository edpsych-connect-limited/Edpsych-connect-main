'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface BrandingConfig {
  primaryColor: string; // Hex code, e.g., #2563eb
  secondaryColor: string;
  logoUrl?: string;
  portalName: string;
}

interface BrandingContextType {
  config: BrandingConfig;
  updateBranding: (newConfig: Partial<BrandingConfig>) => void;
}

const defaultBranding: BrandingConfig = {
  primaryColor: '#2563eb', // Default Blue-600
  secondaryColor: '#f0f9ff',
  portalName: 'EdPsych Connect',
};

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<BrandingConfig>(defaultBranding);

  // Function to convert Hex to RGB for Tailwind opacity support
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
      : '37 99 235'; // Default fallback
  };

  // Apply CSS variables to root
  useEffect(() => {
    const root = document.documentElement;
    const rgb = hexToRgb(config.primaryColor);
    
    // We set a simplified palette for now. 
    // In a full implementation, we would generate the full 50-900 scale.
    root.style.setProperty('--color-primary-600', rgb);
    root.style.setProperty('--color-primary-500', rgb); // Fallback
    
    // Update title if needed
    if (config.portalName !== defaultBranding.portalName) {
      document.title = config.portalName;
    }
  }, [config]);

  // Mock fetching branding from API based on user organization
  useEffect(() => {
    // In production, this would fetch from /api/organization/branding
    // For demo, we check localStorage or URL params
    const savedBranding = localStorage.getItem('edpsych_branding');
    if (savedBranding) {
      setConfig(JSON.parse(savedBranding));
    }
  }, []);

  const updateBranding = (newConfig: Partial<BrandingConfig>) => {
    const updated = { ...config, ...newConfig };
    setConfig(updated);
    localStorage.setItem('edpsych_branding', JSON.stringify(updated));
  };

  return (
    <BrandingContext.Provider value={{ config, updateBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
}
