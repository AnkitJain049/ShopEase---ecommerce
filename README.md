# ShopEase - Production Ready E-commerce Platform

A full-stack e-commerce application with React frontend and Node.js backend.

## 🚀 Quick Start

### Development Mode

1. **Backend Setup:**
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Edit .env file with your configuration
   npm run dev
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   # Create .env.development file with VITE_API_BASE_URL=http://localhost:5000
   npm run dev
   ```

### Production Mode

1. **Backend Deployment:**
   ```bash
   cd backend
   # Set NODE_ENV=production in your environment
   # Update .env with production values
   npm start
   ```

2. **Frontend Deployment:**
   ```bash
   cd frontend
   # Create .env.production with your production API URL
   npm run build
   # Deploy the 'dist' folder to your hosting service
   ```

## 🔧 Environment Configuration

### Backend (.env)
```env
# Environment Configuration
NODE_ENV=development  # Change to 'production' for deployment

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/shopease_react

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Razorpay Configuration
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Google Gemini AI Configuration
GEMINI_API_KEY=your-gemini-api-key

# Frontend URL (for CORS and OAuth redirects)
FRONTEND_URL=http://localhost:5173

# Server Configuration
PORT=5000
```

### Frontend (.env.development / .env.production)
```env
# Development
VITE_API_BASE_URL=http://localhost:5000

# Production
VITE_API_BASE_URL=https://your-backend-domain.com
```

## 🔄 Switching Between Environments

### Development → Production
1. Set `NODE_ENV=production` in backend
2. Update `FRONTEND_URL` to your production frontend URL
3. Update `MONGODB_URI` to your production database
4. Set `VITE_API_BASE_URL` to your production backend URL in frontend

### Production → Development
1. Set `NODE_ENV=development` in backend
2. Update `FRONTEND_URL` to `http://localhost:5173`
3. Update `MONGODB_URI` to your local database
4. Set `VITE_API_BASE_URL` to `http://localhost:5000` in frontend

## 🛡️ Security Features

- **Development**: Relaxed CORS, non-secure cookies, detailed error messages
- **Production**: Strict CORS, secure cookies, sanitized error messages

## 📦 Available Scripts

### Backend
- `npm run dev` - Start development server
- `npm start` - Start production server

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development (with sourcemaps)

## 🌐 Deployment

### Backend Deployment
- Set `NODE_ENV=production`
- Configure production database URL
- Set secure session secret
- Configure production frontend URL

### Frontend Deployment
- Set `VITE_API_BASE_URL` to production backend URL
- Run `npm run build`
- Deploy `dist` folder to your hosting service

## 📝 Notes

- The application automatically adjusts security settings based on `NODE_ENV`
- CORS is configured to allow only the specified frontend URL in production
- Session cookies are secure only in production mode
- Error messages are sanitized in production to prevent information leakage 