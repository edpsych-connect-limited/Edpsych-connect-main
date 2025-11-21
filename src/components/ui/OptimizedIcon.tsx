import React, { lazy, Suspense, useMemo } from 'react';

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
  // Check if the icon is in our map
  if (!iconMap[name]) {
    console.warn(`Icon "${name}" not found in icon map. Add it to the iconMap in OptimizedIcon.tsx`);
    return <IconFallback />;
  }
  
  // Dynamically load the icon component
  const IconComponent = useMemo(() => lazy(iconMap[name]), [name]);
  
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