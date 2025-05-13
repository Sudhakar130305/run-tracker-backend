const express = require('express');
const router = express.Router();
const Run = require('../models/Run');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/runs → Log a new run
router.post('/', authMiddleware, async (req, res) => {
  const { distance, time } = req.body;

  try {
    const run = await Run.create({
      user: req.user,  // comes from token (authMiddleware)
      distance,
      time,
    });
    res.status(201).json(run);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/runs → Fetch all runs for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const runs = await Run.find({ user: req.user }).sort({ createdAt: -1 });
    res.json(runs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
// GET /api/runs/stats → Get stats for the logged-in user
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user;
    const runs = await Run.find({ user: userId });

    if (runs.length === 0) {
      return res.status(200).json({
        totalRuns: 0,
        totalDistance: 0,
        avgPace: 0,
        bestRun: null
      });
    }

    let totalDistance = 0;
    let totalTime = 0;
    let bestRun = null;

    runs.forEach(run => {
      totalDistance += run.distance;
      totalTime += run.time;
      const pace = run.time / run.distance;
      if (!bestRun || pace < bestRun.pace) {
        bestRun = {
          distance: run.distance,
          time: run.time,
          pace: pace.toFixed(2),
          date: run.date
        };
      }
    });

    const avgPace = totalTime / totalDistance;

    res.status(200).json({
      totalRuns: runs.length,
      totalDistance: totalDistance.toFixed(2),
      avgPace: avgPace.toFixed(2),
      bestRun
    });
  } catch (err) {
    console.error('Stats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch run stats' });
  }
});
