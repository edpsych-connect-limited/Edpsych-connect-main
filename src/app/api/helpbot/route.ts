import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  // Stub implementation to prevent 404s
  return NextResponse.json({
    success: true,
    message: "HelpBot is currently undergoing maintenance. Please try again later."
  });
}
