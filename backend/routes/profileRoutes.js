const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/profile/:id  -> fetch profile by userId
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Ensure defaults exist
    const profile = {
      name: user.name,
      email: user.email,
      joinDate: user.joinDate || user.createdAt || new Date(),
      timezone: user.timezone || 'UTC-5',
      theme: user.theme || 'light',
      preferences: user.preferences || {
        dailyReminders: true,
        weeklyReports: true,
        emailNotifications: false,
        darkMode: false,
        autoSave: true,
      },
    };
    res.json(profile);
  } catch (err) {
    console.error('Profile GET error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/profile/:id  -> update profile fields
router.put('/:id', async (req, res) => {
  try {
    const { name, timezone, theme, preferences } = req.body;

    const update = {};
    if (name !== undefined) update.name = name;
    if (timezone !== undefined) update.timezone = timezone;
    if (theme !== undefined) update.theme = theme;
    if (preferences !== undefined) update.preferences = preferences;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true, projection: { password: 0 } }
    );

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      message: 'Profile updated',
      user,
    });
  } catch (err) {
    console.error('Profile PUT error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
