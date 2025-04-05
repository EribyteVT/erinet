// middleware.ts (at the root of your project)
import { NextResponse, NextRequest } from "next/server";
import { cache } from "@/app/lib/cache";

// Rate limit configuration
type RateLimitConfig = {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
};

// Define different rate limits for different API routes
const apiRateLimits: Record<string, RateLimitConfig> = {
  // our database
  "api/streams": { windowMs: 60 * 1000, maxRequests: 20 },
  "api/streamers": { windowMs: 60 * 1000, maxRequests: 10 },

  // Third-party integrations
  "api/twitch": { windowMs: 60 * 1000, maxRequests: 15 },
  "api/discord": { windowMs: 60 * 1000, maxRequests: 15 },

  // Default fallback
  default: { windowMs: 60 * 1000, maxRequests: 30 },
};

// find which config
function getRateLimitConfig(path: string): RateLimitConfig {
  // Check route
  for (const [route, config] of Object.entries(apiRateLimits)) {
    console.log(route);
    if (path.includes(`${route}`)) {
      return config;
    }
  }
  // Return default JIC
  return apiRateLimits.default;
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Only apply rate limiting to API routes
  if (!path.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Get client ip
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // Create rate limit key based on the route and identifier
  const rateLimitKey = `ratelimit:${path}:${ip}`;

  // Get rate limit config for this path
  const config = getRateLimitConfig(path);

  console.log(config);

  // Get current rate limit data from cache
  const rateLimitData = cache.get<{ count: number; timestamp: number }>(
    rateLimitKey
  );

  // Initialize response
  const response = NextResponse.next();

  // first time init
  if (!rateLimitData) {
    cache.set(
      rateLimitKey,
      { count: 1, timestamp: Date.now() },
      config.windowMs
    );

    // Set headers
    response.headers.set("X-RateLimit-Limit", config.maxRequests.toString());
    response.headers.set(
      "X-RateLimit-Remaining",
      (config.maxRequests - 1).toString()
    );
    response.headers.set(
      "X-RateLimit-Reset",
      (Date.now() + config.windowMs).toString()
    );

    return response;
  }

  // check if expired
  const elapsedMs = Date.now() - rateLimitData.timestamp;
  if (elapsedMs > config.windowMs) {
    // new windo
    cache.set(
      rateLimitKey,
      { count: 1, timestamp: Date.now() },
      config.windowMs
    );

    // Update headers
    response.headers.set("X-RateLimit-Limit", config.maxRequests.toString());
    response.headers.set(
      "X-RateLimit-Remaining",
      (config.maxRequests - 1).toString()
    );
    response.headers.set(
      "X-RateLimit-Reset",
      (Date.now() + config.windowMs).toString()
    );

    return response;
  }

  // add 1
  const newCount = rateLimitData.count + 1;
  cache.set(
    rateLimitKey,
    { count: newCount, timestamp: rateLimitData.timestamp },
    config.windowMs
  );

  // Check if exceeded
  if (newCount > config.maxRequests) {
    const retryAfterMs = config.windowMs - elapsedMs;
    const retryAfterSec = Math.ceil(retryAfterMs / 1000);

    return new NextResponse(
      JSON.stringify({
        error: "Too Many Requests",
        message: "Rate limit exceeded. Please try again later.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": retryAfterSec.toString(),
          "X-RateLimit-Limit": config.maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": (
            rateLimitData.timestamp + config.windowMs
          ).toString(),
        },
      }
    );
  }

  // all good
  response.headers.set("X-RateLimit-Limit", config.maxRequests.toString());
  response.headers.set(
    "X-RateLimit-Remaining",
    (config.maxRequests - newCount).toString()
  );
  response.headers.set(
    "X-RateLimit-Reset",
    (rateLimitData.timestamp + config.windowMs).toString()
  );

  return response;
}

// Configure which routes this middleware applies to
export const config = {
  matcher: [
    "/api/:path*", // Apply to all API routes
  ],
};
