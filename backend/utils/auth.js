import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

// Create a JWT for a user
export const generateJwtForUser = (user) => {
  const payload = {
    sub: user._id.toString(),
    email: user.email,
    name: user.name,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
  return token;
};

// Read token from Authorization: Bearer or from httpOnly cookie named "token"
const extractTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  // Cookie parser populates req.cookies
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return null;
};

// JWT auth middleware (replaces session/passport)
export const isAuthenticated = async (req, res, next) => {
  try {
    const token = extractTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Option 1: attach minimal user info from token
    // Option 2: fetch full user to ensure fresh data
    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Helper to set JWT as httpOnly cookie
export const setAuthCookie = (res, token) => {
  const isDevelopment = (process.env.NODE_ENV === 'development');
  res.cookie('token', token, {
    httpOnly: true,
    secure: !isDevelopment, // secure in production
    sameSite: isDevelopment ? 'lax' : 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

// Helper to clear JWT cookie
export const clearAuthCookie = (res) => {
  const isDevelopment = (process.env.NODE_ENV === 'development');
  res.clearCookie('token', {
    httpOnly: true,
    secure: !isDevelopment,
    sameSite: isDevelopment ? 'lax' : 'none',
    path: '/',
  });
};