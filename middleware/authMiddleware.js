const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
  try {
    // Get token from the Authorization header
    const token = req.header('Authorization') && req.header('Authorization').replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    // Verify the token using the JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists with the ID decoded from the token
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user; // Attach user data to the request object for further use
    next(); // Pass the request to the next middleware/route handler
  } catch (err) {
    console.error("❌ Auth middleware error:", err);

    // Handle specific error for expired tokens
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired' });
    }

    // Default error handling for invalid token
    res.status(401).json({ error: 'Token is not valid' });
  }
};

module.exports = auth;
