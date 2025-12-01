/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Apply compression to the response if supported
 * This is a simplified version compatible with Edge Runtime
 */
export async function applyCompression(
  _request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  // In Edge Runtime, we can't use compression libraries
  // We rely on Vercel's automatic compression
  return response;
}
