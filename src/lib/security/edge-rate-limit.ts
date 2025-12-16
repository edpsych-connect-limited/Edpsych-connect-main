import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getClientIp(request: NextRequest): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  return "unknown";
}

function isRscOrServerActionRequest(request: NextRequest): "action" | "rsc" | null {
  // Next.js uses these headers for Server Components / Server Actions.
  // These are the high-signal indicators we can use without impacting normal page loads.
  const nextAction = request.headers.get("next-action");
  if (nextAction) return "action";

  const rsc = request.headers.get("rsc");
  if (rsc) return "rsc";

  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("text/x-component")) return "rsc";

  return null;
}

function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  // Avoid repeated instantiation across requests.
  // (In Edge, module scope is reused within the isolate.)
  const g = globalThis as unknown as { __edpsychRedis?: Redis };
  if (!g.__edpsychRedis) {
    g.__edpsychRedis = new Redis({ url, token });
  }

  return g.__edpsychRedis;
}

function toInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

export async function maybeRateLimitRsc(request: NextRequest): Promise<NextResponse | null> {
  // Feature flag: default ON in production if Upstash is configured.
  const enabledEnv = process.env.EDGE_RSC_RATE_LIMIT_ENABLED;
  if (enabledEnv === "0" || enabledEnv === "false") return null;

  const kind = isRscOrServerActionRequest(request);
  if (!kind) return null;

  const redis = getRedisClient();
  if (!redis) return null;

  const ip = getClientIp(request);

  const windowSeconds = toInt(process.env.EDGE_RSC_RATE_LIMIT_WINDOW_SECONDS, 60);
  const defaultLimit = kind === "action" ? 60 : 120;
  const limit = toInt(
    kind === "action"
      ? process.env.EDGE_SERVER_ACTIONS_RATE_LIMIT
      : process.env.EDGE_RSC_RATE_LIMIT,
    defaultLimit,
  );

  // Keyed by IP + request class. Keep it short to minimize Redis payload sizes.
  const key = `rl:${kind}:${ip}`;

  // Basic fixed window: INCR + EXPIRE.
  // This is intentionally simple (and edge-safe) as a first-line mitigation.
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }

  if (count > limit) {
    const retryAfter = Math.max(1, windowSeconds);

    return NextResponse.json(
      {
        error: "Too Many Requests",
        code: "RATE_LIMITED",
        kind,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "Cache-Control": "no-store",
        },
      },
    );
  }

  return null;
}
