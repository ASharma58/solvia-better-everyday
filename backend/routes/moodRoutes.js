const express = require('express');
const router = express.Router();
const Mood = require('../models/Mood');

router.post('/', async (req, res) => {
  const mood = new Mood(req.body);
  await mood.save();
  res.json({ message: 'Mood saved', mood });
});

router.get('/:userId', async (req, res) => {
  const moods = await Mood.find({ userId: req.params.userId }).sort({ date: -1 });
  res.json(moods);
});

router.get('/', async (req, res) => {
  const allMoods = await Mood.find().sort({ date: -1 });
  res.json(allMoods);
});

module.exports = router;
