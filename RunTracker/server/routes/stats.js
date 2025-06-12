const express = require('express');
const router = express.Router();
const Run = require('../models/Run');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/stats → Return user’s running statistics
router.get('/ping', (req, res) => {
  res.send('Stats route working!');
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const runs = await Run.find({ user: req.user });

    if (!runs.length) {
      return res.json({
        totalRuns: 0,
        totalDistance: 0,
        averagePace: null,
        bestRun: null
      });
    }

    const totalRuns = runs.length;
    const totalDistance = runs.reduce((sum, run) => sum + run.distance, 0);
    const totalTime = runs.reduce((sum, run) => sum + run.time, 0); // in minutes
    const averagePace = (totalTime / totalDistance).toFixed(2); // minutes/km
    const bestRun = runs.reduce((best, run) => {
      const pace = run.time / run.distance;
      return pace < best.pace ? { pace, date: run.date } : best;
    }, { pace: Infinity, date: null });

    res.json({
      totalRuns,
      totalDistance,
      averagePace,
      bestRun: bestRun.date ? `${bestRun.pace.toFixed(2)} min/km on ${new Date(bestRun.date).toLocaleDateString()}` : null
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
