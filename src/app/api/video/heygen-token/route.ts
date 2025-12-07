
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const apiKey = process.env.HEYGEN_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'HEYGEN_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.heygen.com/v1/streaming.create_token', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('HeyGen Token Error:', data);
      return NextResponse.json(
        { error: 'Failed to generate HeyGen token', details: data },
        { status: response.status }
      );
    }

    return NextResponse.json({
      token: data.data.token,
    });

  } catch (error) {
    console.error('HeyGen Token Exception:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
