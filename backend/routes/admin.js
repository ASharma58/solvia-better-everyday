const express = require("express");
const router = express.Router();
const mongoose = require("mongoose"); // ⬅️ added

const User = require("../models/User");
const CBTMessage = require("../models/CBTMessage");
const Mood = require("../models/Mood");

// helper: start-of-day (server local time)
function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// =========================
// GET /api/admin/users?search=&status=
// =========================
router.get("/users", async (req, res) => {
  try {
    const { search = "", status } = req.query;

    const q = {};
    if (search) {
      q.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (status) q.status = status;

    const users = await User.find(q).select({
      name: 1,
      email: 1,
      joinDate: 1,
      timezone: 1,
      theme: 1,
      preferences: 1,
      role: 1,
      status: 1,
      last_login: 1,
      consent_given: 1,
      consent_date: 1,
      data_retention_expiry: 1,
      privacy_settings: 1,
      location: 1,
      age_verified: 1,
      createdAt: 1,
    });

    res.json({ users });
  } catch (e) {
    console.error("GET /api/admin/users failed:", e);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// =========================
// Admin Stats (DOCUMENT COUNTS)
// GET /api/admin/stats
// =========================
router.get("/stats", async (req, res) => {
  try {
    const db = mongoose.connection.db;

    // Use the exact collection names as they appear in MongoDB
    const collections = [
      "users",
      "cbtmessages",
      "journals",
      "mindfulnesscontents",
      "mindfulnesssessions",
      "moods",
    ];

    const counts = {};
    for (const name of collections) {
      counts[name] = await db.collection(name).countDocuments();
    }

    // If you still want “totals” for your existing cards, you can map them:
    // (feel free to remove this block if you only want the raw counts)
    counts.totalUsers = counts.users ?? 0;
    counts.totalCBTSessions = counts.cbtmessages ?? 0;
    counts.totalMoods = counts.moods ?? 0;

    return res.json(counts);
  } catch (e) {
    console.error("GET /api/admin/stats failed:", e);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// =========================
// Recent Activity feed
// GET /api/admin/recent-activity
// =========================
router.get("/recent-activity", async (req, res) => {
  try {
    const [latestUsers, latestMoods, latestCBT] = await Promise.all([
      User.find({}, { name: 1, email: 1, createdAt: 1 })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Mood.find({}, { userId: 1, mood: 1, note: 1, date: 1 })
        .sort({ date: -1 })
        .limit(10)
        .lean(),
      CBTMessage.find({}, { userId: 1, sender: 1, timestamp: 1 })
        .sort({ timestamp: -1 })
        .limit(10)
        .lean(),
    ]);

    const items = [
      ...latestUsers.map((u) => ({
        id: `user-${u._id}`,
        type: "user",
        description: `New user: ${u.name || u.email}`,
        timestamp: u.createdAt,
      })),
      ...latestMoods.map((m) => ({
        id: `mood-${m._id}`,
        type: "mood",
        description: `Mood ${m.mood}/7 ${m.note ? `— ${m.note}` : ""}`,
        timestamp: m.date,
      })),
      ...latestCBT.map((c) => ({
        id: `cbt-${c._id}`,
        type: "cbt",
        description: `CBT ${c.sender === "user" ? "message" : "reply"}`,
        timestamp: c.timestamp,
      })),
    ]
      .filter((x) => x.timestamp)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    res.json(items);
  } catch (e) {
    console.error("GET /api/admin/recent-activity failed:", e);
    res.status(500).json({ error: "Failed to fetch recent activity" });
  }
});

// =========================
// Compliance Alerts
// GET /api/admin/compliance-alerts
// =========================
router.get("/compliance-alerts", async (req, res) => {
  try {
    const now = Date.now();
    const alerts = [
      {
        id: "policy-review",
        title: "Review data retention policy",
        dueDate: new Date(now + 7 * 864e5),
      },
      {
        id: "consent-audit",
        title: "Consent audit sample check",
        dueDate: new Date(now + 14 * 864e5),
      },
    ];
    res.json(alerts);
  } catch (e) {
    console.error("GET /api/admin/compliance-alerts failed:", e);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

// =========================
// POST /api/admin/users/:id/:action
// =========================
router.post("/users/:id/:action", async (req, res) => {
  try {
    const { id, action } = req.params;
    const map = {
      activate: "active",
      suspend: "suspended",
      deactivate: "deactivated",
    };
    const status = map[action];
    if (!status) return res.status(400).json({ error: "Invalid action" });

    await User.updateOne({ _id: id }, { $set: { status } });
    res.json({ ok: true });
  } catch (e) {
    console.error("POST /api/admin/users/:id/:action failed:", e);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// =========================
// POST /api/admin/users/:id/export
// =========================
router.post("/users/:id/export", async (req, res) => {
  try {
    res.json({ ok: true });
  } catch (e) {
    console.error("POST /api/admin/users/:id/export failed:", e);
    res.status(500).json({ error: "Failed to start export" });
  }
});

module.exports = router;
