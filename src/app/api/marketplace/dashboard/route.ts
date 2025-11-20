import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    error: 'Marketplace dashboard is currently unavailable.'
  }, { status: 503 });
}