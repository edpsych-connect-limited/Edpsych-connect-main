import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'pending',
    verification_status: 'UNVERIFIED'
  });
}