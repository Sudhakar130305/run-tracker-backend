const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
const authRoutes = require('./routes/auth');
const runRoutes = require('./routes/run');
const statsRoutes = require('./routes/stats');

app.use('/api/auth', authRoutes);
app.use('/api/runs', runRoutes);
app.use('/api/stats', statsRoutes);

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'client/frontend')));

// Root route → serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/frontend/index.html'));
});

// Fallback for unknown routes → serve 404.html if exists
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'client/frontend/404.html'));
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // 30 sec timeout
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
