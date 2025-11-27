/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import * as React from "react";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-lg border bg-white shadow-sm ${className}`}>{children}</div>;
}

export function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`border-b p-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;
}

export function CardDescription({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-sm text-gray-600 ${className}`}>{children}</p>;
}

export function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`border-t p-4 ${className}`}>{children}</div>;
}