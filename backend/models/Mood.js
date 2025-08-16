const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    trim: true,
  },
  mood: {
    type: Number,
    required: true,
    min: 1,
    max: 7,
  },
  note: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Mood', moodSchema);
