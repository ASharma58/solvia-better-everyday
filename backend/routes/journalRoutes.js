// routes/journal.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Journal = require('../models/Journal');

const isId = (id) => mongoose.isValidObjectId(id);

// GET by email
router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const entries = await Journal.find({ email }).sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    console.error('Error fetching journals:', err.message);
    res.status(500).json({ message: 'Failed to fetch journals' });
  }
});

// CREATE
router.post('/', async (req, res) => {
  try {
    const payload = req.body; // expects { userId, email, entry, title, mood, favorite?, date? }
    const saved = await new Journal(payload).save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error saving journal:', err.message);
    res.status(400).json({ message: err.message || 'Failed to save journal' });
  }
});

// (Optional) GET all
router.get('/', async (_req, res) => {
  try {
    const entries = await Journal.find().sort({ date: -1 });
    res.json(entries);
  } catch {
    res.status(500).json({ message: 'Failed to fetch journals' });
  }
});

// PATCH/PUT (update allowed fields)
const pickAllowed = (body) => {
  const allowed = ['title','entry','mood','favorite','date'];
  return Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));
};

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isId(id)) return res.status(400).json({ message: 'Invalid id' });
    const doc = await Journal.findByIdAndUpdate(id, pickAllowed(req.body), { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (err) {
    console.error('PATCH error:', err.message);
    res.status(400).json({ message: err.message || 'Update failed' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isId(id)) return res.status(400).json({ message: 'Invalid id' });
    const doc = await Journal.findByIdAndUpdate(id, pickAllowed(req.body), { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (err) {
    console.error('PUT error:', err.message);
    res.status(400).json({ message: err.message || 'Update failed' });
  }
});

// Favorite toggle
router.put('/:id/favorite', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isId(id)) return res.status(400).json({ message: 'Invalid id' });
    const { favorite } = req.body;
    const doc = await Journal.findByIdAndUpdate(id, { favorite: !!favorite }, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (err) {
    console.error('Favorite error:', err.message);
    res.status(400).json({ message: err.message || 'Favorite update failed' });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isId(id)) return res.status(400).json({ message: 'Invalid id' });
    const doc = await Journal.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete error:', err.message);
    res.status(400).json({ message: err.message || 'Delete failed' });
  }
});

module.exports = router;
