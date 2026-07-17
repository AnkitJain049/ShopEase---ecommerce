const rateLimitMap = new Map();

/**
 * Custom, lightweight in-memory rate-limiting middleware.
 * Mitigates API brute-force and DDoS spam vectors without external npm dependencies.
 * 
 * @param {number} limit Max requests allowed within the window
 * @param {number} windowMs Time window in milliseconds (default: 15 minutes)
 */
export const rateLimiter = (limit = 100, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();

    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, []);
    }

    // Keep only timestamps that fall within the current sliding window
    const requests = rateLimitMap.get(ip).filter(timestamp => now - timestamp < windowMs);
    requests.push(now);
    rateLimitMap.set(ip, requests);

    // If requests exceed the rate limit limit
    if (requests.length > limit) {
      console.warn(`[Rate Limit] Blocked request from IP ${ip} - Exceeded threshold: ${limit}`);
      return res.status(429).json({ 
        error: 'Too many requests from this IP. Please try again in 15 minutes.' 
      });
    }

    next();
  };
};
