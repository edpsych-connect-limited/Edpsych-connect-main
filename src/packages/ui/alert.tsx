/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
}

export const Alert = ({
  className = '',
  variant = 'default',
  ...props
}: AlertProps) => {
  const variantClasses = {
    default: 'bg-background text-foreground',
    destructive: 'bg-destructive/15 text-destructive',
  };

  return (
    <div
      className={`relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
};

type AlertTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export const AlertTitle = ({
  className = '',
  ...props
}: AlertTitleProps) => (
  <h5
    className={`mb-1 font-medium leading-none tracking-tight ${className}`}
    {...props}
  />
);

type AlertDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

export const AlertDescription = ({
  className = '',
  ...props
}: AlertDescriptionProps) => (
  <div
    className={`text-sm [&_p]:leading-relaxed ${className}`}
    {...props}
  />
);
