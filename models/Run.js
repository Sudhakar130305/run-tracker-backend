const mongoose = require('mongoose');

const runSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  distance: { type: Number, required: true }, // in km
  time: { type: Number, required: true },     // in minutes
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Run', runSchema);
