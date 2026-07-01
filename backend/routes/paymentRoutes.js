import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Transaction from '../models/TransactionModel.js';
import Product from '../models/ProductModel.js';
import { isAuthenticated } from '../utils/auth.js';

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order
router.post('/create-order', isAuthenticated, async (req, res) => {
  try {
    const { productId, amount, currency } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: currency || 'INR',
      receipt: `order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify payment
router.post('/verify', isAuthenticated, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, productId, totalAmount } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Create transaction record
    const transaction = new Transaction({
      userId: req.user._id,
      productId: productId,
      userName: req.user.name,
      amount: totalAmount || product.price, // Use total amount including GST
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });

    await transaction.save();

    res.json({
      success: true,
      message: 'Payment verified successfully',
      transaction: transaction,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Get user transactions
router.get('/transactions', isAuthenticated, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id })
      .populate('productId')
      .sort({ date: -1 });
    
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get Razorpay key ID (public key)
router.get('/razorpay-key', (req, res) => {
  try {
    res.json({ keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error('Error fetching Razorpay key:', error);
    res.status(500).json({ error: 'Failed to fetch Razorpay key' });
  }
});

export default router; 