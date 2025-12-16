/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 *
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import type { NextRequest } from "next/server";
import { proxy } from "./src/proxy";
import { maybeRateLimitRsc } from "./src/lib/security/edge-rate-limit";

export async function middleware(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();

  // Defense-in-depth for RSC/Server Actions: limit suspiciously high request rates.
  // Only activates when Upstash Redis env vars are configured.
  const rateLimited = await maybeRateLimitRsc(request);
  if (rateLimited) {
    rateLimited.headers.set("x-request-id", requestId);
    return rateLimited;
  }

  const response = await proxy(request);
  response.headers.set("x-request-id", requestId);
  return response;
}

// Keep middleware off static assets and common image types.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
