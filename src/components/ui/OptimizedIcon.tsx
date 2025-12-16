/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { lazy, Suspense } from 'react';

// Map of icon names to their dynamic imports
const iconMap: Record<string, () => Promise<any>> = {
  // FontAwesome (fa) icons
  'fa/FaUser': () => import('react-icons/fa').then(mod => ({ default: mod.FaUser })),
  'fa/FaHome': () => import('react-icons/fa').then(mod => ({ default: mod.FaHome })),
  'fa/FaCog': () => import('react-icons/fa').then(mod => ({ default: mod.FaCog })),
  'fa/FaSearch': () => import('react-icons/fa').then(mod => ({ default: mod.FaSearch })),
  'fa/FaArrowRight': () => import('react-icons/fa').then(mod => ({ default: mod.FaArrowRight })),
  'fa/FaArrowLeft': () => import('react-icons/fa').then(mod => ({ default: mod.FaArrowLeft })),
  'fa/FaCheck': () => import('react-icons/fa').then(mod => ({ default: mod.FaCheck })),
  'fa/FaTimes': () => import('react-icons/fa').then(mod => ({ default: mod.FaTimes })),
  'fa/FaExclamationTriangle': () => import('react-icons/fa').then(mod => ({ default: mod.FaExclamationTriangle })),
  'fa/FaInfoCircle': () => import('react-icons/fa').then(mod => ({ default: mod.FaInfoCircle })),
  
  // Material Design (md) icons
  'md/MdDashboard': () => import('react-icons/md').then(mod => ({ default: mod.MdDashboard })),
  'md/MdSettings': () => import('react-icons/md').then(mod => ({ default: mod.MdSettings })),
  
  // Add more icons as needed for your application
};

// Pre-create the lazy components at module scope.
// This avoids creating components during render and satisfies react-hooks/static-components.
const lazyIconMap: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> =
  Object.fromEntries(Object.entries(iconMap).map(([key, loader]) => [key, lazy(loader)])) as Record<
    string,
    React.LazyExoticComponent<React.ComponentType<any>>
  >;

// Fallback loading component
const IconFallback = () => <span className="icon-loading">...</span>;

interface OptimizedIconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
  [key: string]: any; // For any other props
}

/**
 * OptimizedIcon component that dynamically imports icons only when needed
 * This prevents the entire icon library from being included in the main bundle
 */
export const OptimizedIcon: React.FC<OptimizedIconProps> = ({
  name,
  size = 20,
  color,
  className = '',
  ...rest
}) => {
  // Dynamically load the icon component
  const IconComponent = lazyIconMap[name] ?? null;

  // Check if the icon is in our map
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in icon map. Add it to the iconMap in OptimizedIcon.tsx`);
    return <IconFallback />;
  }
  
  return (
    <Suspense fallback={<IconFallback />}>
      <IconComponent 
        size={size} 
        color={color} 
        className={className} 
        {...rest} 
      />
    </Suspense>
  );
};

export default OptimizedIcon;
