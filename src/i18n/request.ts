/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({requestLocale}) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;
 
  // Ensure that a valid locale is used
  if (!locale || !['en', 'cy'].includes(locale)) {
    locale = 'en';
  }
 
  // Load messages with error handling
  try {
    const messages = (await import(`../messages/${locale}.json`)).default;
    return {
      locale,
      messages
    };
  } catch (error) {
    // Fallback to English if the locale file is missing
    console.error(`Failed to load messages for locale "${locale}":`, error);
    const fallbackMessages = (await import('../messages/en.json')).default;
    return {
      locale: 'en',
      messages: fallbackMessages
    };
  }
});
