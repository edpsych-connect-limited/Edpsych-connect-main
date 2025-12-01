/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { MetadataRoute } from 'next';

const BASE_URL = 'https://www.edpsychconnect.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['en', 'cy']; // English and Welsh
  const currentDate = new Date().toISOString();
  
  // Static public pages
  const staticPages = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/login', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/signup', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/beta-login', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/beta-register', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/pricing', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/about', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/help', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/blog', priority: 0.8, changeFrequency: 'daily' as const },
    { path: '/demo', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/assessment-templates', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/marketplace', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/training', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/battle-royale', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/privacy', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/terms', priority: 0.5, changeFrequency: 'monthly' as const },
  ];
  
  // Generate sitemap entries for all locales
  const sitemapEntries: MetadataRoute.Sitemap = [];
  
  for (const locale of locales) {
    for (const page of staticPages) {
      sitemapEntries.push({
        url: `${BASE_URL}/${locale}${page.path}`,
        lastModified: currentDate,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      });
    }
  }
  
  // Add root URL redirecting to /en
  sitemapEntries.push({
    url: BASE_URL,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 1.0,
  });
  
  return sitemapEntries;
}
