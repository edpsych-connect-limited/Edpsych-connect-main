/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  const error = new Error("Sentry test event");
  Sentry.captureException(error);
  await Sentry.flush(2000);

  return NextResponse.json(
    { ok: false, message: "Sentry test event sent" },
    { status: 500 }
  );
}
