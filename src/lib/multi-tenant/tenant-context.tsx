import { logger } from "@/lib/logger";
/**
 * Tenant Context Provider
 * This file provides multi-tenancy support for the application
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Tenant types
export interface Tenant {
  id: string;
  name: string;
  domain: string;
  settings: {
    theme: {
      primaryColor: string;
      secondaryColor: string;
      logo: string;
    };
    features: {
      [key: string]: boolean;
    };
  };
}

// Default tenant for fallback
const defaultTenant: Tenant = {
  id: 'default',
  name: 'EdPsych Connect',
  domain: 'edpsych-connect.com',
  settings: {
    theme: {
      primaryColor: '#4f46e5',
      secondaryColor: '#10b981',
      logo: '/images/logo.svg'
    },
    features: {
      analytics: true,
      assessments: true,
      reporting: true,
      aiFeatures: true,
      advancedSearch: true,
    }
  }
};

// Context definition
export interface TenantContextType {
  tenant: Tenant;
  loading: boolean;
  error: Error | null;
  setTenant: (tenant: Tenant) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

// Provider props
interface TenantProviderProps {
  children: ReactNode;
  initialTenant?: Tenant;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ 
  children, 
  initialTenant = defaultTenant 
}) => {
  const [tenant, setTenant] = useState<Tenant>(initialTenant);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Detect tenant based on hostname on initial load
  useEffect(() => {
    const detectTenant = async () => {
      if (typeof window === 'undefined') return;
      
      try {
        setLoading(true);
        
        // In a real implementation, we would fetch the tenant based on hostname
        // For now, just use the hostname to determine the tenant
        const hostname = window.location.hostname;
        
        // Mock tenant detection logic
        if (hostname === 'localhost' || hostname.includes('amplifyapp.com')) {
          // Already using default tenant, no need to change
          return;
        }
        
        // For subdomains like tenant1.edpsych-connect.com
        const subdomain = hostname.split('.')[0];
        if (subdomain && subdomain !== 'www') {
          logger.debug(`Detected tenant: ${subdomain}`);
          
          // In a real implementation, we would fetch tenant details from API
          const detectedTenant: Tenant = {
            ...defaultTenant,
            id: subdomain,
            name: subdomain.charAt(0).toUpperCase() + subdomain.slice(1),
            domain: hostname
          };
          
          setTenant(detectedTenant);
        }
      } catch (_err) {
        console.error('Error detecting tenant:', err);
        setError(err instanceof Error ? err : new Error('Unknown error detecting tenant'));
      } finally {
        setLoading(false);
      }
    };
    
    detectTenant();
  }, []);

  const contextValue: TenantContextType = {
    tenant,
    loading,
    error,
    setTenant
  };

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
};

// Hook for using the tenant context
export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  
  return context;
};

// Utility function to get tenant ID from request (for server-side)
export const getTenantFromRequest = (req: any): string => {
  // Get hostname from request headers
  const hostname = req.headers.host || '';
  
  // Extract tenant from hostname
  const subdomain = hostname.split('.')[0];
  if (subdomain && subdomain !== 'www') {
    return subdomain;
  }
  
  return 'default';
};