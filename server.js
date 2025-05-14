const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const runRoutes = require('./routes/run');
const statsRoutes = require('./routes/stats'); // ✅ Add this line
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/runs', runRoutes);
app.use('/api/stats', statsRoutes); // ✅ Register the stats route here

// Serve static files from the frontend folder (client/frontend)
app.use(express.static(path.join(__dirname, 'client/frontend')));

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/frontend/index.html'));
});

// Fallback for other routes (404 page)
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'client/frontend/404.html'));
});

// MongoDB connection with updated timeout
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // Timeout after 30 seconds
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
