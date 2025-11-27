/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response(JSON.stringify({
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    nextjs: process.env.NEXT_RUNTIME || 'unknown',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}