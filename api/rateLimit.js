// rateLimit.js — simple in-memory rate limiter per IP

const buckets = new Map(); // key: IP, value: { count, resetTime }

export function checkRateLimit(ip, max, windowSec) {
  const now = Date.now();
  const entry = buckets.get(ip) || {
    count: 0,
    resetTime: now + windowSec * 1000,
  };

  if (now > entry.resetTime) {
    entry.count = 0;
    entry.resetTime = now + windowSec * 1000;
  }

  entry.count++;
  buckets.set(ip, entry);

  const remaining = max - entry.count;
  return { allowed: entry.count <= max, remaining, reset: entry.resetTime };
}
