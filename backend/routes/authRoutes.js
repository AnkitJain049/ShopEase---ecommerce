import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/UserModel.js';
import { isAuthenticated, generateJwtForUser, setAuthCookie, clearAuthCookie } from '../utils/auth.js';

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, contactNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      contactNumber,
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully', userId: user._id });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // Guard against legacy plaintext passwords from old Google OAuth users
    if (!user.password || !user.password.startsWith('$2')) {
      return res.status(401).json({ error: 'Password not set for this account. Please reset your password.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateJwtForUser(user);
    setAuthCookie(res, token);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    const isDevelopment = (process.env.NODE_ENV === 'development');
    res.status(500).json({ error: isDevelopment ? `Login failed: ${err.message}` : 'Login failed' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  return res.json({ message: 'Logout successful' });
});

// Google OAuth routes
// Note: Google OAuth via passport has been removed in JWT migration

// Get current user
router.get('/me', isAuthenticated, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      profilePic: req.user.profilePic,
      contactNumber: req.user.contactNumber
    }
  });
});

// Check authentication status
router.get('/status', isAuthenticated, (req, res) => {
  res.json({
    authenticated: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      profilePic: req.user.profilePic
    }
  });
});

// Get user ID for chatbot
router.get('/chatbot-user-id', isAuthenticated, (req, res) => {
  res.json({ userId: req.user._id.toString() });
});

export default router; 