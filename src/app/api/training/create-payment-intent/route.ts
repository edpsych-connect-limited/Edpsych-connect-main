import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    error: 'Payment service unavailable'
  }, { status: 503 });
}