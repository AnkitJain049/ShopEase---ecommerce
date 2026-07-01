import express from 'express';
import User from '../models/UserModel.js';
import Product from '../models/ProductModel.js';
import { isAuthenticated } from '../utils/auth.js';
import { uploadProfileImage } from '../utils/multerconfig.js'; // New multer memory storage
import { uploadProfileImageToCloudinary } from '../utils/cloudinaryfunctions.js'; // New cloudinary upload function

const router = express.Router();

// Get user profile
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', isAuthenticated, uploadProfileImage.single('profilePic'), async (req, res) => {
    try {
        const { name, contactNumber } = req.body;
        const updateData = { name, contactNumber };
        
        // Find the user to get their current profilePic URL
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (req.file) {
            // Upload the new image to Cloudinary
            const uploadResult = await uploadProfileImageToCloudinary(req.file.buffer);
            updateData.profilePic = uploadResult.secure_url;

            // Check if the old profile picture is a Cloudinary URL before trying to delete it
            if (user.profilePic && user.profilePic.startsWith('http')) {
                // Extract the public ID from the old Cloudinary URL
                const urlParts = user.profilePic.split('/');
                const publicIdWithExtension = urlParts.pop(); // e.g., 'profile-123456.jpg'
                const publicId = publicIdWithExtension.split('.')[0]; // e.g., 'profile-123456'
                
                // Construct the full public ID with folder path if necessary
                const fullPublicId = `profileImages/${publicId}`;

                // Use the correct public ID for deletion
                await cloudinary.uploader.destroy(fullPublicId);
            }
        }

        // Update the user's document
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true }
        ).select('-password');

        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});
// Get user's products
router.get('/products', isAuthenticated, async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.user._id });
    res.json(products);
  } catch (error) {
    console.error('Error fetching user products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Add to wishlist
router.post('/wishlist/:productId', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;

    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ error: 'Product already in wishlist' });
    }

    user.wishlist.push(productId);
    await user.save();

    res.json({ message: 'Added to wishlist', wishlist: user.wishlist });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// Remove from wishlist
router.delete('/wishlist/:productId', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;

    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();

    res.json({ message: 'Removed from wishlist', wishlist: user.wishlist });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

// Get wishlist
router.get('/wishlist', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json(user.wishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

export default router; 