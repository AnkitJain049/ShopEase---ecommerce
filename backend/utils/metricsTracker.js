const logs = [];
const maxLogs = 50;

/**
 * Tracks request metrics including endpoints, user emails, cache hit/miss status, and durations.
 */
export const trackMetric = (url, email, status, duration) => {
  logs.unshift({
    timestamp: new Date(),
    url,
    email: email || 'Guest',
    status, // 'HIT' | 'MISS'
    duration // in milliseconds
  });
  
  if (logs.length > maxLogs) {
    logs.pop();
  }
};

/**
 * Computes summary statistics and logs for the admin dashboard.
 */
export const getMetrics = () => {
  const totalRequests = logs.length;
  const hits = logs.filter(l => l.status === 'HIT').length;
  const hitRate = totalRequests ? Math.round((hits / totalRequests) * 100) : 0;
  
  const hitLogs = logs.filter(l => l.status === 'HIT');
  const missLogs = logs.filter(l => l.status === 'MISS');
  
  const avgHitTime = hitLogs.length
    ? parseFloat((hitLogs.reduce((acc, l) => acc + l.duration, 0) / hitLogs.length).toFixed(2))
    : 0;
    
  const avgMissTime = missLogs.length
    ? parseFloat((missLogs.reduce((acc, l) => acc + l.duration, 0) / missLogs.length).toFixed(2))
    : 0;

  return {
    hitRate,
    avgHitTime,
    avgMissTime,
    totalRequests,
    logs
  };
};
