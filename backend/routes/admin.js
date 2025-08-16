// backend/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// GET /api/admin/users?search=&status=
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

    // Pull only fields that exist in your schema (no extras)
    const users = await User.find(q).select({
      // core
      name: 1,
      email: 1,
      joinDate: 1,
      timezone: 1,
      theme: 1,
      preferences: 1,

      // admin-facing
      role: 1,
      status: 1,
      last_login: 1,

      // privacy/compliance
      consent_given: 1,
      consent_date: 1,
      data_retention_expiry: 1,
      privacy_settings: 1,

      // misc in schema
      location: 1,
      age_verified: 1,

      createdAt: 1, // your toJSON maps this to created_at + id
    });

    // toJSON transform on the model will remove password/_id/version etc.
    res.json({ users });
  } catch (e) {
    console.error("GET /api/admin/users failed:", e);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// POST /api/admin/users/:id/:action  (activate|suspend|deactivate)
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

// POST /api/admin/users/:id/export  (no extra storage, just trigger)
router.post("/users/:id/export", async (req, res) => {
  try {
    // Kick off an export job in your real implementation
    res.json({ ok: true });
  } catch (e) {
    console.error("POST /api/admin/users/:id/export failed:", e);
    res.status(500).json({ error: "Failed to start export" });
  }
});

module.exports = router;
