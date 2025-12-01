/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.edpsychconnect.com';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',           // Block API routes
          '/admin/',         // Block admin dashboard
          '/dashboard/',     // Block authenticated dashboard
          '/settings/',      // Block user settings
          '/students/',      // Block student data
          '/assessments/',   // Block assessment data
          '/reports/',       // Block reports
          '/ehcp/',          // Block EHCP data
          '/collaborate/',   // Block collaboration data
          '/_next/',         // Block Next.js internals
          '/private/',       // Block private routes
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard/', '/settings/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard/', '/settings/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
