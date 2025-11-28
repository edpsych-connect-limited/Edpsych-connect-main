import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import {createNavigation} from 'next-intl/navigation';
import {defineRouting} from 'next-intl/routing';
 
export const locales = ['en', 'cy'] as const;
export const localePrefix = 'always'; // Default

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  localePrefix
});
 
export const {Link, redirect, usePathname, useRouter} =
  createNavigation(routing);