import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import ukLocalization from '../../utils/ukLocalization';

/**
 * UkLocalization Context Interface
 */
interface UkLocalizationContextType {
  /**
   * Converts US English spelling to UK English spelling
   */
  convertToUkSpelling: (text: string) => string;
  
  /**
   * Formats a date according to UK convention (DD/MM/YYYY)
   */
  formatUkDate: (date: Date) => string;
  
  /**
   * Formats a date and time according to UK convention
   */
  formatUkDateTime: (date: Date) => string;
  
  /**
   * Formats currency according to UK convention (£)
   */
  formatUkCurrency: (amount: number) => string;
  
  /**
   * Checks if text contains any US spellings
   */
  containsUsSpellings: (text: string) => boolean;
  
  /**
   * Identifies US spellings in text
   */
  identifyUsSpellings: (text: string) => string[];
  
  /**
   * Converts US grade level to UK equivalent
   */
  convertToUkGradeLevel: (grade: string) => string;
  
  /**
   * Dictionary of US to UK spellings
   */
  usToUkSpellings: Record<string, string>;
  
  /**
   * Dictionary of US to UK grade equivalents
   */
  gradeEquivalents: Record<string, string>;
  
  /**
   * Whether UK localization is enabled
   */
  enabled: boolean;
}

// Create the UK Localization Context with default values
const UkLocalizationContext = createContext<UkLocalizationContextType>({
  convertToUkSpelling: (text) => text,
  formatUkDate: (date) => date.toLocaleDateString(),
  formatUkDateTime: (date) => date.toLocaleString(),
  formatUkCurrency: (amount) => `£${amount.toFixed(2)}`,
  containsUsSpellings: () => false,
  identifyUsSpellings: () => [],
  convertToUkGradeLevel: (grade) => grade,
  usToUkSpellings: {},
  gradeEquivalents: {},
  enabled: false,
});

/**
 * Props for the UkLocalizationProvider component
 */
interface UkLocalizationProviderProps {
  /**
   * Whether UK localization is enabled (defaults to true)
   */
  enabled?: boolean;
  
  /**
   * Children components
   */
  children: ReactNode;
}

/**
 * Provider component for UK localization
 * Wraps the application to provide UK localization utilities to all components
 */
export const UkLocalizationProvider: React.FC<UkLocalizationProviderProps> = ({
  enabled = true,
  children,
}) => {
  // Context value with all localization utilities
  const contextValue: UkLocalizationContextType = {
    ...ukLocalization,
    enabled,
  };
  
  return (
    <UkLocalizationContext.Provider value={contextValue}>
      {children}
    </UkLocalizationContext.Provider>
  );
};

/**
 * Hook to use UK localization utilities
 * @returns UK localization utilities
 */
export const useUkLocalization = () => {
  const context = useContext(UkLocalizationContext);
  
  if (!context) {
    throw new Error('useUkLocalization must be used within a UkLocalizationProvider');
  }
  
  return context;
};

/**
 * Higher-order component to apply UK localization to a component
 * @param Component Component to wrap
 * @returns Wrapped component with UK localization
 */
export const withUkLocalization = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  const WithUkLocalization: React.FC<P> = (props) => {
    const localization = useUkLocalization();
    
    // Apply UK localization to string props if enabled
    if (localization.enabled) {
      // Convert all string props to UK spelling
      const ukProps = Object.entries(props).reduce((acc, [key, value]) => {
        if (typeof value === 'string') {
          acc[key as keyof P] = localization.convertToUkSpelling(value) as any;
        } else {
          acc[key as keyof P] = value;
        }
        return acc;
      }, {} as P);
      
      return <Component {...ukProps} />;
    }
    
    return <Component {...props} />;
  };
  
  // Set display name for better debugging
  const displayName = Component.displayName || Component.name || 'Component';
  WithUkLocalization.displayName = `withUkLocalization(${displayName})`;
  
  return WithUkLocalization;
};

/**
 * UK localization text component
 * Automatically converts US spellings to UK spellings
 */
export const UkText: React.FC<{
  children: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}> = ({ children, className, as: Component = 'span' }) => {
  const { convertToUkSpelling, enabled } = useUkLocalization();
  
  const text = enabled ? convertToUkSpelling(children) : children;
  
  return <Component className={className}>{text}</Component>;
};

export default UkLocalizationProvider;