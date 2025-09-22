import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';

// Configure Cloudinary with your credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer to Cloudinary.
 * @param {Buffer} buffer - The image file buffer from Multer.
 * @param {string} folderName - The folder in Cloudinary to store the image.
 * @returns {Promise<object>} - A promise that resolves with the upload result.
 */
async function uploadToCloudinary(buffer, folderName) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: folderName }, (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      })
      .end(buffer);
  });
}

/**
 * Uploads a product image to Cloudinary.
 * @param {Buffer} buffer - The image file buffer.
 * @returns {Promise<object>} - A promise that resolves with the upload result.
 */
export async function uploadProductImageToCloudinary(buffer) {
  try {
    const result = await uploadToCloudinary(buffer, 'ecommerce/products');
    return result;
  } catch (error) {
    console.error('Error uploading product image to Cloudinary:', error);
    throw error;
  }
}

/**
 * Uploads a profile picture to Cloudinary.
 * @param {Buffer} buffer - The image file buffer.
 * @returns {Promise<object>} - A promise that resolves with the upload result.
 */
export async function uploadProfileImageToCloudinary(buffer) {
  try {
    const result = await uploadToCloudinary(buffer, 'ecommerce/profiles');
    return result;
  } catch (error) {
    console.error('Error uploading profile image to Cloudinary:', error);
    throw error;
  }
}

/**
 * Generates an optimized URL for a given Cloudinary public ID.
 * @param {string} publicId - The public ID of the image on Cloudinary.
 * @param {object} [options={}] - Transformation options.
 * @returns {string} - The optimized image URL.
 */
export function getOptimizedImageUrl(publicId, options = {}) {
  // Use .url() to generate a URL with transformations
  return cloudinary.url(publicId, {
    fetch_format: 'auto',
    quality: 'auto',
    ...options,
  });
}