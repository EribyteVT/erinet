import { NextRequest, NextResponse } from "next/server";
import { cache } from "@/app/lib/cache";

// Rate limit configuration
type RateLimitConfig = {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
};

// RATE LIMIT SETTINGS
const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 requests per minute
};

// maybe too lenient, fuck with more in future
const apiRouteConfigs: Record<string, RateLimitConfig> = {
  "/api/streams": { windowMs: 60 * 1000, maxRequests: 30 },
  "/api/streamers": { windowMs: 60 * 1000, maxRequests: 10 },
  "/api/twitch": { windowMs: 60 * 1000, maxRequests: 10 }, // Stricter for third-party API calls
  "/api/discord": { windowMs: 60 * 1000, maxRequests: 10 },
};

export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = defaultConfig
) {
  // Get client IP or use a fallback
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const path = new URL(request.url).pathname;
  const routeConfig = path.startsWith("/api/")
    ? Object.entries(apiRouteConfigs).find(([route]) =>
        path.startsWith(route)
      )?.[1] || defaultConfig
    : defaultConfig;

  const mergedConfig = { ...config, ...routeConfig };

  // Create a unique key per IP and route
  const key = `rate-limit:${ip}:${path}`;

  // Get current state from cache
  const rateLimit = cache.get<{ count: number; reset: number }>(key);

  //nothin in cache
  if (!rateLimit) {
    cache.set(
      key,
      { count: 1, reset: Date.now() + mergedConfig.windowMs },
      mergedConfig.windowMs
    );
    return { limited: false, remaining: mergedConfig.maxRequests - 1 };
  }

  // expiry check
  if (Date.now() > rateLimit.reset) {
    cache.set(
      key,
      { count: 1, reset: Date.now() + mergedConfig.windowMs },
      mergedConfig.windowMs
    );
    return { limited: false, remaining: mergedConfig.maxRequests - 1 };
  }

  // Increment request count
  const newCount = rateLimit.count + 1;
  const remaining = Math.max(0, mergedConfig.maxRequests - newCount);
  const limited = newCount > mergedConfig.maxRequests;

  cache.set(
    key,
    { count: newCount, reset: rateLimit.reset },
    mergedConfig.windowMs
  );

  return { limited, remaining };
}

export function rateLimitResponse(retryAfter: number) {
  return NextResponse.json(
    { error: "Too many requests", message: "Please try again later" },
    {
      status: 429,
      headers: {
        "Retry-After": retryAfter.toString(),
        "X-RateLimit-Reset": new Date(
          Date.now() + retryAfter * 1000
        ).toUTCString(),
      },
    }
  );
}
