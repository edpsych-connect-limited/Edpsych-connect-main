import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';

// Tabs Container
type TabsProps = React.HTMLAttributes<HTMLDivElement>;

export const Tabs = ({ className = '', ...props }: TabsProps) => (
  <div className={`${className}`} {...props} />
);

// Tabs List
type TabsListProps = React.HTMLAttributes<HTMLDivElement>;

export const TabsList = ({ className = '', ...props }: TabsListProps) => (
  <div
    className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}
    {...props}
  />
);

// Tabs Trigger
interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  active?: boolean;
}

export const TabsTrigger = ({
  className = '',
  value,
  active = false,
  ...props
}: TabsTriggerProps) => {
  const baseClasses = 'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  const activeClasses = 'bg-background text-foreground shadow-sm';
  const inactiveClasses = 'hover:bg-background/50 hover:text-foreground';

  return (
    <button
      className={`${baseClasses} ${active ? activeClasses : inactiveClasses} ${className}`}
      data-value={value}
      {...props}
    />
  );
};

// Tabs Content
interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  active?: boolean;
}

export const TabsContent = ({
  className = '',
  value,
  active = false,
  ...props
}: TabsContentProps) => {
  if (!active) {
    return null;
  }

  return (
    <div
      className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
      data-value={value}
      {...props}
    />
  );
};