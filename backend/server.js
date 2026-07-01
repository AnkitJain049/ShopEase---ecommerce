import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from "cors";
import methodOverride from 'method-override';
import path from 'path';
import { fileURLToPath } from 'url';

// Import custom modules
import { connectDB } from "./utils/database.js";
import { isAuthenticated } from "./utils/auth.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const isDevelopment = process.env.NODE_ENV === 'development';

// Validate required env variables early
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set in environment variables.');
  process.exit(1);
}

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration based on environment
app.use(cors({
  origin: isDevelopment 
    ? (process.env.FRONTEND_URL || 'http://localhost:5173')
    : process.env.FRONTEND_URL,
  credentials: true
}));

// Cookie parser for httpOnly JWT cookie support
app.use(cookieParser());

// Method override for PUT/DELETE requests
app.use(methodOverride('_method'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session-based check removed; use /api/auth/status protected by JWT instead

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', isAuthenticated, productRoutes);
app.use('/api/user', isAuthenticated, userRoutes);
app.use('/api/payment', isAuthenticated, paymentRoutes);
app.use('/api/reviews', isAuthenticated, reviewRoutes);
app.use('/api/chatbot', isAuthenticated, chatbotRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ShopEase API is running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Don't leak error details in production
  const errorMessage = isDevelopment ? err.message : 'Something went wrong!';
  
  res.status(500).json({ error: errorMessage });
});

// Connect to database and start server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch(err => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
}); 