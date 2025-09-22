import express from 'express';
import Product from '../models/ProductModel.js';
import { isAuthenticated } from '../utils/auth.js';
import { searchProducts } from '../utils/recommendation.js';
import { uploadProductImage } from '../utils/multerconfig.js'; // The new multer memory storage config
import { uploadProductImageToCloudinary } from '../utils/cloudinaryfunctions.js'; // The new cloudinary upload functionimport fs from 'fs';

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('sellerId', 'name');
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Search products (must come before /:id route)
router.post('/', isAuthenticated, uploadProductImage.single('image'), async (req, res) => {
  try {
    const { name, description, price, brand } = req.body;
    let image = null;
    if (req.file) {
      // New way: uploads directly from memory buffer
      const uploadResult = await uploadProductImageToCloudinary(req.file.buffer);
      image = uploadResult.secure_url;
      // You may also want to save the public_id in case you need to delete the image later
      // const publicId = uploadResult.public_id;
    }

    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      brand,
      sellerId: req.user._id,
      image,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('sellerId', 'name');
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product
router.post('/', isAuthenticated, uploadProductImage.single('image'), async (req, res) => {
  try {
    const { name, description, price, brand } = req.body;
    let image = null;
    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, { folder: 'shopease/productImages' });
      image = upload.secure_url;
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }

    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      brand,
      sellerId: req.user._id,
      image
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', isAuthenticated, uploadProductImage.single('image'), async (req, res) => {
  try {
    const { name, description, price, brand } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this product' });
    }

    const updateData = { name, description, price: parseFloat(price), brand };
    if (req.file) {
      // New way: uploads directly from memory buffer
      const uploadResult = await uploadProductImageToCloudinary(req.file.buffer);
      updateData.image = uploadResult.secure_url;
      // You might also want to delete the old image from Cloudinary here
      // if (product.image) {
      //   // Extract public_id from the old image URL and delete it
      //   const publicId = product.image.split('/').pop().split('.')[0];
      //   await cloudinary.uploader.destroy(publicId);
      // }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router; 