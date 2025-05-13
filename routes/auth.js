const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const protect = require('../middleware/authMiddleware'); // Middleware to protect routes

// Protected route: Get user profile
router.get('/profile', protect, async (req, res) => {
  try {
    // Fetch user data without the password
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Return user profile data
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("📩 Incoming registration data:", { name, email });

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create the new user
    const user = new User({ name, email, password }); // Mongoose middleware will hash the password

    // Save user to database
    await user.save();

    // Send success response
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔐 Login attempt for email:", email);

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found for email:", email);
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Verify if the password matches using Mongoose method
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate JWT token without expiry (infinite)
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });




    // Send token and user info
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Check if the user exists
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Generate a new access token
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });




    res.json({ token: newToken });
  } catch (err) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
});

module.exports = router;
