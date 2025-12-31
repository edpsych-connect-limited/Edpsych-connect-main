/**
 * Ops-only email configuration status endpoint.
 *
 * This is intentionally key-protected and only returns non-sensitive booleans.
 *
 * Header:
 *   x-ops-key: <OPS_API_KEY>
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const opsKey = process.env.OPS_API_KEY;

  if (!opsKey) {
    return NextResponse.json(
      { ok: false, error: 'OPS_API_KEY not configured' },
      { status: 503 }
    );
  }

  const provided = request.headers.get('x-ops-key');
  if (!provided || provided !== opsKey) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const hasSendGridKey = Boolean(process.env.SENDGRID_API_KEY);
  const hasEmailFrom = Boolean(process.env.EMAIL_FROM);
  const hasReplyTo = Boolean(process.env.EMAIL_REPLY_TO);
  const defaultLocale = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en').toLowerCase();
  const safeLocale = (defaultLocale === 'en' || defaultLocale === 'cy') ? defaultLocale : 'en';

  return NextResponse.json({
    ok: true,
    environment: process.env.NODE_ENV || 'unknown',
    email: {
      configured: hasSendGridKey,
      provider: hasSendGridKey ? 'sendgrid_smtp' : 'none',
      fromConfigured: hasEmailFrom,
      replyToConfigured: hasReplyTo,
      passwordResetDefaultLocale: safeLocale,
    },
  });
}
