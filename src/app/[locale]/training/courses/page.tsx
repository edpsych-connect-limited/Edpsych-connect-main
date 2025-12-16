/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 *
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { redirect } from 'next/navigation';

export default function TrainingCoursesIndexPage({
  params,
}: {
  params?: { locale?: string };
}) {
  // Canonical training catalogue lives at `/<locale>/training`.
  // Keep this route as an alias for backwards-compatibility and audit checklists.
  const locale = params?.locale;
  // Defensive: if for any reason the dynamic segment isn't available at runtime,
  // redirect to the locale-less route and let middleware apply the correct locale.
  redirect(locale ? `/${locale}/training` : '/training');
}
