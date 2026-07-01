import multer from 'multer';

// Configure multer to store files in memory
const memoryStorage = multer.memoryStorage();

// Multer instance for product images, but with memory storage
export const uploadProductImage = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Multer instance for profile pictures, also with memory storage
export const uploadProfileImage = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
});