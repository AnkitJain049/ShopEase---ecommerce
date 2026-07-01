import express from 'express';
import Review from '../models/reviewModel.js';
import Product from '../models/ProductModel.js';
import { isAuthenticated } from '../utils/auth.js';

const router = express.Router();

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .populate('userId', 'name profilePic')
      .sort({ date: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Add a review
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      userId: req.user._id,
      productId: productId
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    const review = new Review({
      userId: req.user._id,
      productId: productId,
      userName: req.user.name,
      rating: parseInt(rating),
      comment: comment
    });

    await review.save();

    // Populate user info for response
    await review.populate('userId', 'name profilePic');

    res.status(201).json(review);
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
});

// Update a review
router.put('/:reviewId', isAuthenticated, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this review' });
    }

    review.rating = parseInt(rating);
    review.comment = comment;
    await review.save();

    await review.populate('userId', 'name profilePic');
    res.json(review);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Delete a review
router.delete('/:reviewId', isAuthenticated, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(req.params.reviewId);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Get user's reviews
router.get('/user/reviews', isAuthenticated, async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .populate('productId', 'name image')
      .sort({ date: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

export default router; 