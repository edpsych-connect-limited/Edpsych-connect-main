/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    error: 'Marketplace dashboard is currently unavailable.'
  }, { status: 503 });
}