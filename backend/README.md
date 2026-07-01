# ShopEase Backend API

This is the backend API for the ShopEase React application, built with Node.js, Express, and MongoDB.

## Features

- **Authentication**: Local and Google OAuth authentication using Passport.js
- **Product Management**: CRUD operations for products with image upload
- **User Management**: Profile management and wishlist functionality
- **Payment Integration**: Razorpay payment gateway integration
- **Reviews & Ratings**: Product review system
- **AI Chatbot**: Google Gemini AI-powered customer support
- **Search & Recommendations**: TF-IDF based product search
- **File Upload**: Multer for handling image uploads

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js (Local + Google OAuth)
- **File Upload**: Multer
- **Payment**: Razorpay
- **AI**: Google Gemini AI
- **Search**: Natural.js (TF-IDF)
- **Sessions**: Express-session with MongoDB store

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Google OAuth credentials
- Razorpay account
- Google Gemini AI API key

## Installation

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your actual credentials:
   - MongoDB connection string
   - Google OAuth credentials
   - Razorpay API keys
   - Google Gemini AI API key
   - Session secret

4. **Create upload directories**:
   ```bash
   mkdir -p uploads/productImages uploads/profilePics
   ```

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your .env file).

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user
- `GET /api/auth/status` - Check authentication status

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/search/:query` - Search products

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/products` - Get user's products
- `POST /api/user/wishlist/:productId` - Add to wishlist
- `DELETE /api/user/wishlist/:productId` - Remove from wishlist
- `GET /api/user/wishlist` - Get wishlist

### Payments
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment
- `GET /api/payment/transactions` - Get user transactions

### Reviews
- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews` - Add review
- `PUT /api/reviews/:reviewId` - Update review
- `DELETE /api/reviews/:reviewId` - Delete review
- `GET /api/reviews/user/reviews` - Get user's reviews

### Chatbot
- `GET /api/chatbot/history` - Get chat history
- `POST /api/chatbot/message` - Send message to chatbot
- `DELETE /api/chatbot/history` - Clear chat history

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `SESSION_SECRET` | Secret for session encryption | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `RAZORPAY_KEY_ID` | Razorpay public key | Yes |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key | Yes |
| `GEMINI_API_KEY` | Google Gemini AI API key | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |
| `PORT` | Server port | No (default: 5000) |
| `NODE_ENV` | Environment mode | No (default: development) |

## Database Models

### User
- name, email, password, contactNumber, profilePic, wishlist

### Product
- name, description, price, sellerId, image, brand

### Transaction
- userId, productId, userName, amount, paymentId, orderId, status, date

### Review
- userId, productId, userName, rating, comment, date

### ChatHistory
- userId, conversation (array of messages with sender, text, timestamp)

## File Structure

```
backend/
├── models/           # Database models
├── routes/           # API routes
├── utils/            # Utility functions
├── uploads/          # File uploads
│   ├── productImages/
│   └── profilePics/
├── server.js         # Main server file
├── package.json      # Dependencies
└── .env             # Environment variables
```

## Security Features

- Password hashing with bcrypt
- Session-based authentication
- CORS configuration
- File upload validation
- Payment signature verification
- Input validation and sanitization

## Error Handling

The API includes comprehensive error handling with appropriate HTTP status codes and error messages for:
- Authentication failures
- Database errors
- File upload errors
- Payment verification failures
- Invalid input data

## Development Notes

- All routes return JSON responses
- File uploads are handled with Multer
- Authentication is required for protected routes
- CORS is configured for React frontend
- Sessions are stored in MongoDB
- All timestamps are automatically managed by Mongoose 