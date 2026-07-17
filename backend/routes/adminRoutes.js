import express from 'express';
import User from '../models/UserModel.js';
import Transaction from '../models/TransactionModel.js';
import { getMetrics, trackUserMetric } from '../utils/metricsTracker.js';
import { isAuthenticated } from '../utils/auth.js';

const router = express.Router();

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
