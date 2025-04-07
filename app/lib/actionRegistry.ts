import { cache } from "@/app/lib/cache";
import { headers } from "next/headers";
import { errorResponse, NormalizedResponse } from "./api-utils";

// Rate limit configuration
export type RateLimitConfig = {
  windowMs: number; // Time in milliseconds
  maxRequests: number; // Maximum requests per window
};

// Default configuration by action category
const DEFAULT_RATE_LIMITS: Record<string, RateLimitConfig> = {
  // all 1 minute
  stream: { windowMs: 60 * 1000, maxRequests: 20 }, // Create, Read, Update, Delete streams (different from website gets)
  streamer: { windowMs: 60 * 1000, maxRequests: 5 }, //get streamer, update twitch/actions
  twitch: { windowMs: 60 * 1000, maxRequests: 10 }, // Twitch integrations
  discord: { windowMs: 60 * 1000, maxRequests: 10 }, // Discord integrations
  default: { windowMs: 60 * 1000, maxRequests: 30 }, // Default
};

// Store for registered actions and their rate limit configs
const actionConfigs: Map<string, RateLimitConfig> = new Map();

async function checkRateLimit(
  actionName: string
): Promise<{ limited: boolean; message?: string; resetTime?: number }> {
  const headersObj = headers();

  // Get client IP
  const ip =
    (await headersObj).get("x-forwarded-for")?.split(",")[0] ||
    (await headersObj).get("x-real-ip") ||
    "unknown";

  // Get config for this action
  const config = actionConfigs.get(actionName) || DEFAULT_RATE_LIMITS.default;

  // Create a unique key for this action and IP
  const key = `action-ratelimit:${actionName}:${ip}`;

  // Get current state from cache
  const rateLimit = cache.get<{ count: number; reset: number }>(key);

  // If no existing rate limit data
  if (!rateLimit) {
    cache.set(
      key,
      { count: 1, reset: Date.now() + config.windowMs },
      config.windowMs
    );
    return { limited: false };
  }

  // Check if the time window has expired
  if (Date.now() > rateLimit.reset) {
    cache.set(
      key,
      { count: 1, reset: Date.now() + config.windowMs },
      config.windowMs
    );
    return { limited: false };
  }

  // Increment the counter
  const newCount = rateLimit.count + 1;
  cache.set(key, { count: newCount, reset: rateLimit.reset }, config.windowMs);

  // Check if rate limit exceeded
  if (newCount > config.maxRequests) {
    const resetTime = rateLimit.reset;
    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
    return {
      limited: true,
      message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
      resetTime,
    };
  }

  return { limited: false };
}

export function registerAction(
  actionName: string,
  category: keyof typeof DEFAULT_RATE_LIMITS = "default",
  config?: RateLimitConfig
): void {
  actionConfigs.set(
    actionName,
    config || DEFAULT_RATE_LIMITS[category] || DEFAULT_RATE_LIMITS.default
  );
}

export function createRateLimitedAction<T, Args extends any[]>(
  actionName: string,
  actionFn: (...args: Args) => Promise<T>,
  category: keyof typeof DEFAULT_RATE_LIMITS = "default",
  config?: RateLimitConfig
): (...args: Args) => Promise<T> {
  // Register the action with its rate limit config
  registerAction(actionName, category, config);

  // Return a wrapped function that applies rate limiting
  return async (...args: Args): Promise<T> => {
    const { limited, message } = await checkRateLimit(actionName);

    if (limited) {
      throw new Error(message);
    }

    return await actionFn(...args);
  };
}

export function createRateLimitedStructuredAction<Args extends any[]>(
  actionName: string,
  actionFn: (...args: Args) => Promise<NormalizedResponse<any>>,
  category: keyof typeof DEFAULT_RATE_LIMITS = "default",
  config?: RateLimitConfig
): (...args: Args) => Promise<NormalizedResponse<any>> {
  // Register the action with its rate limit config
  registerAction(actionName, category, config);

  // Return a wrapped function that applies rate limiting
  return async (...args: Args): Promise<NormalizedResponse<any>> => {
    const { limited, message } = await checkRateLimit(actionName);

    if (limited) {
      // Return error in the expected format instead of throwing
      return errorResponse("RATE LIMIT");
    }

    return await actionFn(...args);
  };
}
