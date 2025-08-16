const express = require('express');
const router = express.Router();
const CBTMessage = require('../models/CBTMessage');

// Save a message
router.post('/', async (req, res) => {
  try {
    const message = new CBTMessage(req.body);
    const saved = await message.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(' Failed to save CBT message:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Fetch chat history by user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await CBTMessage.find({ userId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    console.error(' Failed to fetch CBT messages:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
