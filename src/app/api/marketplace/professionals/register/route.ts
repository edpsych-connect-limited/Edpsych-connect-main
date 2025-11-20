import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    error: 'Registration service is currently unavailable.'
  }, { status: 503 });
}