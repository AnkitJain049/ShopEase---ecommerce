const cacheMap = new Map();

/**
 * Custom in-memory caching middleware.
 * Caches API JSON responses in Node.js heap memory to bypass database reads
 * and reduce query latency to sub-millisecond ranges.
 * 
 * @param {number} durationSeconds Number of seconds to cache the response (default: 60 seconds)
 */
export const cacheMiddleware = (durationSeconds = 60) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl || req.url;
    const cached = cacheMap.get(key);
    const now = Date.now();

    // If cache hit and not expired, return cached response directly
    if (cached && now - cached.timestamp < durationSeconds * 1000) {
      console.log(`[Cache Hit] Serving response for: ${key}`);
      return res.json(cached.data);
    }

    // Intercept res.json to capture response payload
    const originalJson = res.json;
    res.json = function (body) {
      // Check if response is successful before caching
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheMap.set(key, {
          timestamp: Date.now(),
          data: body
        });
      }
      return originalJson.call(this, body);
    };

    next();
  };
};

/**
 * Utility to clear the cache map (useful when products are added/updated/deleted).
 */
export const clearCache = () => {
  console.log('[Cache] Clearing all cached responses');
  cacheMap.clear();
};
