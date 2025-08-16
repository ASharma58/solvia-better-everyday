// models/Journal.js
const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  userId: { type: String, required: true, trim: true },
  email:  { type: String, required: true, trim: true },
  entry:  { type: String, required: true, minlength: 5 },
  title:  { type: String, trim: true, maxlength: 100 },
  mood:   {
    type: String,
    enum: [
      'Happy','Sad','Neutral','Grateful','Stressed',
      'Angry','Excited','Tired','Anxious','Other',
    ],
    default: 'Neutral',
  },
  favorite: { type: Boolean, default: false },
  date:     { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.models.Journal || mongoose.model('Journal', journalSchema);
