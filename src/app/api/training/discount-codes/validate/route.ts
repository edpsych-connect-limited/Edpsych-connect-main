import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    valid: false,
    message: 'Discount code validation service unavailable'
  });
}