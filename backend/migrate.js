import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Assuming your Product model is at this path
import Product from './models/ProductModel.js'; 

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const migrateImages = async () => {
    await connectDB();

    console.log('Starting image migration...');

    try {
        // Find all products that still have local image paths
        const products = await Product.find({ 
            image: { 
                $exists: true, 
                $not: /^(http|https)/ 
            } 
        });

        if (products.length === 0) {
            console.log('No local images found to migrate. Exiting.');
            mongoose.connection.close();
            return;
        }

        console.log(`Found ${products.length} products with local images.`);

        for (const product of products) {
            // Construct the local file path
            const filePath = path.join(__dirname, 'uploads', 'productImages', product.image);
            
            try {
                // Check if the local file exists
                await fs.access(filePath);
            } catch (error) {
                console.warn(`File not found for product ID ${product._id}: ${filePath}. Skipping.`);
                continue; // Skip to the next product if the file doesn't exist
            }

            console.log(`Uploading image for product ${product._id} from ${filePath}`);

            try {
                // Upload the local image to Cloudinary
                const uploadResult = await cloudinary.uploader.upload(filePath, {
                    folder: 'shopease/productImages' // The target folder in Cloudinary
                });
                
                // Update the product's image attribute with the new URL
                product.image = uploadResult.secure_url;
                await product.save();
                
                console.log(`Successfully migrated image for product ${product._id}. New URL: ${product.image}`);
                
                // Optional: Delete the local file after a successful migration
                await fs.unlink(filePath);
                console.log(`Deleted local file: ${filePath}`);

            } catch (uploadError) {
                console.error(`Error uploading image for product ${product._id}:`, uploadError);
            }
        }

        console.log('Migration complete!');
    } catch (dbError) {
        console.error('Database query error:', dbError);
    } finally {
        mongoose.connection.close();
    }
};

// Use an IIFE (Immediately Invoked Function Expression) to handle the top-level await
(async () => {
    // __dirname and __filename are not available in ES Modules by default.
    // If you're using ES Modules, you'll need to define them.
    const __filename = import.meta.url;
    const __dirname = path.dirname(new URL(__filename).pathname);
    
    // Call the main migration function
    migrateImages();
})();