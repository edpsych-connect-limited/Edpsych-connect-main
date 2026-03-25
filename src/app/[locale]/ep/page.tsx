import { redirect } from 'next/navigation';

/**
 * /ep route — redirects to EP dashboard.
 * Auth is handled by the dashboard itself.
 */
export default function EPPage() {
  redirect('/ep/dashboard');
}
