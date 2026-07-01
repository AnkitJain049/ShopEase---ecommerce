import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Models
import User from './models/UserModel.js';
import Product from './models/ProductModel.js';
import Transaction from './models/TransactionModel.js';
import Review from './models/reviewModel.js';

// Setup environment configs
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI is not defined in environment configurations.");
  process.exit(1);
}

// Dicebear avatars to make layout profiles look cute
const AVATAR_STYLES = ['adventurer', 'avataaars', 'bottts', 'pixel-art', 'lorelei'];

const goodComments = [
  "Amazing product! Completely exceeded my expectations.",
  "Very fast delivery, packaging was top-notch.",
  "Highly recommended. Extremely high quality.",
  "Excellent value for money. Will definitely buy again.",
  "Works perfectly. Design is sleek and feels very premium.",
  "The build quality is solid, clean lines, and does exactly what it says.",
  "Very happy with my purchase. Support was also very helpful!",
  "Great customer service, product matches descriptions perfectly."
];

const midComments = [
  "Decent product for the price. Not bad.",
  "It works fine, but shipping took longer than expected.",
  "Okay product. Has some minor issues but acceptable.",
  "Average quality. Does the job but nothing extraordinary.",
  "Satisfied with this, but might look for alternatives next time."
];

async function seed() {
  console.log("Connecting to MongoDB Database...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected successfully!");

  console.log("Cleaning up previous seeded data to ensure database integrity...");
  // Find all user IDs for shoppers seeded previously
  const existingSeedUsers = await User.find({ email: { $regex: /^shopper[0-9]+@shopease\.com$/ } });
  const seedUserIds = existingSeedUsers.map(u => u._id);
  
  if (seedUserIds.length > 0) {
    console.log(`Found ${seedUserIds.length} previous seed users. Removing transactions and reviews...`);
    await Transaction.deleteMany({ userId: { $in: seedUserIds } });
    await Review.deleteMany({ userId: { $in: seedUserIds } });
    await User.deleteMany({ _id: { $in: seedUserIds } });
    console.log("Cleanup complete!");
  } else {
    console.log("No previous seed users found. Database is clean.");
  }

  console.log("Fetching existing products...");
  const dbProducts = await Product.find({});
  if (dbProducts.length === 0) {
    console.log("❌ No products found in database! Please list some products first before running the seed script.");
    mongoose.connection.close();
    process.exit(0);
  }
  console.log(`Found ${dbProducts.length} products to map transactions/reviews to.`);

  console.log("Hashing default password 'password123'...");
  const hashedPassword = await bcrypt.hash("password123", 10);

  console.log("Generating 50 sample users...");
  const usersToInsert = [];
  for (let i = 1; i <= 50; i++) {
    const randomAvatarStyle = AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
    usersToInsert.push({
      name: `Sample Shopper ${i}`,
      email: `shopper${i}@shopease.com`,
      password: hashedPassword,
      contactNumber: `98765${String(10000 + i).slice(1)}`,
      profilePic: `https://api.dicebear.com/7.x/${randomAvatarStyle}/svg?seed=shopper${i}`
    });
  }

  // Insert Users
  console.log("Inserting users into DB...");
  const createdUsers = await User.insertMany(usersToInsert);
  console.log(`Successfully created ${createdUsers.length} sample users.`);

  const transactionsToInsert = [];
  const reviewsToInsert = [];

  console.log("Simulating random purchases and reviews for each user...");
  for (const user of createdUsers) {
    // Select between 2 and 5 random products for this user
    const purchaseCount = Math.floor(Math.random() * 4) + 2; 
    const selectedProducts = [...dbProducts]
      .sort(() => 0.5 - Math.random())
      .slice(0, purchaseCount);

    for (const product of selectedProducts) {
      // Simulate Order / Payment Dates in the past 30 days
      const daysAgo = Math.floor(Math.random() * 30);
      const transactionDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      const paymentId = `pay_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
      const orderId = `order_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

      // 1. Transaction
      transactionsToInsert.push({
        userId: user._id,
        productId: product._id,
        userName: user.name,
        amount: product.price,
        paymentId,
        orderId,
        status: 'successful',
        date: transactionDate
      });

      // 2. Review Comments
      const rating = Math.floor(Math.random() * 3) + 3; // Random 3 to 5 stars
      const commentsPool = rating >= 4 ? goodComments : midComments;
      const comment = commentsPool[Math.floor(Math.random() * commentsPool.length)];

      reviewsToInsert.push({
        userId: user._id,
        productId: product._id,
        userName: user.name,
        rating,
        comment,
        date: transactionDate
      });
    }
  }

  console.log(`Inserting ${transactionsToInsert.length} simulated transactions...`);
  await Transaction.insertMany(transactionsToInsert);

  console.log(`Inserting ${reviewsToInsert.length} customer reviews...`);
  await Review.insertMany(reviewsToInsert);

  console.log("\n🎉 Seeding Completed Successfully!");
  console.log(`Created: \n- 50 Users\n- ${transactionsToInsert.length} Orders\n- ${reviewsToInsert.length} Reviews`);

  mongoose.connection.close();
  console.log("Database connection closed cleanly.");
}

seed().catch(err => {
  console.error("Fatal Error running seed script:", err);
  mongoose.connection.close();
  process.exit(1);
});
