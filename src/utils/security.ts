import { logger } from "@/lib/logger";

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

// src/utils/security.ts
import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html - HTML content to sanitize
 * @returns Sanitized HTML string
 */
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
};

/**
 * Validates if a string is safe for use in HTML context
 * @param input - String to validate
 * @returns True if string is safe
 */
export const isSafeHtml = (input: string): boolean => {
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  ];

  return !dangerousPatterns.some(pattern => pattern.test(input));
};

/**
 * Safely creates a print window without using document.write
 * @param content - Content to print
 * @param title - Print window title
 */
export const safePrint = (content: string, title = 'Print'): void => {
  const printWindow = window.open('', '_blank', 'width=800,height=600');

  if (!printWindow) {
    logger.error('Failed to open print window');
    return;
  }

  const sanitizedContent = sanitizeHtml(content);

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        ${sanitizedContent}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  // Wait for content to load before printing
  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
  };
};

/**
 * Safely parses CSS string into style object
 * @param cssString - CSS string to parse
 * @returns Style object safe for React
 */
export const parseSafeStyles = (cssString: string): React.CSSProperties => {
  const styles: React.CSSProperties = {};

  try {
    // Simple CSS parser - only allow safe properties
    const safeProperties = [
      'color', 'background-color', 'font-size', 'font-weight',
      'margin', 'padding', 'border', 'width', 'height',
      'display', 'flex-direction', 'justify-content', 'align-items'
    ];

    const declarations = cssString.split(';').filter(decl => decl.trim());

    declarations.forEach(declaration => {
      const [property, value] = declaration.split(':').map(s => s.trim());
      if (property && value && safeProperties.includes(property)) {
        // Convert kebab-case to camelCase
        const camelProperty = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        (styles as any)[camelProperty] = value;
      }
    });
  } catch (_error) {
    logger.error('Failed to parse CSS:', _error);
  }

  return styles;
};

/**
 * Validates environment variables for security
 * @param envVars - Object of environment variables to validate
 * @returns Object with validation results
 */
export const validateEnvironmentVariables = (envVars: Record<string, string | undefined>) => {
  const results = {
    valid: true,
    errors: [] as string[],
    warnings: [] as string[],
  };

  // Check for required security variables
  const requiredVars = [
    'NEXT_PUBLIC_ENCRYPTION_KEY',
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ];

  requiredVars.forEach(varName => {
    if (!envVars[varName]) {
      results.errors.push(`Missing required environment variable: ${varName}`);
      results.valid = false;
    }
  });

  // Check for potentially insecure configurations
  if (envVars.NODE_ENV === 'production') {
    if (envVars.NEXT_PUBLIC_ENCRYPTION_KEY === 'default-dev-key-change-in-production') {
      results.errors.push('Using default encryption key in production');
      results.valid = false;
    }
  }

  return results;
};

/**
 * Security headers configuration for Next.js
 */
export const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

/**
 * Content Security Policy configuration
 */
export const cspConfig = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:'],
  'font-src': ["'self'", 'https:', 'data:'],
  'connect-src': ["'self'", 'https:'],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
};
