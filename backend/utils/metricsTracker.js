import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOGS_DIR = path.join(__dirname, '../logs');
const SYSTEM_LOG_FILE = path.join(LOGS_DIR, 'system_metrics.jsonl');
const USER_LOG_FILE = path.join(LOGS_DIR, 'user_metrics.jsonl');

// Ensure log directory exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

/**
 * Appends a log line to a specified JSONL file and enforces a 500-line cap
 * by deleting the oldest lines from the top if the limit is exceeded.
 */
const appendAndRotateLog = (filePath, record) => {
  try {
    const logLine = JSON.stringify(record) + '\n';
    fs.appendFileSync(filePath, logLine, 'utf8');

    // Read and enforce 500-line limit
    const fileData = fs.readFileSync(filePath, 'utf8');
    const lines = fileData.trim().split('\n').filter(Boolean);
    
    if (lines.length > 500) {
      // Keep only the most recent 500 lines (the end of the file)
      const rotatedLines = lines.slice(-500);
      fs.writeFileSync(filePath, rotatedLines.join('\n') + '\n', 'utf8');
    }
  } catch (error) {
    console.error(`Failed to write or rotate logs in ${filePath}:`, error);
  }
};

/**
 * Reads logs from a JSONL file, returning them as objects in reverse chronological order.
 */
const readLogFile = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const fileData = fs.readFileSync(filePath, 'utf8');
    const lines = fileData.trim().split('\n').filter(Boolean);
    
    return lines
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .reverse(); // Newest logs first
  } catch (error) {
    console.error(`Failed to read log file at ${filePath}:`, error);
    return [];
  }
};

/**
 * Tracks server-side system processing metrics to a local file.
 */
export const trackMetric = (url, email, status, duration) => {
  const record = {
    timestamp: new Date(),
    url,
    email: email || 'Guest',
    status, // 'HIT' | 'MISS'
    duration // in milliseconds
  };
  appendAndRotateLog(SYSTEM_LOG_FILE, record);
};

/**
 * Tracks browser client-side user roundtrip metrics to a local file.
 */
export const trackUserMetric = (url, email, status, duration) => {
  const record = {
    timestamp: new Date(),
    url,
    email: email || 'Guest',
    status, // 'HIT' | 'MISS'
    duration // in milliseconds
  };
  appendAndRotateLog(USER_LOG_FILE, record);
};

/**
 * Computes summary statistics from file-persisted logs.
 */
export const getMetrics = () => {
  const systemLogs = readLogFile(SYSTEM_LOG_FILE);
  const userLogs = readLogFile(USER_LOG_FILE);
  
  const totalRequests = systemLogs.length;
  
  // Calculate system latencies
  const systemHits = systemLogs.filter(l => l.status === 'HIT').length;
  const hitRate = totalRequests ? Math.round((systemHits / totalRequests) * 100) : 0;
  
  const hitLogs = systemLogs.filter(l => l.status === 'HIT');
  const missLogs = systemLogs.filter(l => l.status === 'MISS');
  
  const avgHitTime = hitLogs.length
    ? parseFloat((hitLogs.reduce((acc, l) => acc + l.duration, 0) / hitLogs.length).toFixed(2))
    : 0;
    
  const avgMissTime = missLogs.length
    ? parseFloat((missLogs.reduce((acc, l) => acc + l.duration, 0) / missLogs.length).toFixed(2))
    : 0;

  // Calculate user latencies
  const userHitLogs = userLogs.filter(l => l.status === 'HIT');
  const userMissLogs = userLogs.filter(l => l.status === 'MISS');

  const userAvgHitTime = userHitLogs.length
    ? parseFloat((userHitLogs.reduce((acc, l) => acc + l.duration, 0) / userHitLogs.length).toFixed(2))
    : 0;

  const userAvgMissTime = userMissLogs.length
    ? parseFloat((userMissLogs.reduce((acc, l) => acc + l.duration, 0) / userMissLogs.length).toFixed(2))
    : 0;

  return {
    hitRate,
    avgHitTime,
    avgMissTime,
    userAvgHitTime,
    userAvgMissTime,
    totalRequests,
    systemLogs,
    userLogs
  };
};
