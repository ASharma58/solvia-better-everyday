const mongoose = require('mongoose');

const cbtMessageSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  email: { type: String, required: true },
  sender: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.models.CBTMessage || mongoose.model('CBTMessage', cbtMessageSchema);
