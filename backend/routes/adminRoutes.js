import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/UserModel.js';
import Transaction from '../models/TransactionModel.js';
import { getMetrics, trackUserMetric } from '../utils/metricsTracker.js';
import { isAuthenticated } from '../utils/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOGS_DIR = path.join(__dirname, '../logs');

const router = express.Router();

/**
 * GET /api/admin/download-logs
 * Serves the raw log file directly to the client browser as a download.
 */
router.get('/download-logs', isAuthenticated, async (req, res) => {
  try {
    const adminEmail = req.user.email;
    if (adminEmail !== 'admin@gmail.com' && adminEmail !== 'ankit1@gmail.com') {
      return res.status(403).json({ error: 'Access Denied: Administrator privileges required.' });
    }

    const { type } = req.query;
    if (type !== 'system' && type !== 'user') {
      return res.status(400).json({ error: 'Invalid log type. Use type=system or type=user.' });
    }

    const fileName = type === 'system' ? 'system_metrics.jsonl' : 'user_metrics.jsonl';
    const filePath = path.join(LOGS_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: `Log file ${fileName} does not exist on disk yet.` });
    }

    // Read the JSONL file and convert it to a standard pretty-printed JSON Array
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.trim().split('\n').filter(Boolean);
    const logsArray = lines.map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(Boolean);

    const downloadName = type === 'system' ? 'system_metrics.json' : 'user_metrics.json';
    res.setHeader('Content-Type', 'application/json');
    res.attachment(downloadName);
    res.send(JSON.stringify(logsArray, null, 2));
  } catch (error) {
    console.error('Error downloading log file:', error);
    res.status(500).json({ error: 'Failed to download metrics log file.' });
  }
});

/**
 * POST /api/admin/report-latency
 * Logs client-side user roundtrip query durations.
 */
router.post('/report-latency', isAuthenticated, async (req, res) => {
  try {
    const { url, duration, status } = req.body;
    if (!url || duration === undefined || !status) {
      return res.status(400).json({ error: 'Missing metric fields.' });
    }

    trackUserMetric(url, req.user?.email, status, duration);
    res.json({ success: true });
  } catch (error) {
    console.error('Error logging client latency:', error);
    res.status(500).json({ error: 'Failed to record user latency metrics.' });
  }
});

/**
 * GET /api/admin/metrics
 * Resolves current system metrics (cache hit rate, request durations), registered shopper records,
 * and recent purchase logs.
 * Restricted to: admin@gmail.com and seed account ankit1@gmail.com
 */
router.get('/metrics', isAuthenticated, async (req, res) => {
  try {
    const adminEmail = req.user.email;
    if (adminEmail !== 'admin@gmail.com' && adminEmail !== 'ankit1@gmail.com') {
      return res.status(403).json({ error: 'Access Denied: Administrator privileges required.' });
    }

    // 1. Fetch Users
    const users = await User.find({}, 'name email contactNumber profilePic createdAt').sort({ createdAt: -1 });

    // 2. Fetch Orders
    const transactions = await Transaction.find()
      .populate('productId', 'name price brand')
      .sort({ date: -1 });

    // 3. Fetch System Cache Metrics
    const metrics = getMetrics();

    res.json({
      success: true,
      users,
      transactions,
      metrics
    });
  } catch (error) {
    console.error('Admin metrics error:', error);
    res.status(500).json({ error: 'Failed to retrieve administrative diagnostics.' });
  }
});

export default router;
