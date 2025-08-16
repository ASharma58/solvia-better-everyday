// backend/routes/dashboard.js
const express = require("express");
const router = express.Router();
const Mood = require("../models/Mood");
const Journal = require("../models/Journal");
const CBTMessage = require("../models/CBTMessage");

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // --- for cards & activity ---
    const moods = await Mood.find({ userId }).sort({ date: -1 });
    const journals = await Journal.find({ userId }).sort({ date: -1 });
    const cbtSessions = await CBTMessage.countDocuments({ userId });

    const moodCount = moods.length;
    const journalCount = journals.length;
    const moodAverage =
      moodCount > 0
        ? (moods.reduce((acc, m) => acc + Number(m.mood || 0), 0) / moodCount).toFixed(1)
        : "0.0";

    // --- build fixed last 7 calendar days (local midnight buckets) ---
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      days.push(new Date(d)); // oldest -> newest
    }
    const dayKey = (d) => new Date(d).toLocaleDateString("en-US", { weekday: "short" });
    const since = days[0]; // oldest day start

    // --- get journals & cbt only for last 7 days ---
    const [journals7, cbt7] = await Promise.all([
      Journal.find({ userId, date: { $gte: since } }, { date: 1 }),
      CBTMessage.find({ userId, timestamp: { $gte: since } }, { timestamp: 1 }),
    ]);

    // maps: label -> count
    const journalMap = {};
    const cbtMap = {};
    days.forEach((d) => {
      const k = dayKey(d);
      journalMap[k] = 0;
      cbtMap[k] = 0;
    });

    journals7.forEach((j) => {
      const k = dayKey(j.date);
      if (journalMap[k] != null) journalMap[k] += 1;
    });
    cbt7.forEach((m) => {
      const k = dayKey(m.timestamp);
      if (cbtMap[k] != null) cbtMap[k] += 1;
    });

    // mood of the day: take the latest mood entry inside each day
    const moodByDay = {};
    moods.forEach((m) => {
      const d = new Date(m.date);
      d.setHours(0, 0, 0, 0);
      const label = dayKey(d);
      if (!moodByDay[label] || new Date(m.date) > moodByDay[label].when) {
        moodByDay[label] = { value: Number(m.mood || 0), when: new Date(m.date) };
      }
    });

    const moodTrend = days.map((d) => {
      const label = dayKey(d);
      return {
        day: label,
        mood: moodByDay[label]?.value ?? 0, // your Mood schema is 1–7
        journals: journalMap[label] || 0,
        cbt: cbtMap[label] || 0,
      };
    });

    // recent activity (mix last mood + journal)
    const recentMoodActivity = moods.slice(0, 3).map((entry) => ({
      type: "mood",
      title: entry.note || "Mood Entry",
      time: new Date(entry.date).toLocaleString(),
    }));
    const recentJournalActivity = journals.slice(0, 3).map((entry) => ({
      type: "journal",
      title: entry.title || "Journal Entry",
      time: new Date(entry.date).toLocaleString(),
    }));
    const recentActivity = [...recentMoodActivity, ...recentJournalActivity]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5);

    res.json({
      moodAverage,
      moodCount,
      journalCount,
      cbtSessions,
      moodTrend,               
      recentActivity,
      mindfulMinutes: 0,      
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
});

module.exports = router;
